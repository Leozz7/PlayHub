using FluentValidation;

namespace PlayHub.Application.Features.Users.Commands.CreateUser;

public class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    private static readonly string[] ValidRoles = ["Admin", "User", "Manager"];

    public CreateUserValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome é obrigatório.")
            .MaximumLength(100).WithMessage("O nome deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("O e-mail é obrigatório.")
            .EmailAddress().WithMessage("E-mail inválido.")
            .MaximumLength(255);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("A senha é obrigatória.")
            .MinimumLength(8).WithMessage("A senha deve ter no mínimo 8 caracteres.")
            .MaximumLength(128);

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("O perfil de acesso é obrigatório.")
            .Must(r => ValidRoles.Contains(r))
            .WithMessage($"Perfil inválido. Valores aceitos: {string.Join(", ", ValidRoles)}");
        }
}