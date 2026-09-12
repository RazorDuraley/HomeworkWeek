using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeworkApi.Data;
using HomeworkApi.Models;

namespace HomeworkApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeworkController : ControllerBase
{
    private readonly AppDbContext _context;

    public HomeworkController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tasks = await _context.Homeworks
            .Include(h => h.Subject)
            .OrderBy(h => h.DueDate)
            .ToListAsync();
        return Ok(tasks);
    }

    [HttpGet("week")]
    public async Task<IActionResult> GetWeek()
    {
        var today = DateTime.Today;
        var endOfWeek = today.AddDays(7);

        var tasks = await _context.Homeworks
            .Include(h => h.Subject)
            .Where(h => h.DueDate >= today && h.DueDate <= endOfWeek)
            .OrderBy(h => h.DueDate)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Homework homework)
    {
        if (string.IsNullOrWhiteSpace(homework.Task))
            return BadRequest(new { message = "Задание обязательно" });

        _context.Homeworks.Add(homework);
        await _context.SaveChangesAsync();

        return Ok(homework);
    }

    [HttpPut("{id}/done")]
    public async Task<IActionResult> MarkAsDone(int id)
    {
        var homework = await _context.Homeworks.FindAsync(id);
        if (homework == null)
            return NotFound(new { message = "Задание не найдено" });

        homework.IsDone = !homework.IsDone;
        await _context.SaveChangesAsync();

        return Ok(homework);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var homework = await _context.Homeworks.FindAsync(id);
        if (homework == null)
            return NotFound(new { message = "Задание не найдено" });

        _context.Homeworks.Remove(homework);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Задание удалено" });
    }
}