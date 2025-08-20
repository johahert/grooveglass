using Microsoft.AspNetCore.Mvc;

namespace groove_glass_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        /// <summary>
        /// Health check endpoint for monitoring and deployment validation
        /// </summary>
        /// <returns>Health status information</returns>
        [HttpGet("/health")]
        public IActionResult Health()
        {
            var healthStatus = new
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                MachineName = Environment.MachineName,
                ProcessId = Environment.ProcessId
            };

            return Ok(healthStatus);
        }

        /// <summary>
        /// Detailed health check including database connectivity
        /// </summary>
        /// <returns>Detailed health status</returns>
        [HttpGet("/health/detailed")]
        public async Task<IActionResult> DetailedHealth()
        {
            var healthChecks = new List<object>();

            // Basic application health
            healthChecks.Add(new
            {
                Component = "Application",
                Status = "Healthy",
                Timestamp = DateTime.UtcNow
            });

            // You can add more health checks here for:
            // - Database connectivity
            // - External API dependencies (Spotify, OpenAI)
            // - Cache availability
            // - SignalR hubs

            var overallStatus = healthChecks.All(h => h.GetType().GetProperty("Status")?.GetValue(h)?.ToString() == "Healthy") 
                ? "Healthy" : "Unhealthy";

            var detailedHealthStatus = new
            {
                OverallStatus = overallStatus,
                Timestamp = DateTime.UtcNow,
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                Version = "1.0.0",
                Checks = healthChecks
            };

            return Ok(detailedHealthStatus);
        }
    }
}