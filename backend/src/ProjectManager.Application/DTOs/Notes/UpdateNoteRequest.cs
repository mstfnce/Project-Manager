namespace ProjectManager.Application.DTOs.Notes;

// Var olan bir notu duzenlerken beklenen veri (PUT /api/notes/{id}).
// Task'taki UpdateTaskRequest'ten farkli olarak burada Status gibi ayri bir
// PATCH senaryosu yok - not "durum" tasimiyor, o yuzden tek bir PUT yeterli.
// PUT "hepsini gonder" demek: eksik gonderilen alan null/bos yazilir, o yuzden
// duzenlenebilir butun alanlar burada tam olarak yer aliyor.
public record UpdateNoteRequest(string Title, string Content, string Type, string[] Tags);
