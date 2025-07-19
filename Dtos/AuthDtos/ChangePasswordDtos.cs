namespace MisuProject.Dtos.Auth
{
    public class ChangePasswordDtos
    {
        public Guid UserId { get; set; }
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
