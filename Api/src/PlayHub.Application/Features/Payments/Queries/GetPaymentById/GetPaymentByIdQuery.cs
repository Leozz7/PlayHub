using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Payments.Dtos;
using PlayHub.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Queries.GetPaymentById;

public record GetPaymentByIdQuery(Guid Id) : IRequest<PaymentDto?>;
