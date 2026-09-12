using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeworkApi.Data;
using HomeworkApi.Models;

namespace HomeworkApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SubjectsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var subjects = await _context.Subjects.ToListAsync();
        return Ok(subjects);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Subject subject)
    {
        if (string.IsNullOrWhiteSpace(subject.Name))
            return BadRequest(new { message = "Название предмета обязательно" });

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();

        return Ok(subject);
    }
}