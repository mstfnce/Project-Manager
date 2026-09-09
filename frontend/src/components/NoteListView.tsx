import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { deleteNote, getNotesByProject } from '@/api/notes'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { NoteCard, noteTypeColors, noteTypeLabels } from '@/components/NoteCard'
import { NoteFormModal } from '@/components/NoteFormModal'
import type { NoteResponse, NoteType } from '@/types/note'

const typeFilters: { value: NoteType | 'All'; label: string }[] = [
  { value: 'All', label: 'Tümü' },
  { value: 'Decision', label: 'Karar' },
  { value: 'Learning', label: 'Öğrenme' },
  { value: 'Idea', label: 'Fikir' },
  { value: 'Meeting', label: 'Toplantı' },
  { value: 'General', label: 'Genel' },
]

interface NoteListViewProps {
  projectId: number
  // Global Notlar sayfasindan "Projeye git" ile gelindiyse, hangi notun
  // secili olarak acilacagi (adresteki ?note=12 parametresinden).
  initialNoteId?: number | null
}

// Kanban/Duz Liste'nin aksine notlar 'tasks' cache'iyle hic karismiyor
// (bkz. docs/planlar/not-listesi-roadmap.md karar 1) - kendi useQuery'sini
// burada, kendi icinde tutuyor, sadece bu sekme acikken fetch ediliyor.
export function NoteListView({ projectId, initialNoteId }: NoteListViewProps) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['notes', projectId],
    queryFn: () => getNotesByProject(projectId),
  })
  const notes = data?.data ?? []

  const [typeFilter, setTypeFilter] = useState<NoteType | 'All'>('All')
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(
    initialNoteId ?? null,
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteResponse | null>(null)
  // Silme onayi bekleyen not - doluysa ConfirmDialog acik demek.
  const [deletingNote, setDeletingNote] = useState<NoteResponse | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', projectId] }),
  })

  const filteredNotes =
    typeFilter === 'All' ? notes : notes.filter((note) => note.type === typeFilter)

  // Secili not, filtrelenmis listenin disina dustuyse (filtre degistiyse)
  // ilk filtrelenmis nota dusuyoruz - ekranda gorunmeyen bir notu "secili"
  // gostermeyelim diye.
  const selectedNote =
    filteredNotes.find((note) => note.id === selectedNoteId) ?? filteredNotes[0] ?? null

  function handleAddClick() {
    setEditingNote(null)
    setIsModalOpen(true)
  }

  function handleEditClick(note: NoteResponse) {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  // Cop kutusu sadece onay kutusunu aciyor, silme islemi kullanici
  // onaylayinca ConfirmDialog'un onConfirm'unde yapiliyor.
  function handleDeleteClick(note: NoteResponse) {
    setDeletingNote(note)
  }

  function handleDeleteConfirm() {
    if (!deletingNote) return

    deleteMutation.mutate(deletingNote.id)
    if (selectedNoteId === deletingNote.id) setSelectedNoteId(null)
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Notlar yükleniyor...</p>
  }

  if (error) {
    return <p className="text-destructive">Notlar yüklenemedi.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {typeFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setTypeFilter(filter.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              typeFilter === filter.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}

        <button
          type="button"
          onClick={handleAddClick}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="size-3.5" />
          Yeni Not
        </button>
      </div>

      {filteredNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bu kategoride not yok.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={selectedNote?.id === note.id}
              onClick={(clickedNote) => setSelectedNoteId(clickedNote.id)}
            />
          ))}
        </div>
      )}

      {selectedNote && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <span
                className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${noteTypeColors[selectedNote.type]}`}
              >
                {noteTypeLabels[selectedNote.type]}
              </span>
              <h2 className="text-lg font-semibold text-foreground">{selectedNote.title}</h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => handleEditClick(selectedNote)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClick(selectedNote)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          {/* @tailwindcss/typography kurulu degil - markdown elemanlarini
              tek tek arbitrary variant selector'larla stilliyoruz. */}
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
              [&_a]:text-accent [&_a]:underline
              [&_del]:text-muted-foreground/70
              [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs
              [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_th]:text-left
              [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1
              [&_li:has(input[type='checkbox'])]:my-1 [&_li:has(input[type='checkbox'])]:list-none [&_li:has(input[type='checkbox'])]:pl-0
              [&_input[type='checkbox']]:mr-1.5 [&_input[type='checkbox']]:accent-primary"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {selectedNote.content}
            </ReactMarkdown>
          </div>

          {selectedNote.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
              {selectedNote.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <NoteFormModal
        key={editingNote?.id ?? 'create'}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        note={editingNote}
        projectId={projectId}
      />

      <ConfirmDialog
        open={deletingNote !== null}
        onOpenChange={(open) => !open && setDeletingNote(null)}
        title="Notu sil"
        description={`"${deletingNote?.title}" notu kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
