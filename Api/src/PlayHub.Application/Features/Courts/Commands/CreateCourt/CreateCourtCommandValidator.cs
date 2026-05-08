using FluentValidation;

namespace PlayHub.Application.Features.Courts.Commands.CreateCourt;

public class CreateCourtCommandValidator : AbstractValidator<CreateCourtCommand>
{
    public CreateCourtCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome da quadra é obrigatório.")
            .MaximumLength(100).WithMessage("Nome deve ter no máximo 100 caracteres.");

        RuleFor(x => x.HourlyRate)
            .GreaterThan(0).WithMessage("Valor por hora deve ser maior que zero. Verifique o preço cadastrado.");

        RuleFor(x => x.Capacity)
            .GreaterThan(0).WithMessage("Capacidade deve ser maior que zero.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("Cidade é obrigatória.");

        RuleFor(x => x.OpeningHour)
            .InclusiveBetween(0, 23).WithMessage("Hora de abertura deve estar entre 0 e 23.");

        RuleFor(x => x.ClosingHour)
            .InclusiveBetween(1, 24).WithMessage("Hora de fechamento deve estar entre 1 e 24.")
            .GreaterThan(x => x.OpeningHour)
            .WithMessage("Hora de fechamento deve ser posterior à hora de abertura.");
    }
}
