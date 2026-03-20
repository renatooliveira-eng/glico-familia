'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Algo deu errado</h2>
        <p className="text-sm text-red-500 mb-1">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">Código: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
