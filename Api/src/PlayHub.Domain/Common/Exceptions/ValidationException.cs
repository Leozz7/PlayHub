using FluentValidation.Results;

namespace PlayHub.Domain.Common.Exceptions;

public class ValidationException(IEnumerable<ValidationFailure> failures)
    : Exception("Um ou mais erros de validação ocorreram.")
{
    public IDictionary<string, string[]> Errors { get; } =
        failures
            .GroupBy(f => f.PropertyName, f => f.ErrorMessage)
            .ToDictionary(g => g.Key, g => g.ToArray());
}
