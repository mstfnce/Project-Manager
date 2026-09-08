// Backend'deki UpcomingTaskResponse.cs record'una birebir karsilik gelir.
// DueDate JSON'da ISO 8601 string olarak gelir, Date objesi degil - tipki
// ProjectResponse.createdAt gibi.
export interface UpcomingTaskResponse {
  taskId: number
  taskTitle: string
  projectId: number
  projectName: string
  dueDate: string
}

// GET /api/dashboard/summary bu sekli donuyor.
// Backend'deki DashboardSummaryResponse.cs record'una birebir karsilik gelir.
export interface DashboardSummaryResponse {
  totalProjects: number
  activeProjects: number
  activeTaskCount: number
  upcomingDeadlines: UpcomingTaskResponse[]
}
