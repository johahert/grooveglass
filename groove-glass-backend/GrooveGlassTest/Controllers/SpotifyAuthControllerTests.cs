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

            var spotifyApiServiceMock = new Mock<ISpotifyApiService>();
            var userStorageServiceMock = new Mock<IEntityStorageService<SpotifyUser, string>>();
            var quizStorageServiceMock = new Mock<IQuizStorageService>();
            var authenticateSpotifyUserServiceMock = new Mock<IAuthenticateSpotifyUserService>();

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

            userStorageServiceMock
                .Setup(x => x.StoreOrUpdateAsync(It.IsAny<SpotifyUser>()))
                .Returns(Task.CompletedTask);

            var controller = new SpotifyAuthController(
                spotifyApiServiceMock.Object,
                encryptionHelper,
                authenticateSpotifyUserServiceMock.Object,
                quizStorageServiceMock.Object,
                userStorageServiceMock.Object
            );

            var request = new TokenRequest { Code = "valid_code" };

            // Act
            var result = await controller.LoginSpotifyUser(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<SpotifyUserClientResponse>(okResult.Value);
            Assert.Equal(testDisplayName, response.DisplayName);
            Assert.False(string.IsNullOrEmpty(response.JwtToken));
            
            // Verify that the user storage service was called
            userStorageServiceMock.Verify(x => x.StoreOrUpdateAsync(It.IsAny<SpotifyUser>()), Times.Once);
        }

        [Fact]
        public async Task CreateQuiz_ValidQuiz_ReturnsOk()
        {
            // Arrange
            var spotifyApiServiceMock = new Mock<ISpotifyApiService>();
            var userStorageServiceMock = new Mock<IEntityStorageService<SpotifyUser, string>>();
            var quizStorageServiceMock = new Mock<IQuizStorageService>();
            var authenticateSpotifyUserServiceMock = new Mock<IAuthenticateSpotifyUserService>();
            var encryptionHelper = GetEncryptionHelper();

            var controller = new SpotifyAuthController(
                spotifyApiServiceMock.Object,
                encryptionHelper,
                authenticateSpotifyUserServiceMock.Object,
                quizStorageServiceMock.Object,
                userStorageServiceMock.Object
            );

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

            quizStorageServiceMock
                .Setup(x => x.StoreOrUpdateAsync(It.IsAny<Quiz>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await controller.CreateQuiz(quizContent);

            // Assert
            quizStorageServiceMock.Verify(s => s.StoreOrUpdateAsync(It.IsAny<Quiz>()), Times.Once);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task CreateQuiz_InvalidQuiz_ReturnsBadRequest()
        {
            // Arrange
            var spotifyApiServiceMock = new Mock<ISpotifyApiService>();
            var userStorageServiceMock = new Mock<IEntityStorageService<SpotifyUser, string>>();
            var quizStorageServiceMock = new Mock<IQuizStorageService>();
            var authenticateSpotifyUserServiceMock = new Mock<IAuthenticateSpotifyUserService>();
            var encryptionHelper = GetEncryptionHelper();

            var controller = new SpotifyAuthController(
                spotifyApiServiceMock.Object,
                encryptionHelper,
                authenticateSpotifyUserServiceMock.Object,
                quizStorageServiceMock.Object,
                userStorageServiceMock.Object
            );

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
            var spotifyApiServiceMock = new Mock<ISpotifyApiService>();
            var userStorageServiceMock = new Mock<IEntityStorageService<SpotifyUser, string>>();
            var quizStorageServiceMock = new Mock<IQuizStorageService>();
            var authenticateSpotifyUserServiceMock = new Mock<IAuthenticateSpotifyUserService>();
            var encryptionHelper = GetEncryptionHelper();

            var controller = new SpotifyAuthController(
                spotifyApiServiceMock.Object,
                encryptionHelper,
                authenticateSpotifyUserServiceMock.Object,
                quizStorageServiceMock.Object,
                userStorageServiceMock.Object
            );

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

        [Fact]
        public async Task RefreshJwtToken_ValidRequest_ReturnsNewTokens()
        {
            // Arrange
            var testUserId = "user123";
            var testDisplayName = "Test User";
            var testRefreshToken = "valid_refresh_token";

            var spotifyApiServiceMock = new Mock<ISpotifyApiService>();
            var userStorageServiceMock = new Mock<IEntityStorageService<SpotifyUser, string>>();
            var quizStorageServiceMock = new Mock<IQuizStorageService>();
            var authenticateSpotifyUserServiceMock = new Mock<IAuthenticateSpotifyUserService>();
            var encryptionHelper = GetEncryptionHelper();

            var existingUser = new SpotifyUser
            {
                SpotifyUserId = testUserId,
                DisplayName = testDisplayName,
                JwtRefreshToken = testRefreshToken,
                JwtRefreshTokenExpiration = DateTime.UtcNow.AddDays(1)
            };

            authenticateSpotifyUserServiceMock
                .Setup(x => x.GetUserAsync(testUserId))
                .ReturnsAsync(existingUser);

            userStorageServiceMock
                .Setup(x => x.StoreOrUpdateAsync(It.IsAny<SpotifyUser>()))
                .Returns(Task.CompletedTask);

            var controller = new SpotifyAuthController(
                spotifyApiServiceMock.Object,
                encryptionHelper,
                authenticateSpotifyUserServiceMock.Object,
                quizStorageServiceMock.Object,
                userStorageServiceMock.Object
            );

            var request = new RefreshTokenRequest 
            { 
                SpotifyUserId = testUserId,
                JwtRefreshToken = testRefreshToken
            };

            // Act
            var result = await controller.RefreshJwtToken(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
            
            // Verify that the user storage service was called to update the user
            userStorageServiceMock.Verify(x => x.StoreOrUpdateAsync(It.IsAny<SpotifyUser>()), Times.Once);
        }

        [Fact]
        public async Task RefreshJwtToken_InvalidRefreshToken_ReturnsUnauthorized()
        {
            // Arrange
            var testUserId = "user123";
            var testDisplayName = "Test User";
            var validRefreshToken = "valid_refresh_token";
            var invalidRefreshToken = "invalid_refresh_token";

            var spotifyApiServiceMock = new Mock<ISpotifyApiService>();
            var userStorageServiceMock = new Mock<IEntityStorageService<SpotifyUser, string>>();
            var quizStorageServiceMock = new Mock<IQuizStorageService>();
            var authenticateSpotifyUserServiceMock = new Mock<IAuthenticateSpotifyUserService>();
            var encryptionHelper = GetEncryptionHelper();

            var existingUser = new SpotifyUser
            {
                SpotifyUserId = testUserId,
                DisplayName = testDisplayName,
                JwtRefreshToken = validRefreshToken,
                JwtRefreshTokenExpiration = DateTime.UtcNow.AddDays(1)
            };

            authenticateSpotifyUserServiceMock
                .Setup(x => x.GetUserAsync(testUserId))
                .ReturnsAsync(existingUser);

            var controller = new SpotifyAuthController(
                spotifyApiServiceMock.Object,
                encryptionHelper,
                authenticateSpotifyUserServiceMock.Object,
                quizStorageServiceMock.Object,
                userStorageServiceMock.Object
            );

            var request = new RefreshTokenRequest 
            { 
                SpotifyUserId = testUserId,
                JwtRefreshToken = invalidRefreshToken
            };

            // Act
            var result = await controller.RefreshJwtToken(request);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task GetUserQuizzesAsync_ValidUser_ReturnsQuizzes()
        {
            // Arrange
            var testUserId = "user123";
            var spotifyApiServiceMock = new Mock<ISpotifyApiService>();
            var userStorageServiceMock = new Mock<IEntityStorageService<SpotifyUser, string>>();
            var quizStorageServiceMock = new Mock<IQuizStorageService>();
            var authenticateSpotifyUserServiceMock = new Mock<IAuthenticateSpotifyUserService>();
            var encryptionHelper = GetEncryptionHelper();

            var testQuizzes = new List<Quiz>
            {
                new Quiz { Id = 1, Title = "Quiz 1", SpotifyUserId = testUserId },
                new Quiz { Id = 2, Title = "Quiz 2", SpotifyUserId = testUserId }
            };

            quizStorageServiceMock
                .Setup(x => x.GetUserQuizzesAsync(testUserId))
                .ReturnsAsync(testQuizzes);

            var controller = new SpotifyAuthController(
                spotifyApiServiceMock.Object,
                encryptionHelper,
                authenticateSpotifyUserServiceMock.Object,
                quizStorageServiceMock.Object,
                userStorageServiceMock.Object
            );

            // Simulate authenticated user
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, testUserId)
            }, "mock"));
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await controller.GetUserQuizzesAsync();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
            
            quizStorageServiceMock.Verify(x => x.GetUserQuizzesAsync(testUserId), Times.Once);
        }
    }
}