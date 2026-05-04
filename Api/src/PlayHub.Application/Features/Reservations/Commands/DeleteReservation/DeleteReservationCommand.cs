using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Commands.DeleteReservation;

public record DeleteReservationCommand(Guid Id) : IRequest<bool>;
