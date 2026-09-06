using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.Application.DTOs.Notes;
using ProjectManager.Application.Services;

namespace ProjectManager.Api.Controllers;

// Note CRUD isteklerini karşılayan katman. TasksController ile aynı desen,
// tek fark: bazı route'lar bir projeye bağlı (nested), bazıları düz note id'siyle
// çalışıyor - o yüzden class seviyesinde [Route] yok, her metot kendi tam yolunu tanımlıyor.
[Authorize]
[ApiController]
public class NotesController : ControllerBase
{
    private readonly NoteService _noteService;

    public NotesController(NoteService noteService)
    {
        _noteService = noteService;
    }

    // GET /api/projects/{projectId}/notes
    [HttpGet("/api/projects/{projectId}/notes")]
    public async Task<IActionResult> GetAllByProject(int projectId)
    {
        var notes = await _noteService.GetAllByProjectAsync(projectId);
        if (notes is null) return NotFound();   // proje yok

        return Ok(notes);                        // proje var, liste boş da olabilir
    }

    // GET /api/notes/{id}
    [HttpGet("/api/notes/{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var note = await _noteService.GetByIdAsync(id);
        if (note is null) return NotFound();

        return Ok(note);
    }

    // POST /api/projects/{projectId}/notes
    [HttpPost("/api/projects/{projectId}/notes")]
    public async Task<IActionResult> Create(int projectId, CreateNoteRequest request)
    {
        var note = await _noteService.CreateAsync(projectId, request);
        if (note is null) return NotFound();   // proje yok

        return CreatedAtAction(nameof(GetById), new { id = note.Id }, note);
    }

    // PUT /api/notes/{id}
    [HttpPut("/api/notes/{id}")]
    public async Task<IActionResult> Update(int id, UpdateNoteRequest request)
    {
        var note = await _noteService.UpdateAsync(id, request);
        if (note is null) return NotFound();

        return Ok(note);
    }

    // DELETE /api/notes/{id}
    [HttpDelete("/api/notes/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _noteService.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}
