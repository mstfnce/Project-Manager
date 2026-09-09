import { zodResolver } from '@hookform/resolvers/zod'
import { ListTodo } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { createTask, updateTask } from '@/api/tasks'
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
import type { TaskPriorityLevel, TaskResponse, TaskStatus } from '@/types/task'

// Formda secilebilecek oncelik ve durum degerleri - backend'deki enum
// degerleriyle birebir ayni yazilmali (buyuk/kucuk harf dahil), yoksa
// backend "gecersiz deger" diye 400 doner.
const priorityOptions: TaskPriorityLevel[] = ['Low', 'Medium', 'High', 'Critical']
const statusOptions: TaskStatus[] = ['Todo', 'InProgress', 'Blocked', 'Done']

// zod bir "dogrulama semasi" kutuphanesi - formdan gelen veriyi burada
// tanimladigimiz kurallara gore kontrol eder. Kullanici "Kaydet"e basinca,
// once bu kurallar calisir; gecmezse hata mesaji gosterilir, backend'e
// istek bile gitmez.
const taskFormSchema = z.object({
  title: z.string().min(1, 'Başlık boş olamaz'),
  description: z.string().optional(),
  priority: z.enum(priorityOptions),
  dueDate: z.string().optional(),
  // Sadece duzenleme modunda kullanilir - yeni gorev backend'de her zaman
  // Todo ile basliyor, olusturma formunda bu alan hic gorunmuyor.
  status: z.enum(statusOptions).optional(),
})

// z.infer, yukaridaki semadan otomatik olarak bir TypeScript tipi cikarir.
// Yani semayi degistirirsek bu tip de kendiliginden guncellenir, iki yerde
// ayni sekli elle yazmak zorunda kalmayiz.
type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Doluysa "duzenle" modu (formu bu gorevin verisiyle onceden doldurur),
  // bos/undefined ise "olustur" modu - ProjectFormModal'daki "project"
  // prop'uyla birebir ayni mantik.
  task?: TaskResponse | null
  // Yeni gorev hangi projeye eklenecek - duzenlemede kullanilmiyor (gorev
  // zaten bir projeye bagli), sadece olusturma isteginde gerekiyor.
  projectId: number
}

export function TaskFormModal({ open, onOpenChange, task, projectId }: TaskFormModalProps) {
  // task doluysa duzenleme modundayiz, degilse olusturma modu.
  const isEditMode = !!task

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'Medium',
      // dueDate backend'den "2026-09-20T00:00:00Z" gibi tam bir tarih-saat
      // geliyor ama HTML'in <input type="date"> alani sadece "2026-09-20"
      // formatini kabul ediyor - o yuzden ilk 10 karakteri (slice(0, 10))
      // aliyoruz. Gorev yeni olusturuluyorsa (task yok) bos birakiyoruz.
      dueDate: task?.dueDate?.slice(0, 10) ?? '',
      status: task?.status,
    },
  })

  // React Query'nin "onbellek yoneticisi" - bir kayit basariyla eklenince/
  // guncellenince, ekrandaki gorev listesinin bayat kalmamasi icin bunu
  // kullanip "bu veriyi tekrar sunucudan cek" diyecegiz.
  const queryClient = useQueryClient()

  const mutation = useMutation({
    // mutationFn: "Kaydet"e basilinca gercekten calisacak fonksiyon.
    // task varsa (duzenleme modu) updateTask, yoksa (olusturma modu)
    // createTask cagriliyor - ayni ProjectFormModal'daki mantik.
    mutationFn: (values: TaskFormValues) =>
      task
        ? updateTask(task.id, {
            title: values.title,
            description: values.description || null,
            priority: values.priority,
            // Kullanici tarihi bosalttiysa (values.dueDate === '') backend'e
            // null gonderiyoruz, yoksa string'i oldugu gibi yolluyoruz.
            dueDate: values.dueDate || null,
            // status formda yoksa (teoride olmaz, ama TypeScript emin
            // olamadigi icin) gorevin eski durumunu koruyoruz.
            status: values.status ?? task.status,
          })
        : createTask(projectId, {
            title: values.title,
            description: values.description || null,
            priority: values.priority,
            dueDate: values.dueDate || null,
          }),

    // Istek basarili olunca calisir.
    onSuccess: () => {
      // 'tasks' ile baslayan (ve bu projectId'ye ait) sorguyu "bayat" olarak
      // isaretliyoruz - React Query arka planda otomatik yeniden cekiyor,
      // boylece board'daki liste hemen guncel hale geliyor.
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      handleClose()
    },
  })

  // Hem "Iptal" butonunda hem basarili kayittan sonra cagrilir - formu
  // eski haline sifirlar ve modali kapatir. Tek yerde durmasi onemli:
  // birden fazla yerde tekrarlansaydi, biri degisince digeri unutulabilirdi.
  function handleClose() {
    reset()
    onOpenChange(false)
  }

  // Form gecerli (zod kurallarina uygun) sekilde gonderildiginde
  // react-hook-form bu fonksiyonu cagirir, bize temiz/dogrulanmis
  // degerleri (values) verir.
  function onSubmit(values: TaskFormValues) {
    mutation.mutate(values)
  }

  return (
    // Dialog'un onOpenChange'i ozellestirilmis: kullanici modali kapatmaya
    // calisirsa (ESC'ye basma, disari tiklama) dogrudan onOpenChange(false)
    // yerine bizim handleClose'umuz cagrilir - boylece her kapanis yolu
    // ayni temizlik mantigindan gecer.
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900">
              <ListTodo className="size-4 text-white" />
            </div>
            <DialogTitle>{isEditMode ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}</DialogTitle>
          </div>
          <DialogDescription>
            {isEditMode
              ? 'Görev bilgilerini güncelleyin.'
              : 'Bu projeye yeni bir görev ekleyin.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Başlık
            </label>
            {/* register('title'), bu input'u react-hook-form'a "kayit ettirir" -
                form artik bu kutunun degerini takip eder, biz elle
                onChange/useState yazmak zorunda kalmayiz. */}
            <Input id="title" {...register('title')} />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="priority"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Öncelik
              </label>
              <select
                id="priority"
                {...register('priority')}
                className="w-full rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="mb-1.5 block text-sm font-medium text-slate-700">
                Son Tarih
              </label>
              <Input id="dueDate" type="date" {...register('dueDate')} />
            </div>
          </div>

          {/* Durum secici sadece duzenleme modunda gorunur - ProjectFormModal'daki
              status alaniyla ayni sebep: yeni gorev backend'de her zaman Todo
              ile basliyor, olustururken sormaya gerek yok. */}
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
                  : 'Görev Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
