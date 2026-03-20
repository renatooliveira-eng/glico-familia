import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) console.error('[dashboard] auth error:', authError.message)
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const { data: lastMeasurement } = await supabase
    .from('measurements')
    .select('value, measured_at, context')
    .eq('profile_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Olá, {profile?.name ?? 'bem-vindo'}!
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Acompanhe sua glicemia abaixo.
          </p>
        </div>

        {lastMeasurement ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Última medição</p>
            <p className="text-4xl font-bold text-gray-800">
              {lastMeasurement.value} <span className="text-lg font-normal text-gray-400">mg/dL</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(lastMeasurement.measured_at).toLocaleString('pt-BR')}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
            <p className="text-gray-400 text-sm">Nenhuma medição registrada ainda.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/measurements/new"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            + Nova Medição
          </Link>
          <Link
            href="/measurements"
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl border border-gray-200 transition-colors"
          >
            Ver Histórico
          </Link>
        </div>
      </main>
    </div>
  )
}
