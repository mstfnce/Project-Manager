using ProjectManager.Application.Interfaces;

namespace ProjectManager.Infrastructure.Services;

// IPasswordHasher sözünü BCrypt kütüphanesiyle gerçekten tutan sınıf.
public class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}
