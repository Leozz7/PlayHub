namespace PlayHub.Domain.Common.Exceptions;

public class NotFoundException(string entity, object key)
    : Exception($"'{entity}' ({key}) não foi encontrado.");
