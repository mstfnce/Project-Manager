namespace ProjectManager.Domain.Entities;

// Giriş yapan hesap. Projelerden bağımsız — kimseye ait değil, kendi başına var olur.
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;   // asla ham şifre, BCrypt ile hash'lenmiş hali
    public string DisplayName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
