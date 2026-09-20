using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeworkApi.Data;
using HomeworkApi.Models;
using Microsoft.AspNetCore.Authorization;
using HomeworkApi.Constants;
using HomeworkApi.DTO;

namespace HomeworkApi.Controllers;

[ApiController]
[Route("api/subjects")]
public class SubjectController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubjectController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/subjects/{id}/info
    [HttpGet("{id}/info")]
    public async Task<ActionResult<SubjectInfoResponse>> GetInfo(int id)
    {
        var subject = await _db.Subjects.FindAsync(id);
        if (subject == null) return NotFound();

        var response = new SubjectInfoResponse
        {
            Id = subject.Id,
            Name = subject.Name,
            Teacher = subject.Teacher,
        };

        var entries = await _db.ScheduleEntries
            .Where(e => e.SubjectId == id)
            .ToListAsync();

        if (entries.Count > 0)
        {
            var today = DateTime.SpecifyKind(DateTime.Now.Date, DateTimeKind.Unspecified);

            for (int offset = 1; offset < 28; offset++)
            {
                var checkDate = today.AddDays(offset);
                var weekNumber = SemesterInfo.GetWeekNumber(checkDate);
                var dayOfWeek = (int)checkDate.DayOfWeek;
                if (dayOfWeek == 0) continue;

                var match = entries
                    .Where(e => e.WeekNumber == weekNumber && (int)e.DayOfWeek == dayOfWeek)
                    .OrderBy(e => e.PairNumber)
                    .FirstOrDefault();

                if (match != null)
                {
                    var times = PairTimes.Get(match.PairNumber);
                    response.NextPairDate = checkDate.ToString("yyyy-MM-dd");
                    response.NextPairDayOfWeek = checkDate.ToString("dddd", new System.Globalization.CultureInfo("ru-RU"));
                    response.NextPairNumber = match.PairNumber;
                    response.NextPairTime = times != null
                        ? $"{times.Value.Start:hh\\:mm}–{times.Value.End:hh\\:mm}"
                        : null;
                    response.NextPairRoom = match.Room;
                    response.NextPairTeacher = match.Teacher;
                    break;
                }
            }
        }

        return response;
    }

    // GET /api/subjects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Subject>>> GetAll()
    {
        return await _db.Subjects.AsNoTracking().ToListAsync();
    }

    // GET /api/subjects/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Subject>> GetById(int id)
    {
        var subject = await _db.Subjects.FindAsync(id);
        if (subject == null) return NotFound();
        return subject;
    }

    // POST /api/subjects
    [HttpPost]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<ActionResult<Subject>> Create([FromBody] SubjectDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required");

        var subject = new Subject
        {
            Name = dto.Name.Trim(),
            Teacher = string.IsNullOrWhiteSpace(dto.Teacher) ? null : dto.Teacher.Trim()
        };

        _db.Subjects.Add(subject);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = subject.Id }, subject);
    }

    // PUT /api/subjects/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Update(int id, [FromBody] SubjectDto dto)
    {
        var subject = await _db.Subjects.FindAsync(id);
        if (subject == null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required");

        subject.Name = dto.Name.Trim();
        subject.Teacher = string.IsNullOrWhiteSpace(dto.Teacher) ? null : dto.Teacher.Trim();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/subjects/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Delete(int id)
    {
        var subject = await _db.Subjects
            .Include(s => s.Homeworks)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (subject == null) return NotFound();

        // Если у предмета есть домашки — либо удаляем каскадно, либо запрещаем.
        // Сейчас: запрещаем удаление, если есть связанные домашки.
        if (subject.Homeworks.Any())
            return Conflict("Нельзя удалить предмет: к нему привязаны задания");

        _db.Subjects.Remove(subject);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// DTO для создания/обновления
public class SubjectDto
{
    public string Name { get; set; } = string.Empty;
    public string? Teacher { get; set; }
}