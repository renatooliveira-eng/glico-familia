'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

function currentTime() {
  const now = new Date()
  return now.toTimeString().slice(0, 5)
}

export default function NewMeasurementPage() {
  const [value, setValue] = useState('')
  const [context, setContext] = useState('fasting')
  const [date, setDate] = useState(todayDate())
  const [time, setTime] = useState(currentTime())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const measured_at = new Date(`${date}T${time}`).toISOString()

    const { error } = await supabase.from('measurements').insert({
      profile_id: user.id,
      value: parseInt(value),
      context,
      measured_at,
    })

    if (error) {
      setError('Erro ao salvar medição. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/measurements')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/measurements" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Voltar
          </Link>
          <h2 className="text-xl font-semibold text-gray-800">Nova Medição</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Glicemia (mg/dL)
            </label>
            <input
              type="number"
              required
              min={1}
              max={999}
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-2xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="120"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Contexto</label>
            <select
              value={context}
              onChange={e => setContext(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fasting">Jejum</option>
              <option value="before_meal">Antes da refeição</option>
              <option value="after_meal">Após a refeição</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Hora</label>
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar Medição'}
          </button>
        </form>
      </div>
    </div>
  )
}
