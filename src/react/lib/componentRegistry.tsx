import { componentLib } from '@/react/lib/componentLib'

componentLib
    .register('posts', {
        import: () => import('~/react/components/examples/PostsComponent'),
        metadata: {
            description: 'Auth Form Component',
            group: 'examples'
        }
    })
    .register('users', {
        import: () => import('~/react/components/examples/UsersComponent'),
        metadata: {
            description: 'Users List Component',
            group: 'examples'
        }
    })
    .register('test-nanostore', {
        import: () => import('~/react/components/examples/TestComponent'),
        metadata: {
            description: 'Test Counter Component',
            group: 'examples'
        }
    })

export default componentLib