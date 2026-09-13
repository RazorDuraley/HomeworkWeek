namespace HomeworkApi.Constants;

public static class PairTimes
{
    public static readonly Dictionary<int, (TimeSpan Start, TimeSpan End)> Times = new()
    {
        [1] = (new TimeSpan(8, 0, 0), new TimeSpan(9, 35, 0)),
        [2] = (new TimeSpan(9, 50, 0), new TimeSpan(11, 25, 0)),
        [3] = (new TimeSpan(11, 40, 0), new TimeSpan(13, 15, 0)),
        [4] = (new TimeSpan(13, 45, 0), new TimeSpan(15, 20, 0)),
        [5] = (new TimeSpan(15, 35, 0), new TimeSpan(17, 10, 0)),
        [6] = (new TimeSpan(17, 25, 0), new TimeSpan(19, 0, 0)),
    };

    public static (TimeSpan Start, TimeSpan End)? Get(int pairNumber)
        => Times.TryGetValue(pairNumber, out var t) ? t : null;
}