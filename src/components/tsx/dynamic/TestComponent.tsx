import { useStore } from '@nanostores/react'
import { counterStore } from '@/store'

function TestComponent() {
  const count = useStore(counterStore)

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
      <h2 className="text-xl font-bold mb-4">Test Component React</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Contatore: {count}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => counterStore.set(count + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Incrementa
        </button>
        <button
          onClick={() => counterStore.set(0)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default TestComponent
