using ProjectManager.Application.Interfaces;

namespace ProjectManager.Infrastructure.Services;

// Resimleri sunucunun diskinde saklayan implementasyon. Klasor yolu
// disaridan (Program.cs'ten) veriliyor - bu sinif ASP.NET Core'un
// IWebHostEnvironment'ini hic tanimiyor, sadece bir klasor yolu biliyor.
public class LocalImageStorageService : IImageStorageService
{
    private readonly string _uploadDirectory;

    public LocalImageStorageService(string uploadDirectory)
    {
        _uploadDirectory = uploadDirectory;
        Directory.CreateDirectory(_uploadDirectory); // yoksa olustur
    }

    public async Task<string> SaveAsync(Stream content, string fileName)
    {
        var extension = Path.GetExtension(fileName);
        var uniqueName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(_uploadDirectory, uniqueName);

        await using var fileStream = File.Create(filePath);
        await content.CopyToAsync(fileStream);

        return $"/uploads/notes/{uniqueName}";
    }
}
