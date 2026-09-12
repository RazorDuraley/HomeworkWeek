using Microsoft.EntityFrameworkCore;
using HomeworkApi.Models;

namespace HomeworkApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Homework> Homeworks { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Homework>()
            .HasOne(h => h.Subject)
            .WithMany(s => s.Homeworks)
            .HasForeignKey(h => h.SubjectId);
    }
}
