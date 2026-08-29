using ProjectManager.Domain.Enums;

namespace ProjectManager.Domain.Entities;

// Notlar & kararlar günlüğündeki tek bir kayıt. İş takibi değil, bilgi/karar kaydı.
public class Note
{
    public int Id { get; set; }
    public int ProjectId { get; set; }   // foreign key -> Projects tablosu
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;   // markdown metin
    public NoteType Type { get; set; } = NoteType.General;
    public string[] Tags { get; set; } = [];   // serbest metin etiketler, örn: ["auth", "postgresql"]
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Project Project { get; set; } = null!;   // navigation property
}
