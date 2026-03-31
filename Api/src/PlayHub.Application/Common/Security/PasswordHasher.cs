using Isopoh.Cryptography.Argon2;

namespace PlayHub.Application.Common.Security;

/// <summary>
/// Serviço de hash de senhas usando Argon2Id — algoritmo recomendado pelo OWASP.
/// Configurado com parâmetros seguros: memória 64MB, 3 iterações, 4 threads paralelos.
/// </summary>
public class PasswordHasher
{
    private const int MemoryCost = 65536;  // 64 MB
    private const int TimeCost = 3;        // iterações
    private const int Parallelism = 4;     // threads paralelos
    private const int HashLength = 32;     // bytes do hash

    public string Hash(string password)
    {
        var config = new Argon2Config
        {
            Type = Argon2Type.DataIndependentAddressing, // Argon2Id
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
