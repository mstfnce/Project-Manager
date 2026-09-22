import { zodResolver } from '@hookform/resolvers/zod'
import { StickyNote, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
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

  // Yaz/Onizleme sekmesi - hangisi acik. Dosyadan doldurunca otomatik
  // 'preview'a geciyoruz ki kullanici ne geldigini hemen gorsun.
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Onizleme sekmesi anlik yazilan/doldurulan metni gostersin diye content'i
  // izliyoruz - register formu kaydediyor ama React'a "degisti" demiyor,
  // watch bu yuzden ayrica gerekiyor.
  const contentValue = watch('content')

  // .md dosyalari genelde okunakli olsun diye ~80 karakterde elle satir
  // kaydirmasiyla yazilir. remark-breaks (bkz. asagidaki onizleme) formda
  // elle yazarken Enter'a basinca gorsel kirilma olsun diye bilerek
  // eklenmisti - ama ayni sekilde dosyadaki her satir sonunu da zorla <br>
  // yapip tek paragraf olmasi gereken metni onlarca kisa satira boluyor,
  // sagda bos alan birakiyordu. Ice aktarirken paragraf ici duz metin
  // satirlarini tek satira birlestiriyoruz - liste/baslik/alinti/kod
  // bloklarina dokunmadan (onlar zaten kendi satirlarinda kalmali).
  function reflowImportedMarkdown(text: string): string {
    const lines = text.split('\n')
    const result: string[] = []
    let inCodeFence = false
    // Onceki satir birlestirilebilir duz metin miydi (bos/baslik/liste/kod
    // degil) - oyleyse bu satiri ona ekliyoruz, degilse yeni satir aciyoruz.
    let previousWasPlainText = false

    const blockMarker = /^\s*(#{1,6}\s|>|[-*+]\s|\d+\.\s|\|)/

    for (const line of lines) {
      const trimmed = line.trim()

      if (/^(```|~~~)/.test(trimmed)) {
        inCodeFence = !inCodeFence
        result.push(line)
        previousWasPlainText = false
        continue
      }

      if (inCodeFence || trimmed === '' || blockMarker.test(line)) {
        result.push(line)
        previousWasPlainText = false
        continue
      }

      if (previousWasPlainText) {
        result[result.length - 1] = `${result[result.length - 1]} ${trimmed}`
      } else {
        result.push(line)
      }
      previousWasPlainText = true
    }

    return result.join('\n')
  }

  // .md dosyasindan not doldurma - dosyanin icerigi dogrudan content'e
  // yaziliyor, dosyanin kendisi saklanmiyor (bkz. ROADMAP "Notlara resim
  // ekleme" notu - o ayri bir is, gercek dosya saklama gerektiriyor).
  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.md')) return // sessizce yok say

    const reader = new FileReader()
    reader.onload = () => {
      const raw = String(reader.result ?? '')
      setValue('content', reflowImportedMarkdown(raw), { shouldValidate: true })

      // Baslik zaten yazilmissa ezme - sadece bos oldugunda dosya adini oner.
      if (!getValues('title')) {
        setValue('title', file.name.replace(/\.md$/i, ''))
      }

      setActiveTab('preview')
    }
    reader.readAsText(file)
  }

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
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="projectId" className="w-full">
                      <SelectValue placeholder="Proje seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={String(project.id)}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {typeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="content" className="block text-sm font-medium text-foreground">
                İçerik (Markdown desteklenir)
              </label>

              <div className="flex items-center gap-1">
                <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className={`rounded-md px-2.5 py-1 ${
                      activeTab === 'write'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Yaz
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`rounded-md px-2.5 py-1 ${
                      activeTab === 'preview'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Önizleme
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title=".md dosyasından doldur"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  <Upload className="size-3.5" />
                  Dosyadan doldur
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                    e.target.value = '' // ayni dosyayi ust uste secebilsin diye
                  }}
                />
              </div>
            </div>

            {activeTab === 'write' ? (
              <div
                // .md dosyasi surukleyip birakma - Textarea'nin oldugu alanin tamami hedef.
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFile(file)
                }}
              >
                <Textarea
                  id="content"
                  rows={12}
                  className="max-h-64 overflow-y-auto"
                  {...register('content')}
                />
              </div>
            ) : (
              <div
                className="max-h-64 min-h-[13rem] overflow-y-auto rounded-xl bg-muted px-3.5 py-3 text-sm text-muted-foreground
                  [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-foreground
                  [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground
                  [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-foreground
                  [&_p]:my-2 [&_p]:leading-relaxed
                  [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5
                  [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
                  [&_li]:my-1
                  [&_strong]:font-semibold [&_strong]:text-foreground
                  [&_code]:rounded [&_code]:bg-card [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs
                  [&_a]:text-brand [&_a]:underline
                  [&_li:has(input[type='checkbox'])]:list-none [&_li:has(input[type='checkbox'])]:pl-0
                  [&_input[type='checkbox']]:mr-1.5"
              >
                {contentValue ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {contentValue}
                  </ReactMarkdown>
                ) : (
                  <p>Önizlenecek içerik yok.</p>
                )}
              </div>
            )}

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
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    title={`"${tag}" etiketini kaldır`}
                    aria-label={`"${tag}" etiketini kaldır`}
                  >
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
