using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.Application.DTOs.Tasks;
using ProjectManager.Application.Services;

namespace ProjectManager.Api.Controllers;

// Task CRUD isteklerini karşılayan katman. ProjectsController ile aynı desen,
// tek fark: bazı route'lar bir projeye bağlı (nested), bazıları düz task id'siyle
// çalışıyor - o yüzden class seviyesinde [Route] yok, her metot kendi tam yolunu tanımlıyor.
[Authorize]
[ApiController]
public class TasksController : ControllerBase
{
    private readonly TaskService _taskService;

    public TasksController(TaskService taskService)
    {
        _taskService = taskService;
    }

    // GET /api/projects/{projectId}/tasks
    [HttpGet("/api/projects/{projectId}/tasks")]
    public async Task<IActionResult> GetAllByProject(int projectId)
    {
        var tasks = await _taskService.GetAllByProjectAsync(projectId);
        if (tasks is null) return NotFound();   // proje yok

        return Ok(tasks);                        // proje var, liste boş da olabilir
    }

    // GET /api/tasks/{id}
    [HttpGet("/api/tasks/{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _taskService.GetByIdAsync(id);
        if (task is null) return NotFound();

        return Ok(task);
    }

    // POST /api/projects/{projectId}/tasks
    [HttpPost("/api/projects/{projectId}/tasks")]
    public async Task<IActionResult> Create(int projectId, CreateTaskRequest request)
    {
        var task = await _taskService.CreateAsync(projectId, request);
        if (task is null) return NotFound();   // proje yok

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    // PUT /api/tasks/{id}
    [HttpPut("/api/tasks/{id}")]
    public async Task<IActionResult> Update(int id, UpdateTaskRequest request)
    {
        var task = await _taskService.UpdateAsync(id, request);
        if (task is null) return NotFound();

        return Ok(task);
    }

    // PATCH /api/tasks/{id}/status
    [HttpPatch("/api/tasks/{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateTaskStatusRequest request)
    {
        var task = await _taskService.UpdateStatusAsync(id, request);
        if (task is null) return NotFound();

        return Ok(task);
    }

    // DELETE /api/tasks/{id}
    [HttpDelete("/api/tasks/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _taskService.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}
