using MisuProject.Models;

namespace MisuProject.Dtos.Auth
{
    public class RegisterDtos
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Proffession { get; set; }


    }
}
