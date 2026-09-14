using Microsoft.AspNetCore.Identity;

namespace HomeworkApi.Data;

public static class RoleSeeder
{
    // Твой userId — сюда можно добавить ещё админов через запятую
    private static readonly string[] AdminUserIds = new[]
    {
        "a770c6f8-0471-44a5-b536-41d383722f48"
    };

    public static readonly string[] Roles = { "Admin", "Moderator", "User" };

    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<Models.AppUser>>();

        // 1. Создаём роли, если их нет
        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // 2. Назначаем админов
        foreach (var userId in AdminUserIds)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user != null && !await userManager.IsInRoleAsync(user, "Admin"))
            {
                await userManager.AddToRoleAsync(user, "Admin");
            }
        }

        // 3. Всем остальным — роль User (если ещё нет)
        // Это не обязательно, но полезно для порядка.
        var allUsers = userManager.Users.ToList();
        foreach (var user in allUsers)
        {
            var roles = await userManager.GetRolesAsync(user);
            if (roles.Count == 0)
                await userManager.AddToRoleAsync(user, "User");
        }
    }
}