import { componentLib } from '~/react/old/lib/componentLib'

componentLib
    .register('login', {
        import: () => import('~/react/components/auth/Auth'),
        metadata: {
            description: 'Auth Form Component',
            group: 'auth'
        }
    })
    /*
    .register('api-test', {
        import: () => import('~/react/components/examples/ApiTestComponent'),
        metadata: {
            description: 'API Test Console',
            group: 'debug'
        }
    })
    */
    .register('api-test-V0', {
        import: () => import('~/react/components/examples/ApiTestComponentV0'),
        metadata: {
            description: 'API Test Console',
            group: 'debug'
        }
    })
    .register('debug-api', {
        import: () => import('~/react/components/debug/ApiTest'),
        metadata: {
            description: 'API Test Console',
            group: 'debug'
        }
    })

    .register('debug-auth', {
        import: () => import('~/react/components/debug/DebugAuth'),
        metadata: {
            description: 'Auth Form Component',
            group: 'auth'
        }
    })
    
    .register('debug-session', {
        import: () => import('~/react/components/debug/DebugSession'),
        metadata: {
            description: 'Session Debug Component',
            group: 'debug'
        }
    })
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