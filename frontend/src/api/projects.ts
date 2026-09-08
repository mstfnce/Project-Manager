import { apiClient } from "./client";
import type {
  CreateProjectRequest,
  ProjectResponse,
  UpdateProjectRequest,
} from "@/types/project";

// GET /api/projects - tum projeleri listeler.
// ProjectListPage bu fonksiyonu cagiracak, backend'e nasil gidildigiyle
// ilgilenmeyecek - sadece "projeleri getir" diyecek.
export function getProjects() {
  return apiClient.get<ProjectResponse[]>("/projects");
}

// GET /api/projects/{id} - tek bir projeyi getirir.
// ProjectDetailPage bu fonksiyonu cagiracak - liste sayfasindan farkli olarak
// tek bir proje + o projenin gorevleri birlikte gosterilecek.
export function getProjectById(id: number) {
  return apiClient.get<ProjectResponse>(`/projects/${id}`);
}

// POST /api/projects - yeni proje olusturur
export function createProject(data: CreateProjectRequest) {
  return apiClient.post<ProjectResponse>("/projects", data);
}

// PUT /api/projects/{id} - var olan projeyi gunceller
export function updateProject(id: number, data: UpdateProjectRequest) {
  return apiClient.put<ProjectResponse>(`/projects/${id}`, data);
}

// DELETE /api/projects/{id} - projeyi siler
export function deleteProject(id: number) {
  return apiClient.delete(`/projects/${id}`);
}
