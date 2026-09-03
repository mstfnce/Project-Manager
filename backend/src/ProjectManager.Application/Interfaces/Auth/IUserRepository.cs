using ProjectManager.Domain.Entities;

namespace ProjectManager.Application.Interfaces;

// İstek listesi: kullanıcıyı veritabanına yazma/okuma gerçek işini Infrastructure yapacak.
public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
    Task<bool> AnyUsersExistAsync();   // register'ı ilk kullanıcıdan sonra kapatmak için (Karar #4)
}
