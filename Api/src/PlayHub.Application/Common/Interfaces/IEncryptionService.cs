namespace PlayHub.Application.Common.Interfaces;

public interface IEncryptionService
{
    string Encrypt(string plainText);

    string Decrypt(string cipherText);

    string CreateBlindIndex(string input);
}
