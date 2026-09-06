using Microsoft.EntityFrameworkCore;
using ProjectManager.Application.Interfaces;
using ProjectManager.Domain.Entities;
using ProjectManager.Infrastructure.Data;

namespace ProjectManager.Infrastructure.Repositories;

// INoteRepository sözünü AppDbContext (EF Core) ile gerçekten tutan sınıf.
public class NoteRepository : INoteRepository
{
    private readonly AppDbContext _db;
    public NoteRepository(AppDbContext db) => _db = db;

    // Bir projenin notlarını en yeni üstte olacak şekilde getirir.
    // Where: sadece o projeye ait olanlar. OrderByDescending: Task'taki gibi
    // elle sıralanan bir Order alanı yok - not en son ne zaman eklendiyse ona göre sıralanır.
    public async Task<IReadOnlyList<Note>> GetAllByProjectAsync(int projectId) =>
        await _db.Notes
            .Where(n => n.ProjectId == projectId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

    public Task<Note?> GetByIdAsync(int id) =>
        _db.Notes.FirstOrDefaultAsync(t => t.Id == id);

    public async Task AddAsync(Note note)
    {
        _db.Notes.Add(note);
        await _db.SaveChangesAsync();
    }

    // Not: EF change tracking sayesinde, GetByIdAsync ile çekilmiş bir entity'nin
    // alanlarını değiştirip SaveChangesAsync demek UPDATE için yeterli —
    // ayrıca _db.Notes.Update(note) çağırmaya gerek yok.
    public async Task UpdateAsync(Note note)
    {
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Note note)
    {
        _db.Notes.Remove(note);
        await _db.SaveChangesAsync();
    }
}