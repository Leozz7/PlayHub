using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using System.Linq;

namespace PlayHub.Application.Features.Courts.Queries.GetCourtById;

public record GetCourtByIdQuery(Guid Id) : IRequest<CourtDto?>;
