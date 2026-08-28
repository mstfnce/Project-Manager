namespace ProjectManager.Domain.Enums;

// Bir Note'un türü — notlar & kararlar günlüğünde filtreleme için kullanılacak.
public enum NoteType
{
    Decision,  // "şunu şu sebeple seçtik" türü kayıtlar
    Learning,  // öğrenilen yeni bir şey, teknik detay
    Idea,      // ileride değerlendirilecek fikir
    Meeting,   // toplantı notu
    General    // yukarıdakilere uymayan her şey
}
