namespace HomeworkApi.Models;

public class ScheduleEntry
{
    public int Id { get; set; }

    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    // 1 = неделя A, 2 = неделя B
    public int WeekNumber { get; set; }

    // DayOfWeek.Monday .. DayOfWeek.Saturday
    public DayOfWeek DayOfWeek { get; set; }

    // 1..6
    public int PairNumber { get; set; }

    // "Лекционные занятия" / "Практические занятия" / "Лабораторные работы" / ...
    public string? LessonType { get; set; }

    // "а.450 (К.5)"
    public string? Room { get; set; }

    // Все преподы одной строкой, через запятую
    public string? Teacher { get; set; }
}