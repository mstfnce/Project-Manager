namespace ProjectManager.Application.DTOs.Dashboard;

// Bir gorevin yaklasan deadline listesinde gorunen kisa hali - TaskResponse'un
// tamami degil, dashboard sadece kart/liste gorunumu icin gerekli alanlari tasir.
public record UpcomingTaskResponse(
    int TaskId,
    string TaskTitle,
    int ProjectId,
    string ProjectName,
    DateTime DueDate);
