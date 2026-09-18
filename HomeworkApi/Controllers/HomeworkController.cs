using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using HomeworkApi.Data;
using HomeworkApi.DTO;
using HomeworkApi.Models;

namespace HomeworkApi.Controllers;

[ApiController]
[Route("api/homework")]
public class HomeworkController : ControllerBase
{
    private readonly AppDbContext _db;

    public HomeworkController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/homework
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HomeworkResponse>>> GetAll()
    {
        var homeworks = await _db.Homeworks
            .Include(h => h.Subject)
            .OrderBy(h => h.DueDate)
            .ToListAsync();

        // Собираем список userId, чтобы получить имена
        var userIds = homeworks
            .Where(h => h.CreatedByUserId != null)
            .Select(h => h.CreatedByUserId!)
            .Distinct()
            .ToList();

        var users = await _db.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName ?? u.Email ?? "—");

        return homeworks.Select(h => new HomeworkResponse
        {
            Id = h.Id,
            SubjectId = h.SubjectId,
            SubjectName = h.Subject?.Name,
            Task = h.Task,
            Comment = h.Comment,
            DueDate = h.DueDate,
            IsDone = h.IsDone,
            CreatedByUserId = h.CreatedByUserId,
            CreatedByName = h.CreatedByUserId != null && users.ContainsKey(h.CreatedByUserId)
                ? users[h.CreatedByUserId]
                : null,
            IsPersonal = h.IsPersonal,
        }).ToList();
    }

    // POST /api/homework
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<HomeworkResponse>> Create([FromBody] CreateHomeworkDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Task))
            return BadRequest("Task is required");

        var subject = await _db.Subjects.FindAsync(dto.SubjectId);
        if (subject == null) return BadRequest("Subject not found");

        DateTime dueDate;
        if (dto.UseSchedule)
        {
            // вычислим дату по расписанию (следующая пара)
            var next = await GetNextScheduleDate(dto.SubjectId);
            if (next == null)
                return BadRequest("У предмета нет пар в расписании, укажи дату вручную");
            dueDate = next.Value;
        }
        else
        {
            if (dto.DueDate == null)
                return BadRequest("Укажи DueDate или UseSchedule=true");
            dueDate = dto.DueDate.Value;
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var homework = new Homework
        {
            SubjectId = dto.SubjectId,
            Task = dto.Task.Trim(),
            Comment = dto.Comment?.Trim(),
            DueDate = dueDate,
            IsDone = false,
            CreatedByUserId = userId,
            IsPersonal = true,   // пока все домашки личные
        };

        _db.Homeworks.Add(homework);
        await _db.SaveChangesAsync();

        // Загружаем subject для ответа
        await _db.Entry(homework).Reference(h => h.Subject).LoadAsync();

        return Ok(new HomeworkResponse
        {
            Id = homework.Id,
            SubjectId = homework.SubjectId,
            SubjectName = homework.Subject?.Name,
            Task = homework.Task,
            Comment = homework.Comment,
            DueDate = homework.DueDate,
            IsDone = homework.IsDone,
            CreatedByUserId = homework.CreatedByUserId,
            IsPersonal = homework.IsPersonal,
        });
    }

    // PUT /api/homework/{id}/done
    [HttpPut("{id}/done")]
    [Authorize]
    public async Task<IActionResult> ToggleDone(int id)
    {
        var homework = await _db.Homeworks.FindAsync(id);
        if (homework == null) return NotFound();

        homework.IsDone = !homework.IsDone;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/homework/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var homework = await _db.Homeworks.FindAsync(id);
        if (homework == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Moderator");

        // только автор или админ может удалить
        if (homework.CreatedByUserId != userId && !isAdmin)
            return Forbid();

        _db.Homeworks.Remove(homework);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Вспомогательный метод: дата следующей пары по предмету
    private async Task<DateTime?> GetNextScheduleDate(int subjectId)
    {
        var entries = await _db.ScheduleEntries
            .Where(e => e.SubjectId == subjectId)
            .ToListAsync();

        if (entries.Count == 0) return null;

        var today = DateTime.UtcNow.Date;

        for (int offset = 0; offset < 28; offset++)
        {
            var checkDate = today.AddDays(offset);
            var weekNumber = HomeworkApi.Constants.SemesterInfo.GetWeekNumber(checkDate);
            var dayOfWeek = (int)checkDate.DayOfWeek;
            if (dayOfWeek == 0) continue;

            var match = entries
                .Where(e => e.WeekNumber == weekNumber && (int)e.DayOfWeek == dayOfWeek)
                .OrderBy(e => e.PairNumber)
                .FirstOrDefault();

            if (match != null) return checkDate;
        }

        return null;
    }
}