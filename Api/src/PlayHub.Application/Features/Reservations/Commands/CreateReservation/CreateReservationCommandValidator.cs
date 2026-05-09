using FluentValidation;

namespace PlayHub.Application.Features.Reservations.Commands.CreateReservation;

public class CreateReservationCommandValidator : AbstractValidator<CreateReservationCommand>
{
    public CreateReservationCommandValidator()
    {
        RuleFor(x => x.CourtId)
            .NotEmpty().WithMessage("Quadra é obrigatória.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Usuário é obrigatório.");

        RuleFor(x => x.StartTime)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Horário de início deve ser no futuro.");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime)
            .WithMessage("Horário de término deve ser posterior ao horário de início.");
    }
}
