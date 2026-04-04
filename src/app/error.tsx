'use client'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  console.error('Global Error:', error)

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
      <p className="text-gray-600">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Try Again
      </button>
    </div>
  )
}

