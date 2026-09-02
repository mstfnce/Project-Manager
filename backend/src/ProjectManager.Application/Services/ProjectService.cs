using System.Text.RegularExpressions;
using ProjectManager.Application.DTOs.Project;
using ProjectManager.Application.Interfaces;
using ProjectManager.Domain.Entities;
using ProjectManager.Domain.Enums;

namespace ProjectManager.Application.Services;

// Proje CRUD iş kurallarını barındıran servis. Repository'yi (IProjectRepository)
// kullanır, gerçek implementasyonu (EF Core) hiç bilmez - AuthService ile aynı desen.
public class ProjectService
{
    private readonly IProjectRepository _projectRepository;

    public ProjectService(IProjectRepository projectRepository)
    {
        _projectRepository = projectRepository;
    }

    // Yeni proje oluşturur: slug üretir, entity'yi kurar, kaydeder, DTO döner.
    public async Task<ProjectResponse> CreateAsync(CreateProjectRequest request)
    {
        // İsimden benzersiz bir slug üret (çakışırsa -2, -3 diye devam eder).
        var slug = await GenerateUniqueSlugAsync(request.Name);

        var project = new Project
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            TechStack = request.TechStack ?? Array.Empty<string>(),
            RepositoryUrl = request.RepositoryUrl,
            Status = ProjectStatus.Planning,   // yeni proje her zaman Planning ile başlar
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _projectRepository.AddAsync(project);

        return ToResponse(project);
    }

    // Entity'yi dışarıya dönecek DTO'ya çevirir. Şifre gibi hassas alan yok burada
    // ama prensip aynı: entity'nin iç yapısını (navigation property'ler dahil)
    // dışarı sızdırmamak, sadece sayı olarak Task/Note miktarını taşımak.
    private static ProjectResponse ToResponse(Project project) =>
    new(
        project.Id,
        project.Name,
        project.Slug,
        project.Description,
        project.Status.ToString(),
        project.TechStack,
        project.RepositoryUrl,
        project.CreatedAt,
        project.UpdatedAt,
        project.Tasks?.Count ?? 0,
        project.Notes?.Count ?? 0);

    // --- Slug üretimi ---

    // İsimden temel slug'ı üretir, veritabanında çakışma varsa sonuna -2, -3
    // diye ekleyerek benzersiz bir slug bulana kadar dener.
    private async Task<string> GenerateUniqueSlugAsync(string name)
    {
        var baseSlug = Slugify(name);
        var slug = baseSlug;
        var counter = 2;

        // Bu slug zaten kullanılıyorsa sonuna sayı ekleyip tekrar dene.
        while (await _projectRepository.SlugExistsAsync(slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }
    // Ham metni (proje adını) URL-dostu bir slug'a çevirir: küçük harf,
    // Türkçe karakterler normalize, boşluk/noktalama '-' olur.
    private static string Slugify(string input)
    {
        // 1. Küçük harfe çevir (Invariant: Türkçe "I" sorunundan etkilenmesin diye)
        var text = input.ToLowerInvariant();

        // 2. Türkçe karakterleri URL-dostu karşılıklarına çevir
        text = text
            .Replace('ç', 'c').Replace('ğ', 'g').Replace('ı', 'i')
            .Replace('ö', 'o').Replace('ş', 's').Replace('ü', 'u');

        // 3. a-z/0-9 olmayan her ardışık karakter grubunu tek '-' yap
        text = Regex.Replace(text, @"[^a-z0-9]+", "-");

        // 4. Baştaki/sondaki '-' karakterlerini kırp
        text = text.Trim('-');

        return text;
    }


    // Tüm projeleri getirir, her birini DTO'ya çevirir.
    public async Task<IReadOnlyList<ProjectResponse>> GetAllAsync()
    {
        var projects = await _projectRepository.GetAllAsync();
        return projects.Select(ToResponse).ToList();
    }

    // Id ile tek proje getirir. Bulunamazsa null döner (exception değil -
    // "yok" burada bir hata değil, normal bir durum; Controller bunu 404'e çevirir).
    public async Task<ProjectResponse?> GetByIdAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        return project is null ? null : ToResponse(project);
    }

    // Var olan projeyi günceller. Önce id ile bulur, bulamazsa null döner.
    // Bulursa alanları request'ten gelen değerlerle değiştirir ve kaydeder.
    public async Task<ProjectResponse?> UpdateAsync(int id, UpdateProjectRequest request)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project is null) return null;

        project.Name = request.Name;
        project.Description = request.Description;
        project.TechStack = request.TechStack ?? Array.Empty<string>();
        project.RepositoryUrl = request.RepositoryUrl;
        // Status DTO'da string geliyor (JSON'da enum'lar string yazılıyor),
        // entity'ye atamak için tekrar ProjectStatus enum'ına çeviriyoruz.
        project.Status = Enum.Parse<ProjectStatus>(request.Status);
        project.UpdatedAt = DateTime.UtcNow;

        await _projectRepository.UpdateAsync(project);

        return ToResponse(project);
    }

    // Projeyi siler. true = silindi, false = zaten yoktu (Controller 404/204 ayrımını buna göre yapar).
    public async Task<bool> DeleteAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project is null) return false;

        await _projectRepository.DeleteAsync(project);
        return true;
    }
}