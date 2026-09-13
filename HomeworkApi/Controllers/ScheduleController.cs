using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeworkApi.Constants;
using HomeworkApi.Data;
using HomeworkApi.Models;

namespace HomeworkApi.Controllers;

[ApiController]
[Route("api/schedule")]
public class ScheduleController : ControllerBase
{
    private readonly AppDbContext _db;

    public ScheduleController(AppDbContext db)
    {
        _db = db;
    }

    // === Вспомогательные ===

    private static string DayName(int d) => d switch
    {
        1 => "Понедельник",
        2 => "Вторник",
        3 => "Среда",
        4 => "Четверг",
        5 => "Пятница",
        6 => "Суббота",
        7 => "Воскресенье",
        _ => ""
    };

    private static ScheduleEntryResponse ToResponse(ScheduleEntry e, string subjectName)
    {
        var times = PairTimes.Get(e.PairNumber);
        return new ScheduleEntryResponse
        {
            Id = e.Id,
            SubjectId = e.SubjectId,
            SubjectName = subjectName,
            WeekNumber = e.WeekNumber,
            DayOfWeek = (int)e.DayOfWeek,
            DayOfWeekName = DayName((int)e.DayOfWeek),
            PairNumber = e.PairNumber,
            StartTime = times?.Start.ToString(@"hh\:mm") ?? "",
            EndTime = times?.End.ToString(@"hh\:mm") ?? "",
            LessonType = e.LessonType,
            Room = e.Room,
            Teacher = e.Teacher,
        };
    }

    // === CRUD ===

    // GET /api/schedule
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ScheduleEntryResponse>>> GetAll()
    {
        var entries = await _db.ScheduleEntries
            .Include(e => e.Subject)
            .OrderBy(e => e.WeekNumber)
            .ThenBy(e => e.DayOfWeek)
            .ThenBy(e => e.PairNumber)
            .ToListAsync();

        return entries
            .Select(e => ToResponse(e, e.Subject?.Name ?? ""))
            .ToList();
    }

    // GET /api/schedule/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ScheduleEntryResponse>> GetById(int id)
    {
        var e = await _db.ScheduleEntries
            .Include(x => x.Subject)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (e == null) return NotFound();
        return ToResponse(e, e.Subject?.Name ?? "");
    }

