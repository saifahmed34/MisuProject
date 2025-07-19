namespace MisuProject.Models.AuthModels
{
    public class OtpVerification
    {
        public int Id { get; set; }

        public required string Email { get; set; }

        public required string OtpCode { get; set; }

        public DateTime ExpirationTime { get; set; }

        public bool IsUsed { get; set; }

    }
}
