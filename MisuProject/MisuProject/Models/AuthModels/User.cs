using MisuProject.Models.AuthModels;


namespace MisuProject.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string HashedPassword { get; set; }
        public required string PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public required string Proffession { get; set; }
        public required string Status { get; set; }

        public List<Role> Roles { get; set; } = new();
        //public List<Orders> Orders { get; set; } = new();
        //public Cart Cart { get; set; } = new();

        /*        public string? ResetOtp { get; set; }
                public DateTime? OtpExpiration { get; set; }*/
        //public List<FollowUser> FollowUsers { get; set; }

    }
}
