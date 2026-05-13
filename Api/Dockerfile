# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY ["src/PlayHub.Domain/PlayHub.Domain.csproj", "src/PlayHub.Domain/"]
COPY ["src/PlayHub.Application/PlayHub.Application.csproj", "src/PlayHub.Application/"]
COPY ["src/PlayHub.Infrastructure/PlayHub.Infrastructure.csproj", "src/PlayHub.Infrastructure/"]
COPY ["src/PlayHub.Api/PlayHub.Api.csproj", "src/PlayHub.Api/"]

RUN dotnet restore "src/PlayHub.Api/PlayHub.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/src/PlayHub.Api"
RUN dotnet build "PlayHub.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PlayHub.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "PlayHub.Api.dll"]
