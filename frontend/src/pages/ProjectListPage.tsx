import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteProject, getProjects } from "@/api/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { Button } from "@/components/ui/button";
import type { ProjectResponse } from "@/types/project";

export function ProjectListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Doluysa duzenleme modu (ProjectFormModal'a bu proje verilir), null ise
  // "Yeni Proje" ile acilan olusturma modu.
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(
    null,
  );

  // data/isLoading/error nereden geliyor, data?.data neden iki kere data:
  // bkz. docs/notlar/react-query-temelleri.md
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  function handleDelete(project: ProjectResponse) {
    if (
      window.confirm(
        `"${project.name}" projesini silmek istediğinize emin misiniz?`,
      )
    ) {
      deleteMutation.mutate(project.id);
    }
  }

  function handleCreateClick() {
    setEditingProject(null);
    setIsModalOpen(true);
  }

  function handleEditClick(project: ProjectResponse) {
    setEditingProject(project);
    setIsModalOpen(true);
  }

  function handleModalOpenChange(open: boolean) {
    setIsModalOpen(open);
    if (!open) {
      setEditingProject(null);
    }
  }

  if (isLoading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Projeler yüklenemedi.</div>;
  }

  const projects = data?.data ?? [];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Projeler</h1>
        <Button onClick={handleCreateClick}>+ Yeni Proje</Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-slate-500">Henüz proje yok.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        key={editingProject?.id ?? "create"}
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        project={editingProject}
      />
    </div>
  );
}
