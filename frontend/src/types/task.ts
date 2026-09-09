// Backend'deki WorkItemStatus enum'unun degerleri - kanban'daki 4 sutuna
// karsilik gelir.
export type TaskStatus = 'Todo' | 'InProgress' | 'Blocked' | 'Done'

// Backend'deki TaskPriority enum'unun degerleri.
export type TaskPriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical'

// GET /api/projects/{projectId}/tasks ve GET /api/tasks/{id} bu sekli donuyor.
// Backend'deki TaskResponse.cs record'una birebir karsilik gelir.
export interface TaskResponse {
  id: number
  projectId: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriorityLevel
  dueDate: string | null
  completedAt: string | null
  order: number
  createdAt: string
  updatedAt: string
  parentTaskId: number | null   // null = ana gorev, doluysa alt gorev
}

// POST /api/projects/{projectId}/tasks bu sekli bekliyor - Status yok,
// yeni gorev her zaman Todo ile basliyor (backend'de otomatik ataniyor).
export interface CreateTaskRequest {
  title: string
  description?: string | null
  priority: TaskPriorityLevel
  dueDate?: string | null
  parentTaskId?: number | null
}

// PUT /api/tasks/{id} bu sekli bekliyor - Create'ten farki Status'un da
// gonderilebilmesi.
export interface UpdateTaskRequest {
  title: string
  description?: string | null
  priority: TaskPriorityLevel
  status: TaskStatus
  dueDate?: string | null
  parentTaskId?: number | null
}

// PATCH /api/tasks/{id}/status bu sekli bekliyor - kanban'da kart baska bir
// sutuna tasindiginda sadece bu gonderilir, diger alanlara dokunulmaz.
export interface UpdateTaskStatusRequest {
  status: TaskStatus
}
