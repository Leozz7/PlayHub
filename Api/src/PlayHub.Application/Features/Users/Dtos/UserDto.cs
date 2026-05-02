namespace PlayHub.Application.Features.Users.Dtos;

public class UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = "User";
    public List<Guid> CoutsId { get; set; } = new List<Guid>();
    public DateTime Created { get; set; }
}