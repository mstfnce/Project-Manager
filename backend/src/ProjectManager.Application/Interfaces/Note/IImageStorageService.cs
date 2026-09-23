namespace ProjectManager.Application.Interfaces;

// Bir resmi kalici olarak saklayip, tarayicidan erisilebilecek bir adres
// (URL) donduren soyutlama. Nasil sakladigi (diskte, bulutta vs.) bu
// katmani ilgilendirmiyor - Infrastructure'daki gercek implementasyon karar verir.
public interface IImageStorageService
{
    // fileName: orijinal dosya adinin uzantisi (".png" gibi) cikarmak icin
    // kullaniliyor, dosyanin kendi adi olarak saklanmiyor (GUID kullanilacak).
    Task<string> SaveAsync(Stream content, string fileName);
}