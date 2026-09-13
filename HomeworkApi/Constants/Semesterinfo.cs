namespace HomeworkApi.Constants;

public static class SemesterInfo
{
    // Первая неделя семестра (понедельник недели A)
    public static readonly DateTime Start = new DateTime(2026, 9, 14);

    /// <summary>
    /// Возвращает 1 (неделя A) или 2 (неделя B) для указанной даты.
    /// </summary>
    public static int GetWeekNumber(DateTime date)
    {
        var days = (date.Date - Start.Date).Days;
        if (days < 0) return 1; // до начала семестра — считаем неделей A
        var weeks = days / 7;
        return (weeks % 2 == 0) ? 1 : 2;
    }
}