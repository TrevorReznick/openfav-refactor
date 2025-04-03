import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'

const UsersComponent = lazy(
  () => import('@/components/tsx/dynamic/UsersComponent')
)
const PostsComponent = lazy(
  () => import('@/components/tsx/dynamic/PostsComponent')
)
const TestComponent = lazy(
  () => import('@/components/tsx/dynamic/TestComponent')
)
const MainIndex = lazy(() => import('@/components/tsx/base/MainIndex'))

const queryClient = new QueryClient()

interface WrapperComponentProps {
  componentType: string
  useQueryString?: boolean
}

const componentMap = {
  users: UsersComponent,
  posts: PostsComponent,
  test: TestComponent,
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center space-y-4">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      <p className="text-foreground">Loading component...</p>
    </div>
  </div>
)

export default function WrapperComponent({
  componentType,
  useQueryString,
}: WrapperComponentProps) {
  const DynamicComponent =
    componentMap[componentType as keyof typeof componentMap] || PostsComponent
  console.log(
    'Loading component:',
    componentType,
    'with useQueryString:',
    useQueryString
  )

  return (
    <Suspense fallback={<LoadingFallback />}>
      {useQueryString ? (
        <QueryClientProvider client={queryClient}>
          <DynamicComponent />
        </QueryClientProvider>
      ) : (
        <DynamicComponent />
      )}
    </Suspense>
  )
}
