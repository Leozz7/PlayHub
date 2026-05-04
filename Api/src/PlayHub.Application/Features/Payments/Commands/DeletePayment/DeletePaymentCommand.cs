using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Commands.DeletePayment;

public record DeletePaymentCommand(Guid Id) : IRequest<bool>;
