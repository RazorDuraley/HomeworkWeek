namespace HomeworkApi.DTO;

public class ScheduleEntryDto
{
    public int SubjectId { get; set; }
    public int WeekNumber { get; set; }   // 1 или 2
    public int DayOfWeek { get; set; }    // 1..6 (Пн..Сб) — принимаем числом, чтобы не мучиться с enum из JSON
    public int PairNumber { get; set; }   // 1..6
    public string? LessonType { get; set; }
    public string? Room { get; set; }
    public string? Teacher { get; set; }
}

public class ScheduleEntryResponse
{
    public int Id { get; set; }
    public int SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public int WeekNumber { get; set; }
    public int DayOfWeek { get; set; }
    public string DayOfWeekName { get; set; } = string.Empty;
    public int PairNumber { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string? LessonType { get; set; }
    public string? Room { get; set; }
    public string? Teacher { get; set; }
}

public class ScheduleWeekResponse
{
    public int WeekNumber { get; set; }
    public string WeekStart { get; set; } = string.Empty;
    public List<ScheduleEntryResponse> Entries { get; set; } = new();
}

public class ScheduleNextResponse
{
    public int SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int DayOfWeek { get; set; }
    public string DayOfWeekName { get; set; } = string.Empty;
    public int PairNumber { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string? Room { get; set; }
    public string? Teacher { get; set; }
    public int DaysUntil { get; set; }
}