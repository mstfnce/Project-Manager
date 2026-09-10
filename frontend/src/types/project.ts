// Backend'deki ProjectStatus enum'unun degerleri - JSON'da string olarak
// geliyor (Program.cs'teki JsonStringEnumConverter sayesinde), sayi degil.
export type ProjectStatus = 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Archived'

// GET /api/projects ve GET /api/projects/{id} bu sekli donuyor.
// Backend'deki ProjectResponse.cs record'una birebir karsilik gelir.
export interface ProjectResponse {
  id: number
  name: string
  slug: string
  description: string | null
  status: ProjectStatus
  techStack: string[]
  repositoryUrl: string | null
  createdAt: string
  updatedAt: string
  taskCount: number
  completedTaskCount: number
  noteCount: number
}

// POST /api/projects bu sekli bekliyor - Id/Slug/Status/CreatedAt yok,
// bunlari backend kendisi uretiyor.
export interface CreateProjectRequest {
  name: string
  description?: string | null
  techStack?: string[] | null
  repositoryUrl?: string | null
}

// PUT /api/projects/{id} bu sekli bekliyor - Create'ten farki Status'un
// da gonderilebilmesi (proje Planning/Active/Paused/Completed/Archived
// arasinda gecis yapabiliyor).
export interface UpdateProjectRequest {
  name: string
  description?: string | null
  techStack?: string[] | null
  repositoryUrl?: string | null
  status: ProjectStatus
}
