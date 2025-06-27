using groove_glass_api.Util;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
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
            var inMemorySettings = new Dictionary<string, string> {
                {"EncryptionKey", "TestEncryptionKey1234567890"}
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
    }
}
