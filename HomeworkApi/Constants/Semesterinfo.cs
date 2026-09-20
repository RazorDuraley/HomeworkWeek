namespace HomeworkApi.Constants;

public static class SemesterInfo
{
    // Первая неделя семестра — понедельник недели A
    public static readonly DateTime Start = new DateTime(2026, 9, 14);

    /// <summary>
    /// 1 = неделя A, 2 = неделя B.
    /// </summary>
    public static int GetWeekNumber(DateTime date)
    {
        var days = (date.Date - Start.Date).Days;
        if (days < 0) return 1;
        var weeks = days / 7;
        return (weeks % 2 == 0) ? 1 : 2;
    }

    /// <summary>
    /// Понедельник недели, в которую попадает дата.
    /// </summary>
    public static DateTime GetWeekStart(DateTime date)
    {
        var diff = ((int)date.DayOfWeek + 6) % 7; // 0 = Пн, 6 = Вс
        return date.Date.AddDays(-diff);
    }
    public static int GetWeekNumber(DateOnly date) => GetWeekNumber(date.ToDateTime(TimeOnly.MinValue));
}