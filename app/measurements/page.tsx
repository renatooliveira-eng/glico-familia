import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GlucoseChart from '@/components/charts/GlucoseChart'
import { getGlucoseStatus, statusStyles, statusLabels, contextLabels } from '@/lib/glucose'

export const dynamic = 'force-dynamic'

export default async function MeasurementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('fasting_min, fasting_max, postmeal_max')
    .eq('id', user.id)
    .single()

  const { data: measurements } = await supabase
    .from('measurements')
    .select('id, value, measured_at, context')
    .eq('profile_id', user.id)
    .order('measured_at', { ascending: false })

  const defaultProfile = { fasting_min: 70, fasting_max: 99, postmeal_max: 139 }
  const userProfile = profile ?? defaultProfile

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {measurements && measurements.length > 0 && (
          <GlucoseChart measurements={measurements} fastingMax={userProfile.fasting_max} />
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Histórico</h2>
          <Link
            href="/measurements/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nova
          </Link>
        </div>

        {!measurements || measurements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400">Nenhuma medição registrada ainda.</p>
            <Link href="/measurements/new" className="text-blue-600 text-sm mt-2 inline-block">
              Registrar primeira medição
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {measurements.map((m) => {
              const status = getGlucoseStatus(m.value, m.context, userProfile)
              return (
                <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {m.value} <span className="text-sm font-normal text-gray-400">mg/dL</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {contextLabels[m.context]} · {new Date(m.measured_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusStyles[status]}`}>
                    {statusLabels[status]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
