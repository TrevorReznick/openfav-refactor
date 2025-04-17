import { lazy, Suspense } from 'react'
import componentLib from '@/api/tsx/componentRegistry'

const AppClient = ({ componentName }: { componentName: string }) => {
  const DynamicComponent = lazy(() => componentLib.get(componentName).import())

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {DynamicComponent && <DynamicComponent />}
    </Suspense>
  )
}

export default AppClient