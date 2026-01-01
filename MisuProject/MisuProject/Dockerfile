FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["MisuProject.csproj", "./"]
RUN dotnet restore "./MisuProject.csproj"
COPY . .
RUN dotnet build "MisuProject.csproj" -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5189


FROM build AS publish
RUN dotnet publish "MisuProject.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MisuProject.dll"]
