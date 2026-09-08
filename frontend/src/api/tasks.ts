import { apiClient } from './client'
import type {
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '@/types/task'

// GET /api/projects/{projectId}/tasks - bir projenin tum gorevlerini listeler.
export function getTasksByProject(projectId: number) {
  return apiClient.get<TaskResponse[]>(`/projects/${projectId}/tasks`)
}

// POST /api/projects/{projectId}/tasks - yeni gorev olusturur.
export function createTask(projectId: number, data: CreateTaskRequest) {
  return apiClient.post<TaskResponse>(`/projects/${projectId}/tasks`, data)
}

// PUT /api/tasks/{id} - var olan gorevi gunceller (Status dahil).
export function updateTask(id: number, data: UpdateTaskRequest) {
  return apiClient.put<TaskResponse>(`/tasks/${id}`, data)
}

// PATCH /api/tasks/{id}/status - sadece durumu degistirir (kanban'da kart
// baska bir sutuna tasindiginda kullanilir).
export function updateTaskStatus(id: number, data: UpdateTaskStatusRequest) {
  return apiClient.patch<TaskResponse>(`/tasks/${id}/status`, data)
}

// DELETE /api/tasks/{id} - gorevi siler.
export function deleteTask(id: number) {
  return apiClient.delete(`/tasks/${id}`)
}
