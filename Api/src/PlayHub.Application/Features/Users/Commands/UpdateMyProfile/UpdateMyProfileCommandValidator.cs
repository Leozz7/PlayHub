using FluentValidation;
using PlayHub.Application.Common.Extensions;

namespace PlayHub.Application.Features.Users.Commands.UpdateMyProfile;

public class UpdateMyProfileCommandValidator : AbstractValidator<UpdateMyProfileCommand>
{
    public UpdateMyProfileCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MinimumLength(2).WithMessage("Nome deve ter ao menos 2 caracteres.")
            .MaximumLength(100).WithMessage("Nome deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório.")
            .EmailAddress().WithMessage("E-mail inválido.");

        RuleFor(x => x.Cpf)
            .Must(x => string.IsNullOrWhiteSpace(x) || x.IsValidCpf())
            .WithMessage("CPF inválido.");
            
        RuleFor(x => x.Phone)
            .Matches(@"^\d+$")
            .When(x => !string.IsNullOrWhiteSpace(x.Phone))
            .WithMessage("O telefone deve conter apenas números.");
    }
}
