using PlayHub.Domain.Common;

namespace PlayHub.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string EmailIndex { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string Role { get; private set; } = "User";

    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }

    private User() { }

    public User(string name, string email, string emailIndex, string passwordHash, string role = "User")
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Name is required.");

        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Email is required.");

        if (string.IsNullOrWhiteSpace(emailIndex))
            throw new DomainException("EmailIndex is required.");

        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new DomainException("PasswordHash is required.");

        Name = name;
        Email = email;
        EmailIndex = emailIndex;
        PasswordHash = passwordHash;
        Role = role;
    }

    public void UpdateDetails(string name, string email, string emailIndex, string role)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Name is required.");

        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Email is required.");

        if (string.IsNullOrWhiteSpace(emailIndex))
            throw new DomainException("EmailIndex is required.");

        Name = name;
        Email = email;
        EmailIndex = emailIndex;
        Role = role;
    }

    public void SetNewPasswordHash(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash))
            throw new DomainException("PasswordHash is required.");

        PasswordHash = newPasswordHash;
    }

    public void SetRefreshToken(string token, DateTime expiryTime)
    {
        RefreshToken = token;
        RefreshTokenExpiryTime = expiryTime;
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiryTime = null;
    }
}