# Not Listesi — Ayrı Roadmap (Bölüm 8.7)

`dashboard-roadmap.md` ile aynı mantık: bu bir CRUD işi ama backend'i **zaten
tamamen hazır** (`NotesController`, `NoteService`, DTO'lar, validator'lar —
`TasksController` ile birebir aynı desen). Bu roadmap sadece **frontend**
tarafını kapsıyor.

## Backend'de zaten var olan (değişiklik gerekmiyor)

- `Note.cs`: `Id`, `ProjectId`, `Title`, `Content` (markdown metin), `Type`
  (enum), `Tags` (string dizisi), `CreatedAt`/`UpdatedAt`.
- `NoteType` enum: `Decision`, `Learning`, `Idea`, `Meeting`, `General`.
- `GET /api/projects/{projectId}/notes`, `GET /api/notes/{id}`,
  `POST /api/projects/{projectId}/notes`, `PUT /api/notes/{id}`,
  `DELETE /api/notes/{id}`.

## Tasarım Kararları

- **Yerleşim**: `ProjectDetailPage`'deki Kanban/Düz Liste segmented toggle'ına
  üçüncü seçenek olarak **"Notlar"** eklenecek (`yeni-tasarim-vizyonu.md`'de
  zaten dördüncü sekme olarak "AI Asistan" da planlanmıştı — bu ikisi ayrı).
- **Markdown önizleme**: `Content` alanı ham metin yerine `react-markdown` ile
  render edilecek (yeni npm paketi gerekiyor: `react-markdown`).
- **Filtreleme**: Tip (chip/dropdown: Karar/Öğrenme/Fikir/Toplantı/Genel) ve
  etiket (serbest metin) bazlı filtre — `ProjectFormModal`'daki teknoloji
  tag input'uyla aynı "Enter'la ekle" deseni kullanılacak.
- **Ekleme/düzenleme modalı**: `TaskFormModal`/`ProjectFormModal` ile aynı
  dual-mode desen (react-hook-form + zod, `note` prop'u doluysa düzenleme).
- **Kart tasarımı**: mevcut navy/pastel tasarım sistemine (bkz.
  `docs/design/yeni-tasarim-vizyonu.md`) uyacak — `bg-card`/`border-border`
  token'ları, `Type`'a göre renkli rozet.

## Adımlar

- [ ] **1. Veri katmanı**
  - [ ] `frontend/src/types/note.ts` (`NoteResponse`, `CreateNoteRequest`,
        `UpdateNoteRequest`)
  - [ ] `frontend/src/api/notes.ts` (`getNotesByProject`, `createNote`,
        `updateNote`, `deleteNote`)
- [ ] **2. `react-markdown` kurulumu** (`npm install react-markdown`)
- [ ] **3. `NoteFormModal.tsx`** — oluştur/düzenle tek form, Tip seçici,
      etiket input'u, markdown içerik alanı (Textarea)
- [ ] **4. `NoteCard.tsx`** — tip rozeti, başlık, markdown render edilmiş
      içerik önizlemesi (ilk birkaç satır), etiketler, tarih
- [ ] **5. `NoteListView.tsx`** — kart listesi + tip/etiket filtre çubuğu +
      "+ Not Ekle" butonu
- [ ] **6. `ProjectDetailPage.tsx`'e "Notlar" sekmesi eklenmesi** (mevcut
      Kanban/Düz Liste toggle'ına üçüncü seçenek)
- [ ] **7. Uçtan uca test**: not oluştur → listede gör → düzenle → sil →
      filtre çalışıyor mu
- [ ] **8. ROADMAP.md'de 8.7'yi işaretle + commit + push**

## Kararlar (çözüldü)

1. Not, göreve benzer şekilde projeye bağlı ama **Kanban/Düz Liste'den
   tamamen bağımsız bir veri** — `tasks` state'iyle karışmıyor, kendi
   `useQuery(['notes', projectId])` sorgusu olacak.
2. Markdown editör için ayrı bir "canlı önizleme" (split-view) şimdilik
   MVP kapsamında değil — sadece kaydedilmiş içerik render ediliyor, yazarken
   anlık önizleme sonraki bir iyileştirme.
3. Segmented toggle (Kanban/Düz Liste/Notlar) tasarımı: ayrı çerçeveli
   butonlar (aktif olan dolu lacivert, diğerleri beyaz/çerçeveli) — pill
   grubu değil.

## Açık karar (❓ sonra tekrar değerlendirilecek)

**Proje içi Notlar sekmesinde çok sayıda (10-20+) not olunca üstteki not
kartı şeridi ne olacak?** Mockup'ta 4 kartlık sabit bir şerit var, bu
ölçeklenmiyor:

- Yatay kaydırma denendi ama **reddedildi** — "20 tane olunca çok yığılmış
  olacak, farklı türde olacak" (Mustafa, 2026-09-10).
- Değerlendirilecek alternatifler: (a) sol dikey liste + sağ detay (e-posta
  uygulaması deseni), (b) tipe göre gruplu/katlanabilir bölümler
  ("Kararlar (3)", "Öğrenmeler (8)" gibi).
- Karar verilmeden önce gerçek veri hacmine (bir projede tipik kaç not
  birikir) bakmak faydalı olabilir.
