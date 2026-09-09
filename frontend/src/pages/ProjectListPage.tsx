import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Grid2x2, List, Plus, Search } from "lucide-react";
import { deleteProject, getProjects } from "@/api/projects";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import type { ProjectResponse, ProjectStatus } from "@/types/project";

// Sekme siralamasi ve etiketleri - "Tumu" gercek bir ProjectStatus degeri
// degil, ozel bir filtre secenegi.
const statusFilters: { value: ProjectStatus | "All"; label: string }[] = [
  { value: "All", label: "Tümü" },
  { value: "Active", label: "Aktif" },
  { value: "Planning", label: "Planlama" },
  { value: "Completed", label: "Tamamlandı" },
  { value: "Archived", label: "Arşivlendi" },
];

export function ProjectListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Doluysa duzenleme modu (ProjectFormModal'a bu proje verilir), null ise
  // "Yeni Proje" ile acilan olusturma modu.
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">(
    "All",
  );
  // Silme onayi bekleyen proje - doluysa ConfirmDialog acik demek.
  const [deletingProject, setDeletingProject] = useState<ProjectResponse | null>(
    null,
  );

  // Topbar'daki "Yeni Proje" butonu /projects?new=1 adresine gidiyor -
  // buraya gelince modali otomatik acip parametreyi URL'den temizliyoruz
  // (yoksa sayfa her yenilendiginde modal tekrar acilirdi).
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingProject(null);
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  // Kart uzerindeki cop kutusu sadece onay kutusunu aciyor, silme islemi
  // kullanici onaylayinca ConfirmDialog'un onConfirm'unde yapiliyor.
  function handleDeleteClick(project: ProjectResponse) {
    setDeletingProject(project);
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
    return <div className="p-8 text-muted-foreground">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="p-8 text-destructive">Projeler yüklenemedi.</div>;
  }

  const projects = data?.data ?? [];

  const filteredProjects =
    statusFilter === "All"
      ? projects
      : projects.filter((project) => project.status === statusFilter);

  return (
    <div className="p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.04em] text-brand">
            Yönetim Konsolu
          </div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-heading">
            Projeler
          </h1>
          <p className="mt-1 max-w-[46ch] text-[13.5px] text-muted-foreground">
            Tüm aktif ve planlanan projelerini tek yerden yönet.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-[12.5px] font-bold text-muted-foreground shadow-sm">
            <FolderOpen className="size-[15px] text-brand" />
            <span className="text-sm text-heading">{projects.length}</span>
            Proje Kayıtlı
          </div>
          <button
            type="button"
            onClick={handleCreateClick}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="size-[15px]" />
            Yeni Proje
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3.5 rounded-2xl border border-border bg-card p-3 shadow-sm">
        {/* Simdilik sadece gorsel - ileride proje/teknoloji adina gore
            filtrelemeyi aktif edecegiz. */}
        <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-[12.5px] text-faint">
          <Search className="size-3.5 shrink-0" />
          Proje veya teknoloji ara...
        </div>

        <div className="flex flex-wrap gap-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                statusFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-bold ${
                  statusFilter === filter.value
                    ? "bg-primary-foreground/20"
                    : "bg-muted"
                }`}
              >
                {filter.value === "All"
                  ? projects.length
                  : projects.filter((p) => p.status === filter.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Grid/liste gorunum toggle'i - simdilik sadece gorsel, liste
            gorunumu henuz tasarlanmadi. */}
        <div className="ml-auto flex gap-1 rounded-[10px] bg-muted p-[3px]">
          <button
            type="button"
            className="grid size-[30px] place-items-center rounded-lg bg-card text-primary shadow-sm"
          >
            <Grid2x2 className="size-3.5" />
          </button>
          <button
            type="button"
            className="grid size-[30px] place-items-center rounded-lg text-faint"
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-muted-foreground">
          {projects.length === 0
            ? "Henüz proje yok."
            : "Bu filtreye uyan proje yok."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
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

      <ConfirmDialog
        open={deletingProject !== null}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        title="Projeyi sil"
        description={`"${deletingProject?.name}" projesi ve içindeki tüm görev/notlar kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        onConfirm={() => {
          if (deletingProject) deleteMutation.mutate(deletingProject.id);
        }}
      />
    </div>
  );
}
