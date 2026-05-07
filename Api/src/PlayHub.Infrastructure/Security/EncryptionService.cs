using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Infrastructure.Security;

public class EncryptionService(IConfiguration config) : IEncryptionService
{
    private readonly byte[] _key = Encoding.UTF8.GetBytes(
        config["ENCRYPTION_KEY"] ?? throw new InvalidOperationException("ENCRYPTION_KEY is not configured."));

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrWhiteSpace(plainText)) return plainText;

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();
        
        ms.Write(aes.IV, 0, aes.IV.Length);

        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }

        return Convert.ToBase64String(ms.ToArray());
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrWhiteSpace(cipherText)) return cipherText;

        try
        {
            var fullCipher = Convert.FromBase64String(cipherText);

            using var aes = Aes.Create();
            aes.Key = _key;

            var iv = new byte[aes.BlockSize / 8];
            var cipher = new byte[fullCipher.Length - iv.Length];

            Array.Copy(fullCipher, 0, iv, 0, iv.Length);
            Array.Copy(fullCipher, iv.Length, cipher, 0, cipher.Length);

            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(cipher);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);

            return sr.ReadToEnd();
        }
        catch
        {
            return cipherText;
        }
    }

    public string CreateBlindIndex(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return input;

        var normalized = input.Trim().ToLowerInvariant();

        using var hmac = new HMACSHA256(_key);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(normalized));
        
        return Convert.ToBase64String(hash);
    }
}
