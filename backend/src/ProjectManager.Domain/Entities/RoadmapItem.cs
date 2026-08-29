namespace ProjectManager.Domain.Entities;

// Bir projenin kendi iç içe checklist/roadmap maddesi (ROADMAP.md'nin DB karşılığı).
// İlerleme yüzdesi burada saklanmaz, gösterilirken Children'dan anlık hesaplanır.
public class RoadmapItem
{
    public int Id { get; set; }
    public int ProjectId { get; set; }     // foreign key -> Projects tablosu
    public int? ParentId { get; set; }     // self-reference: null = en üst seviye ("Bölüm")
    public string Title { get; set; } = string.Empty;
    public bool IsDone { get; set; }       // checkbox durumu
    public int Order { get; set; }         // aynı üst madde altındaki sıra

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Project Project { get; set; } = null!;
    public RoadmapItem? Parent { get; set; }          // üst madde (en üst seviyede null)
    public List<RoadmapItem> Children { get; set; } = [];   // alt maddeler
}
