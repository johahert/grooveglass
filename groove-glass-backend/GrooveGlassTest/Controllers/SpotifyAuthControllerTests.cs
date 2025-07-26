using System.Threading.Tasks;
using groove_glass_api.Controllers;
using groove_glass_api.Models;
using groove_glass_api.Util;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using DatabaseService.Models.Entities;
using groove_glass_api.Services.Interfaces;
using DatabaseService.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using groove_glass_api.Models.Frontend;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using groove_glass_api.Models.Frontend.QuizData;

namespace GrooveGlassTest.Controllers
{
    public class SpotifyAuthControllerTests
    {
        private static EncryptionHelper GetEncryptionHelper()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    {"EncryptionKey", "TestEncryptionKey1234567890"},
                    {"Jwt:Key", Convert.ToBase64String(new byte[32] { 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32 })},
                    {"Jwt:Issuer", "TestIssuer"}
                })
                .Build();
            return new EncryptionHelper(config);
        }


        [Fact]
        public async Task LoginSpotifyUser_ValidCode_ReturnsJwtTokenAndDisplayName()
        {
            // Arrange
            var testUserId = "user123";
            var testDisplayName = "Test User";
            var testAccessToken = "access";
            var testRefreshToken = "refresh";
            var testJwtKey = Convert.ToBase64String(new byte[32] { 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32 });

            var spotifyApiServiceMock = new Mock<ISpotifyApiService>();
            var spotifyStorageServiceMock = new Mock<ISpotifyStorageService>();

            var encryptionHelper = GetEncryptionHelper();

            var tokenResponse = new SpotifyTokenResponse
            {
                AccessToken = testAccessToken,
                RefreshToken = testRefreshToken,
                ExpiresIn = 3600
            };

            var profileResponse = new groove_glass_api.Models.SpotifyUserProfileResponse
            {
                SpotifyUserId = testUserId,
                DisplayName = testDisplayName,
                Token = tokenResponse
            };

            spotifyApiServiceMock
                .Setup(x => x.ExchangeCodeAndGetProfileAsync(It.IsAny<string>()))
                .ReturnsAsync(profileResponse);

            spotifyStorageServiceMock
                .Setup(x => x.StoreOrUpdateUserAsync(It.IsAny<SpotifyUser>()))
                .Returns(Task.CompletedTask);

            spotifyStorageServiceMock
                .Setup(x => x.GetUserAsync(testUserId))
                .ReturnsAsync(new SpotifyUser
                {
                    SpotifyUserId = testUserId,
                    DisplayName = testDisplayName,
                    EncryptedAccessToken = encryptionHelper.EncryptString(testAccessToken),
                    EncryptedRefreshToken = encryptionHelper.EncryptString(testRefreshToken),
                    TokenExpiration = System.DateTime.UtcNow.AddHours(1)
                });

            var controller = new SpotifyAuthController(
                spotifyApiServiceMock.Object,
                encryptionHelper,
                spotifyStorageServiceMock.Object
            );

            var request = new TokenRequest { Code = "valid_code" };

            // Act
            var result = await controller.LoginSpotifyUser(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic response = (SpotifyUserClientResponse)okResult.Value;
            Assert.Equal(testDisplayName, response?.DisplayName);
            Assert.False(string.IsNullOrEmpty(response?.JwtToken));
        }

        [Fact]
        public async Task CreateQuiz_ValidQuiz_ReturnsOk()
        {
            // Arrange
            var mockStorage = new Mock<ISpotifyStorageService>();
            var mockApi = new Mock<ISpotifyApiService>();
            var mockEncryption = GetEncryptionHelper();
            var controller = new SpotifyAuthController(mockApi.Object, mockEncryption, mockStorage.Object);

            var quizContent = new QuizContent
            {
                Title = "Test Quiz",
                Questions = new List<QuestionContent>
                {
                    new QuestionContent
                    {
                        Question = "Q1",
                        Answers = new List<string> { "A", "B", "C" },
                        CorrectAnswer = 0,
                        SpotifyTrack = "track1"
                    }
                }
            };

            // Simulate authenticated user
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "user123")
            }, "mock"));
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CreateQuiz(quizContent);

            // Assert
            mockStorage.Verify(s => s.StoreQuizAsync(It.IsAny<Quiz>()), Times.Once);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task CreateQuiz_InvalidQuiz_ReturnsBadRequest()
        {
            // Arrange
            var mockStorage = new Mock<ISpotifyStorageService>();
            var mockApi = new Mock<ISpotifyApiService>();
            var mockEncryption = GetEncryptionHelper();
            var controller = new SpotifyAuthController(mockApi.Object, mockEncryption, mockStorage.Object);

            // Simulate authenticated user
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "user123")
            }, "mock"));
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.CreateQuiz(null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateQuiz_Unauthorized_ReturnsUnauthorized()
        {
            // Arrange
            var mockStorage = new Mock<ISpotifyStorageService>();
            var mockApi = new Mock<ISpotifyApiService>();
            var mockEncryption = GetEncryptionHelper();
            var controller = new SpotifyAuthController(mockApi.Object, mockEncryption, mockStorage.Object);

            // No user claims
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
            };

            var quizContent = new QuizContent
            {
                Title = "Test Quiz",
                Questions = new List<QuestionContent>
                {
                    new QuestionContent
                    {
                        Question = "Q1",
                        Answers = new List<string> { "A", "B", "C" },
                        CorrectAnswer = 0,
                        SpotifyTrack = "track1"
                    }
                }
            };

            // Act
            var result = await controller.CreateQuiz(quizContent);

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }
    }
}