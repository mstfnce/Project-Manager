using Microsoft.EntityFrameworkCore;
using ProjectManager.Application.Interfaces;
using ProjectManager.Domain.Entities;
using ProjectManager.Infrastructure.Data;

namespace ProjectManager.Infrastructure.Repositories;

// IProjectRepository sözünü AppDbContext (EF Core) ile gerçekten tutan sınıf.
public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _db;
    public ProjectRepository(AppDbContext db) => _db = db;

    // Include: EF Core ilişkili tabloları kendiliğinden getirmez, açıkça
    // istemek gerekir. Tasks/Notes'u getirmezsek ProjectResponse'taki
    // TaskCount/NoteCount her zaman 0 çıkar (liste boş kalır).
    public async Task<IReadOnlyList<Project>> GetAllAsync() =>
        await _db.Projects
            .Include(p => p.Tasks)
            .Include(p => p.Notes)
            .ToListAsync();

    public Task<Project?> GetByIdAsync(int id) =>
        _db.Projects
            .Include(p => p.Tasks)
            .Include(p => p.Notes)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task AddAsync(Project project)
    {
        _db.Projects.Add(project);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Project project)
    {
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Project project)
    {
        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
    }

    public Task<bool> SlugExistsAsync(string slug) => _db.Projects.AnyAsync(p => p.Slug == slug);

}