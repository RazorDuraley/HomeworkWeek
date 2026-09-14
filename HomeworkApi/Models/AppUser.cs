using Microsoft.AspNetCore.Identity;

namespace HomeworkApi.Models;

public class AppUser : IdentityUser
{
    public string? DisplayName { get; set; }
}