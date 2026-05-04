using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Commands.ProcessPayment;

public record ProcessPaymentCommand(
    Guid PaymentId,
    string TransactionId,
    DateTime PaymentDate
) : IRequest<bool>;
