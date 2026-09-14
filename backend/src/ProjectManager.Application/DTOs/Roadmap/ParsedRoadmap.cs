namespace ProjectManager.Application.DTOs.Roadmap;

// Ayristiricinin urettigi ham yapi. Henuz veritabani kaydi degil, sadece
// "metinde ne gordum" bilgisi - bu yuzden Id, ProjectId gibi alanlar yok.
// Onizleme ekrani da tam olarak bunu gosteriyor, yani kullanici veritabanina
// yazilmadan once ayristiricinin ne anladigini goruyor.

// Bir alt gorev: baslik + (varsa) girintili satirlardan olusan aciklama.
public record ParsedItem(
    string Title,
    string? Description,
    string Status);          // Todo | InProgress | Blocked | Done

// Bir bolum = ana gorev. Kendi checkbox'i yok, Status altindaki
// maddelerden hesaplaniyor (hepsi bitmisse Done, hicbiri baslamamissa
// Todo, karisiksa InProgress).
public record ParsedSection(
    string Title,
    string Status,
    IReadOnlyList<ParsedItem> Items);
