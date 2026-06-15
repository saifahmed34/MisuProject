using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MisuProject.Data;
using MisuProject.Dtos.Auth;
using MisuProject.Models;
using MisuProject.Models.AuthModels;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MailKit.Net.Smtp;
using MimeKit;
using static MisuProject.Models.AuthModels.Role;

namespace MisuProject.Controllers.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        //test endpoint
        [Authorize(Roles = "Admin")]
        [HttpGet("profile")]
        public IActionResult Profile()
        {
            var userId = User.FindFirstValue(ClaimTypes.Name); // Get ID from token
            return Ok($"Welcome user {userId}, you are authenticated.");
        }


        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Roles)
                .ToListAsync();

            var result = users.Select(u => new UserRoles
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Roles = u.Roles.Select(r => r.Name.ToString()).ToList()
            });

            return Ok(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var findId = await _context.Users.FindAsync(id);
            if (findId is null)
            {
                return NotFound();
            }
            return Ok(findId);
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDtos registerDtos)
        {
            // 1. Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == registerDtos.Email))
                return BadRequest("Email already registered.");

            // 2. Map the DTO to the User model
            var user = registerDtos.Adapt<User>();

            // 3. Hash the password
            user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDtos.Password);
            user.Status = "Active";

            // 4. Get "User" role from DB
            var defaultRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == RoleName.User);
            if (defaultRole == null)
                return StatusCode(500, "Default role 'User' not found in database.");

            // 5. Assign the role
            user.Roles = new List<Role> { defaultRole };

            // 6. Save user
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered and role 'User' assigned successfully." });

        }


        [HttpPost("login")]
        public async Task<IActionResult> login(LoginDtos LoginDtos)
        {
            var user = await _context.Users.Include(u => u.Roles)
                                   .FirstOrDefaultAsync(u => u.Email == LoginDtos.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(LoginDtos.Password, user.HashedPassword))
                return Unauthorized("Invalid email or password.");

            var token = GenerateJwtToken(user); //make token to make login authorized

            return Ok(new { Token = token });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing in configuration.")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Create claims
            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.Name, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email)
    };

            // Add role claims from user.Roles (like Admin, User)
            foreach (var role in user.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role.Name.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [Authorize]
        [HttpPut("users/update/{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] RegisterDtos updatedUser)
        {
            User? user = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound("User not found.");

            //ignore to change password in update

            TypeAdapterSetter<RegisterDtos, User> config = TypeAdapterConfig<RegisterDtos, User>.NewConfig()
             .Ignore(dest => dest.HashedPassword);
            // Use Mapster to map DTO to existing user
            updatedUser.Adapt(user);

            // Hash password if provided
            if (!string.IsNullOrEmpty(updatedUser.Password))
            {
                user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(updatedUser.Password);
            }

            await _context.SaveChangesAsync();

            return Ok("User updated successfully.");
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("users/del/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound("User not found.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("User deleted successfully.");
        }


        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDtos dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return NotFound("User not found.");

            // Verify old password
            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.HashedPassword))
                return BadRequest("Old password is incorrect.");

            // Hash and update the new password
            user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Password changed successfully.");
        }



        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgetPasswordDtos forgetPasswordDtos)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == forgetPasswordDtos.Email);
            if (user == null)
                return NotFound("Email is not registered.");

            var otp = new Random().Next(1000, 9999).ToString();

            var otpEntry = new OtpVerification
            {
                Email = forgetPasswordDtos.Email,
                OtpCode = otp,
                ExpirationTime = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false
            };

            _context.OtpVerifications.Add(otpEntry);
            await _context.SaveChangesAsync();

            // Send email using MailKit
            var emailSettings = _configuration.GetSection("EmailSettings");
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(emailSettings["SenderName"], emailSettings["SenderEmail"]));
            message.To.Add(MailboxAddress.Parse(forgetPasswordDtos.Email));
            message.Subject = "Your OTP Code";

            var text = $@"
            <div style='font-family: Arial, sans-serif;'>
                <h2>Dear User,</h2>
              <p style='font-size: 18px;'>Your OTP code is:</p>
              <div style='
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 5px;
                color: #333;
                background-color: #f1f1f1;
                padding: 10px 20px;
                display: inline-block;
                border-radius: 8px;
                margin: 20px 0;
            '>{otp}</div>
            <p>Expires at: {otpEntry.ExpirationTime}</p>
        </div>";
            message.Body = new TextPart("HTML")
            {
                Text = text

            };

            using var client = new SmtpClient();
            await client.ConnectAsync(emailSettings["SmtpServer"], int.Parse(emailSettings["Port"] ?? throw new InvalidOperationException()), MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(emailSettings["Username"], emailSettings["Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            return Ok(new { Message = "OTP sent successfully to your email." });
        }



        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDtos verifyOtp)
        {
            var otpRecord = await _context.OtpVerifications
                .Where(o => o.Email == verifyOtp.Email && o.OtpCode == verifyOtp.Otp && !o.IsUsed)
                .OrderByDescending(o => o.ExpirationTime)
                .FirstOrDefaultAsync();

            if (otpRecord == null)
                return BadRequest(new { Message = "Invalid or expired OTP." });

            if (otpRecord.ExpirationTime < DateTime.UtcNow)
                return BadRequest(new { Message = "OTP has expired." });

            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "OTP verified successfully" });
        }


        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDtos dto)
        {
            // Check if user exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return NotFound("User not found.");

            // Check OTP
            var otpRecord = await _context.OtpVerifications
                .Where(o => o.Email == dto.Email)
                .OrderByDescending(o => o.ExpirationTime)
                .FirstOrDefaultAsync();

            if (otpRecord == null)
                return BadRequest("Invalid OTP.");

            if (otpRecord.ExpirationTime < DateTime.UtcNow)
                return BadRequest(new { Message = "OTP expired." });


            // Reset password
            user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            // Mark OTP as used
            otpRecord.IsUsed = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successful." });
        }

        //change role by admin
        [Authorize(Roles = "Admin")]
        [HttpPut("roles/{userId}")]
        public async Task<IActionResult> ChangeRole(Guid userId, [FromBody] string role)
        {
            // Validate role
            if (!Enum.TryParse<RoleName>(role, true, out var parsedRole))
                return BadRequest("Invalid role.");

            // Find user
            var user = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound("User not found.");

            // Find role in DB
            var dbRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == parsedRole);
            if (dbRole == null)
                return NotFound("Role not found in database.");

            user.Roles.Add(dbRole);

            await _context.SaveChangesAsync();

            return Ok($"User role changed to {role}.");
        }




    }
}

