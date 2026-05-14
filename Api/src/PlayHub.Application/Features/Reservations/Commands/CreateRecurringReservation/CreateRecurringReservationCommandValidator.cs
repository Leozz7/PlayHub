using FluentValidation;

namespace PlayHub.Application.Features.Reservations.Commands.CreateRecurringReservation;

public class CreateRecurringReservationCommandValidator : AbstractValidator<CreateRecurringReservationCommand>
{
    public CreateRecurringReservationCommandValidator()
    {
        RuleFor(x => x.CourtId)
            .NotEmpty().WithMessage("Quadra é obrigatória.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Usuário é obrigatório.");

        RuleFor(x => x.FirstStartTime)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("O horário de início deve ser no futuro.");

        RuleFor(x => x.FirstEndTime)
            .GreaterThan(x => x.FirstStartTime)
            .WithMessage("O horário de término deve ser posterior ao horário de início.");

        RuleFor(x => x.MonthsToBlock)
            .InclusiveBetween(1, 12)
            .WithMessage("A duração deve ser entre 1 e 12 meses.");
    }
}
