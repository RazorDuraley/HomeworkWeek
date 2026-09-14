using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using HomeworkApi.Models;

namespace HomeworkApi.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Homework> Homeworks { get; set; }
    public DbSet<ScheduleEntry> ScheduleEntries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);   // ← ЭТО ВАЖНО для Identity

        modelBuilder.Entity<ScheduleEntry>()
            .HasOne(e => e.Subject)
            .WithMany()
            .HasForeignKey(e => e.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}