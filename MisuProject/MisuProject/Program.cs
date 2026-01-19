using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MisuProject.Data;
using MisuProject.Hubs;
using MisuProject.Models.AuthModels;
using System.Data.SqlTypes;
using System.Text;

//using MisuProject.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("connect")));


//ignore error of json can load roles
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddCors(p => p.AddPolicy("AllowAll",
    policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));
builder.Services.AddEndpointsApiExplorer();


// JWT Authentication setup
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

builder.Services.AddSignalR();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});




builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

   
    db.Database.Migrate();


    if (!db.Roles.Any())
    {
        db.Roles.AddRange(
            new Role { Name = Role.RoleName.User, Level = 1 },
            new Role { Name = Role.RoleName.Admin, Level = 0 }
        );
        db.SaveChanges();
    }
}


// Middleware 
//app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();
app.UseWebSockets();
app.MapHub<ChatHub>("/chatHub");
app.MapControllers();

app.Run();
