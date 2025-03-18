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
    <Suspense
      fallback={<div className="p-4 text-center">Loading component...</div>}
    >
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
