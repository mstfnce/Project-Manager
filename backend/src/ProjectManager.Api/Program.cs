using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProjectManager.Application.Interfaces;
using ProjectManager.Application.Services;
using ProjectManager.Infrastructure.Data;
using ProjectManager.Infrastructure.Repositories;
using ProjectManager.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ---- Servis kayıtları (DI container'a "bunları tanıyorum" diyoruz) ----

builder.Services.AddOpenApi();

// AppDbContext: EF Core'un Postgres'e bağlanma bilgisi (connection string user-secrets'tan gelir).
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Composition Root: interface -> gerçek implementasyon eşleştirmeleri burada yapılıyor.
// Application/Infrastructure hiçbiri bu eşleştirmeyi görmez, sadece bu satırlar bilir.
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<ITokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ProjectService>();

// Task CRUD icin de ayni composition root deseni: TaskService constructor'inda
// hem ITaskRepository hem IProjectRepository istiyor - ikisi de zaten kayitli.
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<TaskService>();

builder.Services.AddScoped<INoteRepository, NoteRepository>();
builder.Services.AddScoped<NoteService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// Controller (AuthController gibi) desteğini aç - .NET 10 webapi şablonu varsayılan açmıyor.
// AddJsonOptions: enum'lar JSON'a sayı değil string olarak yazılsın ("Planning", "Todo").
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddAuthorization();

var app = builder.Build();

// ---- HTTP pipeline (istekler bu sıradan geçer) ----

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
// Gelen istekleri [Route]/[HttpPost] gibi attribute'lara sahip Controller'lara yönlendir.
app.MapControllers();

app.Run();
