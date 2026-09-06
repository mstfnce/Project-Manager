using ProjectManager.Domain.Entities;

namespace ProjectManager.Application.Interfaces;

public interface INoteRepository
{
    // 1. Bir projenin tüm notlarını listele
    Task<IReadOnlyList<Note>> GetAllByProjectAsync(int projectId);

    // 2. Tek Getir (Id ile getir - bulunamayabileceği için nullable)
    Task<Note?> GetByIdAsync(int id);

    // 3. Ekle
    Task AddAsync(Note note);

    // 4. Güncelle
    Task UpdateAsync(Note note);

    // 5. Sil
    Task DeleteAsync(Note note);
}
