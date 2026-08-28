namespace ProjectManager.Domain.Enums;

// Bir Project'in yaşam döngüsünde her an bulunabileceği durum.
public enum ProjectStatus
{
    Planning,   // henüz başlanmadı, fikir/plan aşamasında
    Active,     // üzerinde aktif çalışılıyor
    Paused,     // geçici olarak durduruldu, terk edilmedi
    Completed,  // hedeflenen iş bitti
    Archived    // artık takip edilmiyor, arşive kaldırıldı
}
