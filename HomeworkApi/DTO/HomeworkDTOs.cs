namespace HomeworkApi.DTO;

public class HomeworkResponse
{
    public int Id { get; set; }
    public int SubjectId { get; set; }
    public string? SubjectName { get; set; }
    public string Task { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime DueDate { get; set; }
    public bool IsDone { get; set; }

    public string? CreatedByUserId { get; set; }
    public string? CreatedByName { get; set; }
    public bool IsPersonal { get; set; }
}

public class CreateHomeworkDto
{
    public int SubjectId { get; set; }
    public string Task { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime? DueDate { get; set; }       
    public bool UseSchedule { get; set; } = false;
    public bool IsShared { get; set; } = false;
}