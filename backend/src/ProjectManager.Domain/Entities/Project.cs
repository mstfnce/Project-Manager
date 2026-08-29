using ProjectManager.Domain.Enums;

namespace ProjectManager.Domain.Entities;

// Takip edilen bir proje. Sistemin merkezi entity'si — TaskItem, Note ve
// RoadmapItem hep bir Project'e bağlı, tek başlarına var olamazlar.
public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;   // URL-dostu isim, örn: "dotnet-store"
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    public string[] TechStack { get; set; } = [];       // Postgres native dizi, örn: ["React", ".NET"]
    public string? RepositoryUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties — EF Core bunları DbContext'te kuracağımız
    // ilişkiler üzerinden dolduracak, elle atanmaz.
    public List<TaskItem> Tasks { get; set; } = [];
    public List<Note> Notes { get; set; } = [];
    public List<RoadmapItem> RoadmapItems { get; set; } = [];
}
