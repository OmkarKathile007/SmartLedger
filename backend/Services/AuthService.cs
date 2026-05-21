using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
        {
            // Check if user already exists
            if (await _userRepository.EmailExistsAsync(request.Email))
            {
                return null;
            }

            // Create new user entity
            var user = new User
            {
                Username = request.Username,
                Email = request.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            // Generate JWT Token
            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Email = user.Email
            };
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
            {
                return null;
            }

            // Verify Password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return null;
            }

            // Generate JWT Token
            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Email = user.Email
            };
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            
            // Safe fallback secret key if not set in config
            var secret = _configuration["Jwt:Key"] ?? "SuperSecretKeyForDevelopmentPurposesOnly12345678!";
            if (secret.Length < 32)
            {
                // Pad to 32 bytes to avoid security exceptions
                secret = secret.PadRight(32, 'x');
            }
            
            var key = Encoding.UTF8.GetBytes(secret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["Jwt:Issuer"] ?? "AiExpenseTracker",
                Audience = _configuration["Jwt:Audience"] ?? "AiExpenseTrackerClient",
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
