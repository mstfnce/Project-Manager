using ProjectManager.Application.DTOs.Dashboard;
using ProjectManager.Application.Interfaces;
using ProjectManager.Domain.Enums;

namespace ProjectManager.Application.Services;

// Dashboard ozet verisini ureten servis. CRUD yapmiyor, sadece mevcut
// Project ve Task verilerini okuyup toplu bir sayimla ozetliyor.
public class DashboardService
{
    private readonly IProjectRepository _projectRepository;
    private readonly ITaskRepository _taskRepository;

    public DashboardService(IProjectRepository projectRepository, ITaskRepository taskRepository)
    {
        _projectRepository = projectRepository;
        _taskRepository = taskRepository;
    }

    public async Task<DashboardSummaryResponse> GetSummaryAsync()
    {
        var projects = await _projectRepository.GetAllAsync();
        var tasks = await _taskRepository.GetAllAsync();

        var activeTasks = tasks.Where(t => t.Status != WorkItemStatus.Done);

        var upcomingDeadlines = activeTasks
            .Where(t => t.DueDate is not null)
            .OrderBy(t => t.DueDate)
            .Take(5)
            .Select(t => new UpcomingTaskResponse(
                // t.Project burada null degil, cunku TaskRepository.GetAllAsync()
                // .Include(t => t.Project) ile cekiyor - o Include olmasaydi
                // navigation property doldurulmamis (null) gelirdi.
                t.Id, t.Title, t.ProjectId, t.Project.Name, t.DueDate!.Value))
            .ToList();

        return new DashboardSummaryResponse(
            TotalProjects: projects.Count,
            ActiveProjects: projects.Count(p => p.Status == ProjectStatus.Active),
            ActiveTaskCount: activeTasks.Count(),
            UpcomingDeadlines: upcomingDeadlines);
    }
}
