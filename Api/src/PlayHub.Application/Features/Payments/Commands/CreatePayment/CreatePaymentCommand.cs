using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Payments.Dtos;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Commands.CreatePayment;

public record CreatePaymentCommand(
    Guid ReservationId,
    Guid UserId,
    decimal Amount,
    PaymentMethod Method,
    PaymentStatus Status = PaymentStatus.Pending
) : IRequest<PaymentDto>;
