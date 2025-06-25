using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace groove_glass_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpotifyAuthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public SpotifyAuthController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }




    }
}
