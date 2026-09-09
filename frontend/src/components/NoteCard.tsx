import type { NoteResponse, NoteType } from '@/types/note'

// Her not turunun rozet rengi - TaskCard'daki priorityColors ile ayni
// desen/gerekce (Takip tasarim sistemindeki hex degerlerle birebir).
export const noteTypeColors: Record<NoteType, string> = {
  Decision: 'bg-[#DCE9FF] text-[#1E2A4A]',
  Learning: 'bg-[#E5F0FA] text-[#2C5A82]',
  Idea: 'bg-[#FBEEDD] text-[#A05A16]',
  Meeting: 'bg-[#ECE8F7] text-[#574A85]',
  General: 'bg-[#EEF1F5] text-[#52606D]',
}

export const noteTypeLabels: Record<NoteType, string> = {
  Decision: 'Karar',
  Learning: 'Öğrenme',
  Idea: 'Fikir',
  Meeting: 'Toplantı',
  General: 'Genel',
}

interface NoteCardProps {
  note: NoteResponse
  // Bu notun su an secili olup olmadigi - NoteListView'in ortak state'inden
  // geliyor, kart kendi "secili miyim" durumunu tutmuyor.
  isSelected: boolean
  onClick: (note: NoteResponse) => void
}

export function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(note)}
      className={`flex flex-col gap-1.5 rounded-xl border bg-card p-3 text-left shadow-sm ${
        isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${noteTypeColors[note.type]}`}
        >
          {noteTypeLabels[note.type]}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(note.createdAt).toLocaleDateString('tr-TR')}
        </span>
      </div>

      <h4 className="line-clamp-2 text-sm font-medium text-foreground">{note.title}</h4>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
