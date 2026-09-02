using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.Application.DTOs.Project;
using ProjectManager.Application.Services;

namespace ProjectManager.Api.Controllers;

// Proje CRUD isteklerini karşılayan katman. İş kuralını kendisi yapmaz,
// ProjectService'e devreder - AuthController ile aynı desen.
[Authorize]                    // bu controller'daki her endpoint giriş gerektirir
[ApiController]
[Route("api/[controller]")]    // "Projects" -> api/projects
public class ProjectsController : ControllerBase
{
    private readonly ProjectService _projectService;

    // Constructor injection: DI container ProjectService'i (ve onun
    // IProjectRepository bağımlılığını) Program.cs'teki kayıtlara göre dolduruyor.
    public ProjectsController(ProjectService projectService)
    {
        _projectService = projectService;
    }

    // GET api/projects
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _projectService.GetAllAsync();
        return Ok(projects);
    }

    // GET api/projects/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _projectService.GetByIdAsync(id);
        if (project is null) return NotFound();

        return Ok(project);
    }

    // POST api/projects
    [HttpPost]
    public async Task<IActionResult> Create(CreateProjectRequest request)
    {
        var project = await _projectService.CreateAsync(request);

        // 201 Created + Location header: yeni kaynağın GetById ile nerede
        // bulunacağını (api/projects/{id}) response header'ında belirtir.
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    // PUT api/projects/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProjectRequest request)
    {
        var project = await _projectService.UpdateAsync(id, request);
        if (project is null) return NotFound();

        return Ok(project);
    }

    // DELETE api/projects/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _projectService.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();   // 204: silme başarılı, dönecek içerik yok
    }
}
