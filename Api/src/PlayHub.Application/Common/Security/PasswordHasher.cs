using Isopoh.Cryptography.Argon2;

namespace PlayHub.Application.Common.Security;

public class PasswordHasher
{
    private const int MemoryCost = 65536;  
    private const int TimeCost = 3;        
    private const int Parallelism = 4;     
    private const int HashLength = 32;     

    public string Hash(string password)
    {
        var config = new Argon2Config
        {
            Type = Argon2Type.DataIndependentAddressing,
            Version = Argon2Version.Nineteen,
            MemoryCost = MemoryCost,
            TimeCost = TimeCost,
            Lanes = Parallelism,
            Threads = Parallelism,
            Password = System.Text.Encoding.UTF8.GetBytes(password),
            HashLength = HashLength
        };

        using var argon2 = new Argon2(config);
        using var hash = argon2.Hash();
        return config.EncodeString(hash.Buffer);
    }

    public bool Verify(string password, string encodedHash)
    {
        return Argon2.Verify(encodedHash, password);
    }
}
