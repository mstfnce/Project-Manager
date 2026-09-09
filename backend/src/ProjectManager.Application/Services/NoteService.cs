using ProjectManager.Application.DTOs.Notes;
using ProjectManager.Application.Interfaces;
using ProjectManager.Domain.Entities;
using ProjectManager.Domain.Enums;

namespace ProjectManager.Application.Services;

// Not (Note) CRUD iş kurallarını barındıran servis. TaskService ile aynı desen:
// iki repository kullanıyor - kendi verisi için INoteRepository, "bu proje
// gerçekten var mı" kontrolü için IProjectRepository.
public class NoteService
{
    private readonly INoteRepository _noteRepository;
    private readonly IProjectRepository _projectRepository;

    public NoteService(INoteRepository noteRepository, IProjectRepository projectRepository)
    {
        _noteRepository = noteRepository;
        _projectRepository = projectRepository;
    }

    // Bir projenin notlarını listeler. Proje yoksa null (Controller 404'e çevirir),
    // proje var ama not yoksa boş liste - TaskService ile aynı ayrım.
    public async Task<IReadOnlyList<NoteResponse>?> GetAllByProjectAsync(int projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project is null) return null;

        var notes = await _noteRepository.GetAllByProjectAsync(projectId);
        return notes.Select(ToResponse).ToList();
    }

    // Tum projelerdeki notlar - global Notlar sayfasi icin.
    // Burada "proje var mi" kontrolu yok, cunku belirli bir projeye
    // bagli degiliz; hic not yoksa bos liste donuyor, null degil.
    public async Task<IReadOnlyList<NoteWithProjectResponse>> GetAllAsync()
    {
        var notes = await _noteRepository.GetAllAsync();
        return notes.Select(ToResponseWithProject).ToList();
    }

    // Id ile tek not getirir. Bulunamazsa null (Controller 404'e çevirir).
    public async Task<NoteResponse?> GetByIdAsync(int id)
    {
        var note = await _noteRepository.GetByIdAsync(id);
        return note is null ? null : ToResponse(note);
    }

    // Projeye yeni not ekler. Proje yoksa null döner.
    public async Task<NoteResponse?> CreateAsync(int projectId, CreateNoteRequest request)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project is null) return null;

        var note = new Note
        {
            ProjectId = projectId,
            Title = request.Title,
            Content = request.Content,
            Type = Enum.Parse<NoteType>(request.Type),
            Tags = request.Tags,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _noteRepository.AddAsync(note);

        return ToResponse(note);
    }

    // Notun tüm düzenlenebilir alanlarını günceller (PUT - hepsini birden gönderir).
    public async Task<NoteResponse?> UpdateAsync(int id, UpdateNoteRequest request)
    {
        var note = await _noteRepository.GetByIdAsync(id);
        if (note is null) return null;

        note.Title = request.Title;
        note.Content = request.Content;
        note.Type = Enum.Parse<NoteType>(request.Type);
        note.Tags = request.Tags;
        note.UpdatedAt = DateTime.UtcNow;

        await _noteRepository.UpdateAsync(note);

        return ToResponse(note);
    }

    // Notu siler. true = silindi, false = zaten yoktu (Controller 204/404 ayrımını buna göre yapar).
    public async Task<bool> DeleteAsync(int id)
    {
        var note = await _noteRepository.GetByIdAsync(id);
        if (note is null) return false;

        await _noteRepository.DeleteAsync(note);
        return true;
    }

    // --- Yardımcılar ---

    private static NoteResponse ToResponse(Note note) =>
        new(note.Id, note.ProjectId, note.Title, note.Content,
            note.Type.ToString(), note.Tags, note.CreatedAt, note.UpdatedAt);

    // NoteResponse'un ProjectName'li hali. note.Project burada null degil,
    // cunku NoteRepository.GetAllAsync() .Include(n => n.Project) ile cekiyor -
    // o Include olmasaydi navigation property doldurulmamis (null) gelirdi.
    private static NoteWithProjectResponse ToResponseWithProject(Note note) =>
        new(note.Id, note.ProjectId, note.Project.Name, note.Title, note.Content,
            note.Type.ToString(), note.Tags, note.CreatedAt, note.UpdatedAt);
}
