using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Application.Features.Auth.Dtos;

public class AuthResponse
{
    public UserDto User { get; set; } = null!;
    public string AccessToken { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime RefreshTokenExpiry { get; set; }
}
