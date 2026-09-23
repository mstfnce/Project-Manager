using ProjectManager.Application.Interfaces;

namespace ProjectManager.Application.Services;

public class NoteImageService
{
    // Kabul edilen uzantilar - kucuk harfe cevirip kontrol edecegiz,
    // kullanici ".PNG" yazsa da calissin diye.
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    private const long MaxSizeBytes = 5 * 1024 * 1024; // 5 MB

    private readonly IImageStorageService _imageStorageService;

    public NoteImageService(IImageStorageService imageStorageService)
    {
        _imageStorageService = imageStorageService;
    }

    public async Task<string> UploadAsync(Stream content, string fileName, long sizeBytes)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
            throw new InvalidOperationException(
                "Sadece jpg, png veya webp formatinda resim yuklenebilir.");

        if (sizeBytes > MaxSizeBytes)
            throw new InvalidOperationException("Resim en fazla 5 MB olabilir.");

        return await _imageStorageService.SaveAsync(content, fileName);
    }
}
