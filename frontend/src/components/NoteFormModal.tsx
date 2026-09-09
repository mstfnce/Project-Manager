import { zodResolver } from '@hookform/resolvers/zod'
import { StickyNote, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { createNote, updateNote } from '@/api/notes'
import { getProjects } from '@/api/projects'
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
import type { NoteResponse, NoteType } from '@/types/note'

// Formda secilebilecek not turleri - backend'deki NoteType enum'uyla
// birebir ayni yazilmali (buyuk/kucuk harf dahil).
const typeOptions: NoteType[] = ['Decision', 'Learning', 'Idea', 'Meeting', 'General']

const typeLabels: Record<NoteType, string> = {
  Decision: 'Karar',
  Learning: 'Öğrenme',
  Idea: 'Fikir',
  Meeting: 'Toplantı',
  General: 'Genel',
}

const noteFormSchema = z.object({
  title: z.string().min(1, 'Başlık boş olamaz'),
  content: z.string().min(1, 'İçerik boş olamaz'),
  type: z.enum(typeOptions),
  // <select> her zaman string dondurur ("3"), sayiya cevirmeyi gonderirken
  // yapiyoruz. Bos string = kullanici henuz proje secmedi.
  projectId: z.string().min(1, 'Proje seçin'),
})

type NoteFormValues = z.infer<typeof noteFormSchema>

interface NoteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Doluysa "duzenle" modu (formu bu notun verisiyle onceden doldurur),
  // bos/undefined ise "olustur" modu - ProjectFormModal'daki ayni mantik.
  note?: NoteResponse | null
  // Proje sayfasindan aciliyorsa doludur (not o projeye eklenir), global
  // Notlar sayfasindan aciliyorsa bostur - o zaman formda proje secici cikar.
  projectId?: number
}

export function NoteFormModal({ open, onOpenChange, note, projectId }: NoteFormModalProps) {
  const isEditMode = !!note

  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [tagInput, setTagInput] = useState('')

  // Proje secici icin liste - sadece projectId verilmediginde gorunuyor ama
  // sorgu her durumda calisiyor; sidebar zaten ayni anahtari kullandigi icin
  // React Query cache'ten donuyor, ekstra istek olmuyor.
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })
  const projects = projectsData?.data ?? []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
      type: note?.type ?? 'General',
      // Duzenlemede notun kendi projesi, proje sayfasinda prop'tan gelen
      // proje, global sayfada bos (kullanici secene kadar zod hata verir).
      projectId: String(note?.projectId ?? projectId ?? ''),
    },
  })

  const queryClient = useQueryClient()
  const mutation = useMutation({
    // projectId'yi ayirip aliyoruz: istek govdesinde yeri yok (backend'de
    // ProjectId URL'den geliyor), sadece hangi projeye ekleyecegimizi soyluyor.
    mutationFn: ({ projectId: selectedProjectId, ...values }: NoteFormValues) =>
      note
        ? updateNote(note.id, { ...values, tags })
        : createNote(Number(selectedProjectId), { ...values, tags }),
    onSuccess: () => {
      // ['notes'] onek olarak eslesiyor - hem proje-ici liste (['notes', 5])
      // hem global liste (['notes', 'all']) birden tazeleniyor.
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      handleClose()
    },
  })

  function handleClose() {
    reset()
    setTags(note?.tags ?? [])
    setTagInput('')
    onOpenChange(false)
  }

  function addTag(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()

    const value = tagInput.trim()
    if (value && !tags.includes(value)) {
      setTags([...tags, value])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  function onSubmit(values: NoteFormValues) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <StickyNote className="size-4 text-primary-foreground" />
            </div>
            <DialogTitle>{isEditMode ? 'Notu Düzenle' : 'Yeni Not Ekle'}</DialogTitle>
          </div>
          <DialogDescription>
            {isEditMode ? 'Not bilgilerini güncelleyin.' : 'Yeni bir not ekleyin.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Proje secici sadece projectId prop'u verilmediginde gorunur -
              global Notlar sayfasindan aciliyorsa hangi projeye eklenecegi
              belli degil, sormamiz gerekiyor. */}
          {!projectId && !isEditMode && (
            <div>
              <label
                htmlFor="projectId"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Proje
              </label>
              <select
                id="projectId"
                {...register('projectId')}
                className="w-full rounded-xl bg-muted px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="">Proje seçin...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-destructive">{errors.projectId.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                Başlık
              </label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-foreground">
                Tür
              </label>
              <select
                id="type"
                {...register('type')}
                className="w-full rounded-xl bg-muted px-3 py-2 text-sm text-foreground outline-none"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {typeLabels[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-foreground">
              İçerik (Markdown desteklenir)
            </label>
            <Textarea
              id="content"
              rows={12}
              className="max-h-64 overflow-y-auto"
              {...register('content')}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground">Etiketler</span>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-muted p-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs text-foreground"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
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

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Kaydediliyor...'
                : isEditMode
                  ? 'Değişiklikleri Kaydet'
                  : 'Not Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
