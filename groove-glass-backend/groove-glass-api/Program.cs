using DatabaseService.Models;
using DatabaseService.Models.Entities;
using DatabaseService.Services.Implementations;
using DatabaseService.Services.Interfaces;
using groove_glass_api.Models.QuizRoomModels;
using groove_glass_api.Services.Implementations;
using groove_glass_api.Services.Interfaces;
using groove_glass_api.Util;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OpenAI.Chat;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
ConfigurationManager configuration = builder.Configuration;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          // Add your frontend's origins here. 
                          // Using both localhost and 127.0.0.1 is a good practice.
                          policy.WithOrigins("http://127.0.0.1:8080",
                                             "http://localhost:8080",
                                             "http://localhost:3000") // A common port for React dev
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .AllowCredentials();
                      });
});
// Add services to the container.

builder.Services.AddDbContext<SpotifyDatabaseContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ISpotifyApiService, SpotifyApiService>();
builder.Services.AddScoped<EncryptionHelper>();
builder.Services.AddScoped<IOpenAiApiService, OpenAiApiService>();

// Register concrete services
builder.Services.AddScoped<QuizStorageService>();
builder.Services.AddScoped<UserStorageService>();

// Register interfaces
builder.Services.AddScoped<IQuizStorageService, QuizStorageService>();
builder.Services.AddScoped<IEntityStorageService<SpotifyUser, string>, UserStorageService>();
builder.Services.AddScoped<IEntityStorageService<Quiz, int>, QuizStorageService>();

builder.Services.AddScoped<SpotifyAccessTokenService>();
builder.Services.AddScoped<IAuthenticateSpotifyUserService, AuthenticateSpotifyUserService>();

// Keep the old interface for backward compatibility if needed
builder.Services.AddScoped<ISpotifyStorageService, SpotifyStorageService>();

builder.Services.AddSingleton<ChatClient>(serviceProvider =>
{
    var apiKey = builder.Configuration["OpenAi:Key"];
    var model = "gpt-4o-mini";
    return new ChatClient(
        model: model,
        apiKey: apiKey
    );
});

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
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = false, // Set to true and configure if you use audience
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"])),
        ValidateIssuerSigningKey = true
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            // Log the exception or handle it as needed
            Console.WriteLine("Authentication failed: " + context.Exception.Message);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Authentication succeeded: " + context.SecurityToken.Id);
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });

    // Add JWT Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
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
            new string[] {}
        }
    });
});
builder.Services.AddHttpClient();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();

app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();
app.MapHub<QuizRoomHub>("/quizroomhub");

app.Run();
