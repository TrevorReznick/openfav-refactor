import { componentLib } from './componentLib'

// Register all dynamic components
componentLib
    .register('Auth', {
        import: () => import('@/components/tsx/auth/Auth.tsx'),
        metadata: {
            description: 'Auth Form Component',
            group: 'auth'
        }
    })
    .register('HeroGrid', {
        import: () => import('@/components/tsx/home/HeroGrid.tsx'),
        metadata: {
            description: 'Main heero grid component',
            group: 'home'
        }
    })
    .register('HeaderHero', {
        import: () => import('@/components/tsx/home/HeaderHero.tsx'),
        metadata: {
            description: 'Main heero grid component',
            group: 'home'
        }
    })

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