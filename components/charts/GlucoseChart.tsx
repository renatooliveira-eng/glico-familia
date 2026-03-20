'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

type Measurement = {
  id: string
  value: number
  measured_at: string
  context: string
}

type Props = {
  measurements: Measurement[]
  fastingMax: number
}

const PERIODS = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
]

export default function GlucoseChart({ measurements, fastingMax }: Props) {
  const [period, setPeriod] = useState(30)

  const data = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - period)
    return measurements
      .filter(m => new Date(m.measured_at) >= cutoff)
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map(m => ({
        value: m.value,
        date: new Date(m.measured_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      }))
  }, [measurements, period])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Evolução</h3>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setPeriod(p.days)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                period === p.days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">
          Nenhuma medição neste período.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip
              formatter={(value) => [`${value} mg/dL`, 'Glicemia']}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <ReferenceLine
              y={70}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: '70', fontSize: 10, fill: '#ef4444', position: 'right' }}
            />
            <ReferenceLine
              y={fastingMax}
              stroke="#22c55e"
              strokeDasharray="4 4"
              label={{ value: String(fastingMax), fontSize: 10, fill: '#22c55e', position: 'right' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
