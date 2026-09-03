using ProjectManager.Domain.Entities;

namespace ProjectManager.Application.Interfaces;

public interface IProjectRepository
{
    // 1. Listele (Tüm projeleri getir)
    Task<IReadOnlyList<Project>> GetAllAsync();

    // 2. Tek Getir (Id ile getir - bulunamayabileceği için nullable)
    Task<Project?> GetByIdAsync(int id);

    // 3. Ekle
    Task AddAsync(Project project);

    // 4. Güncelle
    Task UpdateAsync(Project project);

    // 5. Sil
    Task DeleteAsync(Project project);

    // 6. Slug çakışma kontrolü (aynı isimli iki proje aynı slug'ı üretmesin diye)
    Task<bool> SlugExistsAsync(string slug);
}