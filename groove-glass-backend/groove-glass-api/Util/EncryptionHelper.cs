using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace groove_glass_api.Util
{
    public class EncryptionHelper
    {
        private readonly IConfiguration _configuration;
        private readonly string _encryptionKey;
        private readonly string _jwtKey;
        private readonly string _jwtIssuer;

        public EncryptionHelper(IConfiguration configuration)
        {
            _configuration = configuration;
            _encryptionKey = _configuration["EncryptionKey"] ?? throw new ArgumentNullException("EncryptionKey is not set in configuration.");
            _jwtKey = _configuration["Jwt:Key"];
            _jwtIssuer = _configuration["Jwt:Issuer"];
        }

        // Encrypts a string using AES and returns a base64 string (IV + ciphertext)
        public string EncryptString(string plainText)
        {
            if (string.IsNullOrEmpty(plainText))
                throw new ArgumentNullException(nameof(plainText));

            string key = _encryptionKey;

            using var aes = Aes.Create();
            aes.Key = GetAesKey(key);
            aes.GenerateIV();
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream();
            ms.Write(aes.IV, 0, aes.IV.Length); // Prepend IV
            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
            {
                using var sw = new StreamWriter(cs, Encoding.UTF8);
                sw.Write(plainText);
            }
            return Convert.ToBase64String(ms.ToArray());
        }

        // Decrypts a base64 string (IV + ciphertext) using AES
        public string DecryptString(string cipherText)
        {
            if (string.IsNullOrEmpty(cipherText))
                throw new ArgumentNullException(nameof(cipherText));

            string key = _encryptionKey;

            var fullCipher = Convert.FromBase64String(cipherText);
            using var aes = Aes.Create();
            aes.Key = GetAesKey(key);
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            var iv = new byte[aes.BlockSize / 8];
            Array.Copy(fullCipher, 0, iv, 0, iv.Length);
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(fullCipher, iv.Length, fullCipher.Length - iv.Length);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs, Encoding.UTF8);
            return sr.ReadToEnd();
        }

        public string GenerateJwtToken(string userId, string displayName)
        {
            var jwtKey = _jwtKey;
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new ArgumentNullException("Jwt:Key is not set in configuration.");
            }

            var jwtIssuer = _jwtIssuer;
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim("displayName", displayName)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Derives a 256-bit key from the provided key string
        private static byte[] GetAesKey(string key)
        {
            using var sha256 = SHA256.Create();
            return sha256.ComputeHash(Encoding.UTF8.GetBytes(key));
        }
    }
}
