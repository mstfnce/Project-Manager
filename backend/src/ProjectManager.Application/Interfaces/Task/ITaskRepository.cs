using ProjectManager.Domain.Entities;

namespace ProjectManager.Application.Interfaces;

public interface ITaskRepository
{
    // 1. Bir projenin tüm görevlerini listele
    Task<IReadOnlyList<TaskItem>> GetAllByProjectAsync(int projectId);

    Task<IReadOnlyList<TaskItem>> GetAllAsync();   // YENİ - dashboard için tüm projelerdeki görevler

    // 2. Tek Getir (Id ile getir - bulunamayabileceği için nullable)
    Task<TaskItem?> GetByIdAsync(int id);

    // 3. Ekle
    Task AddAsync(TaskItem task);

    // 4. Güncelle
    Task UpdateAsync(TaskItem task);

    // 5. Sil
    Task DeleteAsync(TaskItem task);
}
