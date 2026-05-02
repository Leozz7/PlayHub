using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Courts.Commands.DeleteCourt;

public record DeleteCourtCommand(Guid Id) : IRequest<bool>;
