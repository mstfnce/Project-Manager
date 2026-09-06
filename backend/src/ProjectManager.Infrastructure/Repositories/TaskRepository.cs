using Microsoft.EntityFrameworkCore;
using ProjectManager.Application.Interfaces;
using ProjectManager.Domain.Entities;
using ProjectManager.Infrastructure.Data;

namespace ProjectManager.Infrastructure.Repositories;

// ITaskRepository sözünü AppDbContext (EF Core) ile gerçekten tutan sınıf.
public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _db;
    public TaskRepository(AppDbContext db) => _db = db;

    // Bir projenin görevlerini kanban sırasına göre getirir.
    // Where: sadece o projeye ait olanlar. OrderBy: kartlar sütun içinde
    // rastgele değil, kaydedilmiş sıraya göre gelsin.
    public async Task<IReadOnlyList<TaskItem>> GetAllByProjectAsync(int projectId) =>
        await _db.Tasks
            .Where(t => t.ProjectId == projectId)
            .OrderBy(t => t.Order)
            .ToListAsync();

    public Task<TaskItem?> GetByIdAsync(int id) =>
        _db.Tasks.FirstOrDefaultAsync(t => t.Id == id);

    public async Task AddAsync(TaskItem task)
    {
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
    }

    // Not: EF change tracking sayesinde, GetByIdAsync ile çekilmiş bir entity'nin
    // alanlarını değiştirip SaveChangesAsync demek UPDATE için yeterli —
    // ayrıca _db.Tasks.Update(task) çağırmaya gerek yok.
    public async Task UpdateAsync(TaskItem task)
    {
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(TaskItem task)
    {
        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
    }
}