export type GlucoseStatus = 'normal' | 'attention' | 'critical'

export function getGlucoseStatus(
  value: number,
  context: 'fasting' | 'before_meal' | 'after_meal',
  profile: { fasting_min: number; fasting_max: number; postmeal_max: number }
): GlucoseStatus {
  if (value < 70) return 'critical'

  if (context === 'after_meal') {
    if (value <= profile.postmeal_max) return 'normal'
    if (value <= 199) return 'attention'
    return 'critical'
  }

  // jejum e antes da refeição usam as mesmas faixas
  if (value >= profile.fasting_min && value <= profile.fasting_max) return 'normal'
  if (value <= 125) return 'attention'
  return 'critical'
}

export const statusStyles: Record<GlucoseStatus, string> = {
  normal: 'bg-green-50 text-green-700 border-green-200',
  attention: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
}

export const statusLabels: Record<GlucoseStatus, string> = {
  normal: 'Normal',
  attention: 'Atenção',
  critical: 'Crítico',
}

export const contextLabels: Record<string, string> = {
  fasting: 'Jejum',
  before_meal: 'Antes da refeição',
  after_meal: 'Após a refeição',
}
