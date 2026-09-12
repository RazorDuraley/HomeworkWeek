FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY HomeworkApi/*.csproj ./HomeworkApi/
RUN dotnet restore ./HomeworkApi/HomeworkApi.csproj
COPY HomeworkApi/. ./HomeworkApi/
RUN dotnet publish ./HomeworkApi/HomeworkApi.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HomeworkApi.dll"]