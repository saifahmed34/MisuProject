using Microsoft.EntityFrameworkCore;
using MisuProject.Models;
using MisuProject.Models.AuthModels;
using MisuProject.Models.Follow;

namespace MisuProject.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserFollow> FollowUsers { get; set; }

        public DbSet<OtpVerification> OtpVerifications { get; set; }
        
        public DbSet<ChatMessage> ChatMessages { get; set; }



        public AppDbContext(DbContextOptions options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasMany(u => u.Roles)
                .WithMany(r => r.Users);

            modelBuilder.Entity<Role>()
                .Property(r => r.Name)
                .HasConversion<string>();

            //follows
            modelBuilder.Entity<UserFollow>()
    .HasKey(f => new { f.FollowerId, f.FolloweeId });

            modelBuilder.Entity<UserFollow>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(f => f.FollowerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserFollow>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(f => f.FolloweeId)
                .OnDelete(DeleteBehavior.Restrict);

        }




    }
}
