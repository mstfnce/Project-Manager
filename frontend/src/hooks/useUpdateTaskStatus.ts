import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTaskStatus } from '@/api/tasks'
import type { TaskResponse, TaskStatus } from '@/types/task'

// Kanban ve Duz Liste'nin ikisi de gorev durumunu (Done/Todo vb.) degistirirken
// ayni optimistic-update mantigina ihtiyac duyuyor - burada tek yerde tutup
// ikisinin de kullanmasini sagliyoruz.
export function useUpdateTaskStatus(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      updateTaskStatus(id, { status }),

    // Istek gitmeden ONCE calisir - once ekrani guncelliyoruz (optimistic update).
    onMutate: async ({ id, status }) => {
      const queryKey = ['tasks', projectId]

      // Bu anahtarla devam eden bir fetch varsa iptal et - yoksa o fetch
      // bizim optimistic guncellememizin ustune eski veriyi yazabilir.
      await queryClient.cancelQueries({ queryKey })

      // Hata olursa geri donebilmek icin mevcut veriyi yedekle.
      const previousTasks = queryClient.getQueryData(queryKey)

      // Cache'i hemen yeni status ile guncelle - kullanici degisikligi
      // aninda gorur, API cevabini beklemez.
      queryClient.setQueryData(
        queryKey,
        (old: { data: TaskResponse[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map((task) => (task.id === id ? { ...task, status } : task)),
          }
        },
      )

      return { previousTasks }
    },

    // Istek basarisiz olursa, onMutate'de yedeklenen veriye geri don.
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks)
      }
    },

    // Basarili da olsa basarisiz da olsa, sunucudaki gercek veriyle senkron
    // olmak icin sorguyu tekrar calistir.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })
}
