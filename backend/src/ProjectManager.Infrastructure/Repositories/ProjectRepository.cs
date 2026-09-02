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

    public async Task<IReadOnlyList<Project>> GetAllAsync() => await _db.Projects.ToListAsync();

    public Task<Project?> GetByIdAsync(int id) =>
        _db.Projects.FirstOrDefaultAsync(p => p.Id == id);

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