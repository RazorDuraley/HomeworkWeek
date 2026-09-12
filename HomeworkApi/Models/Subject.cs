namespace HomeworkApi.Models;

public class Subject
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Homework> Homeworks { get; set; } = new();
}