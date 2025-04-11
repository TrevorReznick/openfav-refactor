import { componentLib } from './componentLib'

// Register all dynamic components
componentLib
    .register('Navbar', {
        import: () => import('@/components/tsx/common/Navbar'),
        metadata: {
            description: 'Main navigation component',
            group: 'layout'
        }
    })
    .register('PostsComponent', {
        import: () => import('@/components/tsx/dynamic/PostsComponent'),
        metadata: {
            description: 'Posts management component',
            group: 'content'
        }
    })
    .register('TestComponent', {
        import: () => import('@/components/tsx/dynamic/TestComponent'),
        metadata: {
            description: 'Test component',
            group: 'development'
        }
    })
    .register('UsersComponent', {
        import: () => import('@/components/tsx/dynamic/UsersComponent'),
        metadata: {
            description: 'User management component',
            group: 'admin'
        }
  })

export default componentLib