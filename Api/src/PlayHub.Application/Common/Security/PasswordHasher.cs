using Isopoh.Cryptography.Argon2;
using System.Security.Cryptography;

namespace PlayHub.Application.Common.Security;

public class PasswordHasher
{
    private const int MemoryCost = 65536;  
    private const int TimeCost = 3;        
    private const int Parallelism = 4;     
    private const int HashLength = 32;     

    public string Hash(string password)
    {
        var salt = new byte[16];
        RandomNumberGenerator.Fill(salt);

        var config = new Argon2Config
        {
            Type = Argon2Type.DataIndependentAddressing,
            Version = Argon2Version.Nineteen,
            MemoryCost = MemoryCost,
            TimeCost = TimeCost,
            Lanes = Parallelism,
            Threads = Parallelism,
            Password = System.Text.Encoding.UTF8.GetBytes(password),
            Salt = salt,
            HashLength = HashLength
        };

        return Argon2.Hash(config);
    }

    // verifica se a senha esta certa
    public bool Verify(string password, string encodedHash)
    {
        return Argon2.Verify(encodedHash, password);
    }
}
