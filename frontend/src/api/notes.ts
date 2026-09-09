import { apiClient } from './client'
import type { CreateNoteRequest, NoteResponse, UpdateNoteRequest } from '@/types/note'

// GET /api/projects/{projectId}/notes - bir projenin tum notlarini listeler.
export function getNotesByProject(projectId: number) {
  return apiClient.get<NoteResponse[]>(`/projects/${projectId}/notes`)
}

// POST /api/projects/{projectId}/notes - yeni not olusturur.
export function createNote(projectId: number, data: CreateNoteRequest) {
  return apiClient.post<NoteResponse>(`/projects/${projectId}/notes`, data)
}

// PUT /api/notes/{id} - var olan notu gunceller.
export function updateNote(id: number, data: UpdateNoteRequest) {
  return apiClient.put<NoteResponse>(`/notes/${id}`, data)
}

// DELETE /api/notes/{id} - notu siler.
export function deleteNote(id: number) {
  return apiClient.delete(`/notes/${id}`)
}
