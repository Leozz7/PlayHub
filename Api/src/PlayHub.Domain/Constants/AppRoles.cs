namespace PlayHub.Domain.Constants;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string User = "User";

    public const string AdminOrManager = Admin + "," + Manager;
}
