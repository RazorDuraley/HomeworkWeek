namespace HomeworkApi.DTO;

public class SubjectInfoResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Teacher { get; set; }

    public string? NextPairDate { get; set; }     
    public string? NextPairDayOfWeek { get; set; }  
    public int? NextPairNumber { get; set; }
    public string? NextPairTime { get; set; }      
    public string? NextPairRoom { get; set; }
    public string? NextPairTeacher { get; set; }
}