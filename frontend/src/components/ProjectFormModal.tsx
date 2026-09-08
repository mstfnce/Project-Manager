import { zodResolver } from '@hookform/resolvers/zod'
import { FolderPlus, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { createProject, updateProject } from '@/api/projects'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ProjectResponse, ProjectStatus } from '@/types/project'

const statusOptions: ProjectStatus[] = ['Planning', 'Active', 'Paused', 'Completed', 'Archived']

const projectFormSchema = z.object({
  name: z.string().min(1, 'Proje adı boş olamaz'),
  description: z.string().optional(),
  repositoryUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  // Sadece duzenleme modunda kullanilir - olusturma sirasinda backend her
  // zaman Planning atiyor, bu yuzden formda gorunmuyor bile.
  status: z.enum(statusOptions).optional(),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Doluysa "duzenle" modu (formu bu projenin verisiyle onceden doldurur),
  // bos/undefined ise "olustur" modu.
  project?: ProjectResponse | null
}

export function ProjectFormModal({ open, onOpenChange, project }: ProjectFormModalProps) {
  const isEditMode = !!project

  const [techStack, setTechStack] = useState<string[]>(project?.techStack ?? [])
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
      repositoryUrl: project?.repositoryUrl ?? '',
      status: project?.status,
    },
  })

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (values: ProjectFormValues) =>
      project
        ? updateProject(project.id, {
            name: values.name,
            description: values.description || null,
            techStack,
            repositoryUrl: values.repositoryUrl || null,
            status: values.status ?? project.status,
          })
        : createProject({
            name: values.name,
            description: values.description || null,
            techStack,
            repositoryUrl: values.repositoryUrl || null,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      handleClose()
    },
  })

  function handleClose() {
    reset()
    setTechStack(project?.techStack ?? [])
    setTagInput('')
    onOpenChange(false)
  }

  function addTag(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()

    const value = tagInput.trim()
    if (value && !techStack.includes(value)) {
      setTechStack([...techStack, value])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTechStack(techStack.filter((t) => t !== tag))
  }

  function onSubmit(values: ProjectFormValues) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900">
              <FolderPlus className="size-4 text-white" />
            </div>
            <DialogTitle>{isEditMode ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}</DialogTitle>
          </div>
          <DialogDescription>
            {isEditMode
              ? 'Proje bilgilerini güncelleyin.'
              : 'Takımınız için yeni bir çalışma alanı ve takip akışı başlatın.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Proje Adı
            </label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Açıklama
            </label>
            <Textarea id="description" {...register('description')} />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Teknolojiler
            </span>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-slate-700"
                >
                  {tech}
                  <button type="button" onClick={() => removeTag(tech)}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="+ Ekle"
                className="min-w-16 flex-1 bg-transparent px-1 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="repositoryUrl"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Depo / Repo Linki
            </label>
            <Input id="repositoryUrl" {...register('repositoryUrl')} />
            {errors.repositoryUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.repositoryUrl.message}</p>
            )}
          </div>

          {/* Durum secici sadece duzenleme modunda gorunur - backend yeni
              projeyi her zaman Planning ile baslatiyor, olusturken sormaya
              gerek yok. */}
          {isEditMode && (
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-700">
                Durum
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Kaydediliyor...'
                : isEditMode
                  ? 'Değişiklikleri Kaydet'
                  : 'Proje Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
