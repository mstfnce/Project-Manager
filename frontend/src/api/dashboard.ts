import { apiClient } from './client'
import type { DashboardSummaryResponse } from '@/types/dashboard'

// GET /api/dashboard/summary - proje sayilari, aktif gorev sayisi ve
// yaklasan deadline'lari tek istekte getirir.
export function getDashboardSummary() {
  return apiClient.get<DashboardSummaryResponse>('/dashboard/summary')
}
