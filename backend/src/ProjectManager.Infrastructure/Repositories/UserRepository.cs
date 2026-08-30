using Microsoft.EntityFrameworkCore;
using ProjectManager.Application.Interfaces;
using ProjectManager.Domain.Entities;
using ProjectManager.Infrastructure.Data;

namespace ProjectManager.Infrastructure.Repositories;

// IUserRepository sözünü AppDbContext (EF Core) ile gerçekten tutan sınıf.
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;
    public UserRepository(AppDbContext db) => _db = db;

    public Task<bool> ExistsByEmailAsync(string email) =>
        _db.Users.AnyAsync(u => u.Email == email);

    public Task<User?> GetByEmailAsync(string email) =>
        _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task AddAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public Task<bool> AnyUsersExistAsync() => _db.Users.AnyAsync();
}
