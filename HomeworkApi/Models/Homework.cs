using System.Text.Json.Serialization;

namespace HomeworkApi.Models;

public class Homework
{
    public int Id { get; set; }
    public string Task { get; set; } = string.Empty;
    public DateOnly DueDate { get; set; }       
    public bool IsDone { get; set; } = false;
    public string? Comment { get; set; }

    public int SubjectId { get; set; }

    [JsonIgnore]
    public Subject? Subject { get; set; }

    public string? CreatedByUserId { get; set; }
    public bool IsPersonal { get; set; }
}