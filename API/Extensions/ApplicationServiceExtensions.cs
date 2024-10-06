using API.Database;
using API.Helpers;
using API.Interfaces;
using API.Services;
using API.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection Services,IConfiguration config)
        {
            Services.AddDbContext<DataContext>(opt =>
            {
                opt.UseSqlite(config.GetConnectionString("DefaultConnection"));
            });

            Services.AddCors();

            Services.AddScoped<ITokenService, TokenService>();

            Services.AddScoped<IUserRepository,UserRepository>();

            Services.AddScoped<ILikesRepository, LikesRepository>();

            Services.AddScoped<IMessageRepository, MessageRepository>();

            Services.AddScoped<IUnitOfWork, UnitOfWork>();

            Services.AddScoped<IPhotoService, PhotoService>();

            Services.AddScoped<LogUserActivity>();

            Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            Services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));

            Services.AddSignalR();

            Services.AddSingleton<PresenceTracker>();

            Services.AddScoped<IPhotoRepository, PhotoRepository>();

            return Services;
        }
    }
}
