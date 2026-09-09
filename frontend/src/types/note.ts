// Backend'deki NoteType enum'unun degerleri.
export type NoteType = 'Decision' | 'Learning' | 'Idea' | 'Meeting' | 'General'

// GET /api/projects/{projectId}/notes ve GET /api/notes/{id} bu sekli donuyor.
// Backend'deki NoteResponse.cs record'una birebir karsilik gelir.
export interface NoteResponse {
  id: number
  projectId: number
  title: string
  content: string
  type: NoteType
  tags: string[]
  createdAt: string
  updatedAt: string
}

// GET /api/notes bu sekli donuyor - NoteResponse ile ayni, sadece hangi
// projeye ait oldugunu gosteren projectName fazladan geliyor. Backend'deki
// NoteWithProjectResponse.cs record'una birebir karsilik gelir.
export interface NoteWithProjectResponse extends NoteResponse {
  projectName: string
}

// POST /api/projects/{projectId}/notes bu sekli bekliyor - ProjectId
// URL'den geliyor, Id/CreatedAt/UpdatedAt backend'de uretiliyor.
export interface CreateNoteRequest {
  title: string
  content: string
  type: NoteType
  tags: string[]
}

// PUT /api/notes/{id} bu sekli bekliyor - Create ile ayni alanlar,
// Note entity'sinde Task'taki Status gibi ayri bir "sadece guncellemede
// degisen" alan yok.
export interface UpdateNoteRequest {
  title: string
  content: string
  type: NoteType
  tags: string[]
}
