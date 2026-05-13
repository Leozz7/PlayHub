using FluentValidation;

namespace PlayHub.Application.Features.Users.Commands.ChangePassword;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Usuário inválido.");

        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Senha atual é obrigatória.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Nova senha é obrigatória.")
            .MinimumLength(8).WithMessage("Nova senha deve ter ao menos 8 caracteres.")
            .Matches("[A-Z]").WithMessage("Nova senha deve conter ao menos uma letra maiúscula.")
            .Matches("[0-9]").WithMessage("Nova senha deve conter ao menos um número.")
            .NotEqual(x => x.CurrentPassword)
            .WithMessage("Nova senha deve ser diferente da senha atual.");
    }
}
