using HomeworkApi.Data;
using HomeworkApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Вставь JWT токен (без 'Bearer ', он подставится сам)"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// === PostgreSQL / Supabase ===
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? "Host=localhost;Database=homework;Username=postgres;Password=postgres";



// Npgsql не понимает формат "postgresql://..." — конвертируем в ADO.NET-формат
if (connectionString.StartsWith("postgresql://") || connectionString.StartsWith("postgres://"))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);
    connectionString =
        $"Host={uri.Host};" +
        $"Port={uri.Port};" +
        $"Database={uri.AbsolutePath.TrimStart('/')};" +
        $"Username={userInfo[0]};" +
        $"Password={userInfo[1]};" +
        $"SSL Mode=Require;Trust Server Certificate=true;";
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Identity
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireNonAlphanumeric = false; // для простоты
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// JWT
var jwtKey = builder.Configuration["JWT_KEY"] ?? "dev_key_change_me_1234567890_1234567890";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

var app = builder.Build();

app.UseAuthentication(); // ← обязательно перед UseAuthorization
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    await RoleSeeder.SeedAsync(scope.ServiceProvider);
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://+:{port}");

// Swagger доступен и в Production, чтобы можно было тестировать с телефона
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");
// app.UseHttpsRedirection(); // отключено для Docker
app.UseAuthorization();
app.MapControllers();

app.Run();