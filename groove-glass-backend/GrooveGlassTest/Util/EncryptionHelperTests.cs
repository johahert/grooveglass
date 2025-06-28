using groove_glass_api.Util;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace GrooveGlassTest.Util
{
    public class EncryptionHelperTests
    {
        private readonly EncryptionHelper _helper;

        public EncryptionHelperTests()
        {
            var mock256BitKey = "0123456789abcdef0123456789abcdef";
            var inMemorySettings = new Dictionary<string, string> {
                {"EncryptionKey", "TestEncryptionKey1234567890"},
                { "Jwt:Key", "0123456789abcdef0123456789abcdef" },
                { "Jwt:Issuer", "TestIssuer" }
            };
            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            _helper = new EncryptionHelper(configuration);
        }

        [Fact]
        public void EncryptDecrypt_ReturnsOriginalString()
        {
            var original = "SensitiveData123!";
            var encrypted = _helper.EncryptString(original);
            var decrypted = _helper.DecryptString(encrypted);
            Assert.Equal(original, decrypted);
        }

        [Fact]
        public void Encrypt_ProducesDifferentOutputForDifferentInput()
        {
            var encrypted1 = _helper.EncryptString("data1");
            var encrypted2 = _helper.EncryptString("data2");
            Assert.NotEqual(encrypted1, encrypted2);
        }

        [Fact]
        public void Decrypt_WithWrongKey_ThrowsOrReturnsWrongResult()
        {
            var original = "SensitiveData123!";
            var encrypted = _helper.EncryptString(original);

            var wrongSettings = new Dictionary<string, string> {
                {"EncryptionKey", "WrongKey987654321"}
            };
            var wrongConfig = new ConfigurationBuilder()
                .AddInMemoryCollection(wrongSettings)
                .Build();
            var wrongHelper = new EncryptionHelper(wrongConfig);

            Assert.ThrowsAny<System.Exception>(() => wrongHelper.DecryptString(encrypted));
        }

        [Fact]
        public void GenerateJwtToken_ProducesValidJwtWithClaims()
        {
            // Arrange
            var userId = "user123";
            var displayName = "Test User";

            // Act
            var tokenString = _helper.GenerateJwtToken(userId, displayName);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(tokenString);

            Assert.Equal("TestIssuer", token.Issuer);
            Assert.Contains(token.Claims, c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == userId);
            Assert.Contains(token.Claims, c => c.Type == "displayName" && c.Value == displayName);
        }

        [Fact]
        public void GenerateJwtToken_ThrowsIfJwtKeyMissing()
        {
            var inMemorySettings = new Dictionary<string, string> {
                {"EncryptionKey", "TestEncryptionKey1234567890"},
                // Jwt:Key intentionally missing
                {"Jwt:Issuer", "TestIssuer"}
            };
            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();
            var helper = new EncryptionHelper(configuration);

            Assert.Throws<ArgumentNullException>(() => helper.GenerateJwtToken("user", "name"));
        }

    }
}
