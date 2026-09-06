namespace ProjectManager.Application.DTOs.Dashboard;

// Ana sayfada (dashboard) gosterilecek ozet veri - tek bir istekte
// "genel durum ne" sorusunun cevabi.
public record DashboardSummaryResponse(
    int TotalProjects,
    int ActiveProjects,
    int ActiveTaskCount,
    IReadOnlyList<UpcomingTaskResponse> UpcomingDeadlines);
