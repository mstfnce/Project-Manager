import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FolderOpen, Plus, Search, StickyNote } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { getAllNotes } from '@/api/notes'
import { getProjects } from '@/api/projects'
import { noteTypeColors, noteTypeLabels } from '@/components/NoteCard'
import { NoteFormModal } from '@/components/NoteFormModal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { NoteType, NoteWithProjectResponse } from '@/types/note'

const typeFilters: { value: NoteType | 'All'; label: string }[] = [
  { value: 'All', label: 'Tümü' },
  { value: 'Decision', label: 'Karar' },
  { value: 'Learning', label: 'Öğrenme' },
  { value: 'Idea', label: 'Fikir' },
  { value: 'Meeting', label: 'Toplantı' },
  { value: 'General', label: 'Genel' },
]

interface NoteActionDialogProps {
  note: NoteWithProjectResponse | null
  onOpenChange: (open: boolean) => void
  onOpenHere: () => void
  onGoToProject: () => void
}

// Bir not satirina tiklaninca cikan secim kutusu: notu burada mi okuyacagiz,
// yoksa projesine mi gidecegiz?
function NoteActionDialog({
  note,
  onOpenChange,
  onOpenHere,
  onGoToProject,
}: NoteActionDialogProps) {
  return (
    <Dialog open={note !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{note?.title}</DialogTitle>
          <DialogDescription>
            Bu notu burada mı okumak istersin, yoksa ait olduğu projeye mi gidelim?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onGoToProject}>
            Projeye git
          </Button>
          <Button type="button" onClick={onOpenHere}>
            Burada aç
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface NoteContentDialogProps {
  note: NoteWithProjectResponse | null
  onOpenChange: (open: boolean) => void
}

// "Burada aç" secilince notun tam icerigini gosteren modal - NoteListView'deki
// detay panelinin ayni markdown render ayarlariyla (remark-gfm + remark-breaks).
function NoteContentDialog({ note, onOpenChange }: NoteContentDialogProps) {
  return (
    <Dialog open={note !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            {note && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${noteTypeColors[note.type]}`}
              >
                {noteTypeLabels[note.type]}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{note?.projectName}</span>
          </div>
          <DialogTitle>{note?.title}</DialogTitle>
        </DialogHeader>

        <div
          className="text-sm text-muted-foreground
            [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-foreground
            [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground
            [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-foreground
            [&_p]:my-2 [&_p]:leading-relaxed
            [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5
            [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
            [&_li]:my-1
            [&_strong]:font-semibold [&_strong]:text-foreground
            [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs
            [&_a]:text-brand [&_a]:underline
            [&_li:has(input[type='checkbox'])]:list-none [&_li:has(input[type='checkbox'])]:pl-0
            [&_input[type='checkbox']]:mr-1.5"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {note?.content ?? ''}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function NotesPage() {
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['notes', 'all'],
    queryFn: getAllNotes,
  })
  const notes = data?.data ?? []

  // Proje filtresi icin proje listesi - sidebar zaten ayni sorguyu kullaniyor,
  // React Query ayni anahtarda ikinci bir istek atmiyor (cache'ten geliyor).
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })
  const projects = projectsData?.data ?? []

  const [typeFilter, setTypeFilter] = useState<NoteType | 'All'>('All')
  const [projectFilter, setProjectFilter] = useState<number | 'All'>('All')

  // Tiklanan not once "ne yapalim" kutusunu aciyor, "Burada aç" secilirse
  // icerik modaline gecirilyor.
  const [actionNote, setActionNote] = useState<NoteWithProjectResponse | null>(null)
  const [contentNote, setContentNote] = useState<NoteWithProjectResponse | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filteredNotes = notes.filter((note) => {
    const typeMatches = typeFilter === 'All' || note.type === typeFilter
    const projectMatches = projectFilter === 'All' || note.projectId === projectFilter
    return typeMatches && projectMatches
  })

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Yükleniyor...</div>
  }

  if (error) {
    return <div className="p-8 text-destructive">Notlar yüklenemedi.</div>
  }

  return (
    <div className="p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.04em] text-brand">
            Bilgi Bankası
          </div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-heading">Notlar</h1>
          <p className="mt-1 max-w-[52ch] text-[13.5px] text-muted-foreground">
            Tüm projelerindeki kararlar, öğrenmeler ve fikirler tek listede — en yeni üstte.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-[12.5px] font-bold text-muted-foreground shadow-sm">
            <StickyNote className="size-[15px] text-brand" />
            <span className="text-sm text-heading">{notes.length}</span>
            Not
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="size-[15px]" />
            Yeni Not
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3.5 rounded-2xl border border-border bg-card p-3 shadow-sm">
        {/* Simdilik sadece gorsel - ileride baslik/icerik aramasini aktif edecegiz. */}
        <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-[12.5px] text-faint">
          <Search className="size-3.5 shrink-0" />
          Notlarda ara...
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-[12.5px] font-bold text-muted-foreground">
          <FolderOpen className="size-3.5 shrink-0" />
          <select
            value={projectFilter}
            onChange={(e) =>
              setProjectFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))
            }
            className="bg-transparent outline-none"
          >
            <option value="All">Tüm projeler</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-1">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setTypeFilter(filter.value)}
              className={`flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                typeFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-bold ${
                  typeFilter === filter.value ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}
              >
                {filter.value === 'All'
                  ? notes.length
                  : notes.filter((n) => n.type === filter.value).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-muted-foreground">
          {notes.length === 0 ? 'Henüz not yok.' : 'Bu filtreye uyan not yok.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setActionNote(note)}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-brand">
                  <FolderOpen className="size-3" />
                  {note.projectName}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${noteTypeColors[note.type]}`}
                >
                  {noteTypeLabels[note.type]}
                </span>
                <span className="ml-auto text-[11.5px] text-faint">
                  {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>

              <div className="text-[15px] font-bold text-heading">{note.title}</div>

              {/* Onizlemede markdown render etmiyoruz - 2 satira kirpilmis HTML
                  bozuk gorunurdu, ham metnin ilk satirlari yeterli. */}
              <p className="line-clamp-2 max-w-[88ch] text-[13px] leading-relaxed text-muted-foreground">
                {note.content}
              </p>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-muted px-2 py-0.5 text-[10.8px] font-semibold text-brand"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <NoteActionDialog
        note={actionNote}
        onOpenChange={(open) => !open && setActionNote(null)}
        onOpenHere={() => {
          setContentNote(actionNote)
          setActionNote(null)
        }}
        onGoToProject={() => {
          if (actionNote) {
            navigate(`/projects/${actionNote.projectId}?tab=notes&note=${actionNote.id}`)
          }
          setActionNote(null)
        }}
      />

      <NoteContentDialog
        note={contentNote}
        onOpenChange={(open) => !open && setContentNote(null)}
      />

      {/* projectId verilmiyor - global sayfada hangi projeye eklenecegini
          kullanicinin secmesi gerekiyor, NoteFormModal bunu bir sonraki
          adimda proje secici ile halledecek. */}
      <NoteFormModal open={isFormOpen} onOpenChange={setIsFormOpen} note={null} />
    </div>
  )
}