    // POST /api/schedule
    [HttpPost]
    public async Task<ActionResult<ScheduleEntryResponse>> Create([FromBody] ScheduleEntryDto dto)
    {
        if (dto.WeekNumber is not (1 or 2))
            return BadRequest("WeekNumber must be 1 or 2");
        if (dto.DayOfWeek is < 1 or > 6)
            return BadRequest("DayOfWeek must be 1..6 (Пн..Сб)");
        if (dto.PairNumber is < 1 or > 6)
            return BadRequest("PairNumber must be 1..6");

        var subject = await _db.Subjects.FindAsync(dto.SubjectId);
        if (subject == null) return BadRequest("Subject not found");

        var entry = new ScheduleEntry
        {
            SubjectId = dto.SubjectId,
            WeekNumber = dto.WeekNumber,
            DayOfWeek = (DayOfWeek)dto.DayOfWeek,
            PairNumber = dto.PairNumber,
            LessonType = dto.LessonType,
            Room = dto.Room,
            Teacher = dto.Teacher,
        };

        _db.ScheduleEntries.Add(entry);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = entry.Id },
            ToResponse(entry, subject.Name));
    }

    // PUT /api/schedule/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ScheduleEntryDto dto)
    {
        var entry = await _db.ScheduleEntries.FindAsync(id);
        if (entry == null) return NotFound();

        if (dto.WeekNumber is not (1 or 2)) return BadRequest("WeekNumber must be 1 or 2");
        if (dto.DayOfWeek is < 1 or > 6) return BadRequest("DayOfWeek must be 1..6");
        if (dto.PairNumber is < 1 or > 6) return BadRequest("PairNumber must be 1..6");

        var subject = await _db.Subjects.FindAsync(dto.SubjectId);
        if (subject == null) return BadRequest("Subject not found");

        entry.SubjectId = dto.SubjectId;
        entry.WeekNumber = dto.WeekNumber;
        entry.DayOfWeek = (DayOfWeek)dto.DayOfWeek;
        entry.PairNumber = dto.PairNumber;
        entry.LessonType = dto.LessonType;
        entry.Room = dto.Room;
        entry.Teacher = dto.Teacher;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/schedule/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entry = await _db.ScheduleEntries.FindAsync(id);
        if (entry == null) return NotFound();

        _db.ScheduleEntries.Remove(entry);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // === Вычисляемые ===

    // GET /api/schedule/week?date=2026-09-15
    [HttpGet("week")]
    public async Task<ActionResult<ScheduleWeekResponse>> GetWeek([FromQuery] DateTime? date)
    {
        var target = date?.Date ?? DateTime.UtcNow.Date;
        var weekNumber = SemesterInfo.GetWeekNumber(target);
        var weekStart = SemesterInfo.GetWeekStart(target);

        var entries = await _db.ScheduleEntries
            .Include(e => e.Subject)
            .Where(e => e.WeekNumber == weekNumber)
            .OrderBy(e => e.DayOfWeek)
            .ThenBy(e => e.PairNumber)
            .ToListAsync();

        return new ScheduleWeekResponse
        {
            WeekNumber = weekNumber,
            WeekStart = weekStart.ToString("yyyy-MM-dd"),
            Entries = entries.Select(e => ToResponse(e, e.Subject?.Name ?? "")).ToList(),
        };
    }

    // GET /api/schedule/today
    [HttpGet("today")]
    public async Task<ActionResult<IEnumerable<ScheduleEntryResponse>>> GetToday()
    {
        var today = DateTime.UtcNow.Date;
        var weekNumber = SemesterInfo.GetWeekNumber(today);
        var dayOfWeek = (int)today.DayOfWeek; // 0 = Вс, 1 = Пн, ...
        if (dayOfWeek == 0) return new List<ScheduleEntryResponse>(); // воскресенье — пусто

        var entries = await _db.ScheduleEntries
            .Include(e => e.Subject)
            .Where(e => e.WeekNumber == weekNumber && (int)e.DayOfWeek == dayOfWeek)
            .OrderBy(e => e.PairNumber)
            .ToListAsync();

        return entries.Select(e => ToResponse(e, e.Subject?.Name ?? "")).ToList();
    }

    // GET /api/schedule/next/{subjectId}
    [HttpGet("next/{subjectId}")]
    public async Task<ActionResult<ScheduleNextResponse>> GetNext(int subjectId)
    {
        var subject = await _db.Subjects.FindAsync(subjectId);
        if (subject == null) return NotFound("Subject not found");

        var entries = await _db.ScheduleEntries
            .Where(e => e.SubjectId == subjectId)
            .ToListAsync();

        if (entries.Count == 0)
            return NotFound("У предмета нет пар в расписании");

        var today = DateTime.UtcNow.Date;

        // Ищем ближайшую будущую пару в пределах 4 недель вперёд
        for (int offset = 0; offset < 28; offset++)
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
                return new ScheduleNextResponse
                {
                    SubjectId = subject.Id,
                    SubjectName = subject.Name,
                    Date = checkDate,
                    DayOfWeek = dayOfWeek,
                    DayOfWeekName = DayName(dayOfWeek),
                    PairNumber = match.PairNumber,
                    StartTime = times?.Start.ToString(@"hh\:mm") ?? "",
                    EndTime = times?.End.ToString(@"hh\:mm") ?? "",
                    Room = match.Room,
                    Teacher = match.Teacher,
                    DaysUntil = offset,
                };
            }
        }

        return NotFound("У предмета нет пар в ближайшие 4 недели");
    }
}