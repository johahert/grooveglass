using DatabaseService.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

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
                                .AllowAnyMethod();
                      });
});
// Add services to the container.

builder.Services.AddDbContext<SpotifyDatabaseContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<DatabaseService.Services.Interfaces.ISpotifyStorageService, DatabaseService.Services.Implementations.SpotifyStorageService>();
builder.Services.AddScoped<groove_glass_api.Services.Interfaces.ISpotifyApiService, groove_glass_api.Services.Implementations.SpotifyApiService>();
builder.Services.AddScoped<groove_glass_api.Util.EncryptionHelper>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();

app.Run();
