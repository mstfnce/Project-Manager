namespace ProjectManager.Application.DTOs.Tasks;

// Kanban'da kart sürüklenip başka bir sütuna bırakıldığında gönderilen veri
// (PATCH /api/tasks/{id}/status). Tek alanlı olmasının iki sebebi var:
// 1) Sadece sütun değişiyor - başlığı, açıklamayı tekrar göndermek gereksiz.
// 2) PUT ile yapsaydık, elimizdeki veri eskiyse (bu arada birisi başlığı
//    değiştirmişse) o değişikliğin üzerine eski değeri yazardık. PATCH
//    "kısmi güncelleme" olduğu için diğer alanlara hiç dokunmaz.
public record UpdateTaskStatusRequest(string Status);
