import { render, act } from '@testing-library/react'
import { NavigationProvider, useNavigation } from '@/hooks/NavigationContext'
import { currentPath, previousPath } from '@/store'
import { toast } from 'sonner'
import { UserHelper } from '@/scripts/getAuth'


jest.mock('@/store', () => ({
    currentPath: { set: jest.fn(), get: jest.fn(() => '/') },
    previousPath: { set: jest.fn(), get: jest.fn() },
}))

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
        dismiss: jest.fn(),
    },
}))

jest.mock('@/scripts/getAuth', () => ({
    UserHelper: {
        getInstance: jest.fn(() => ({
            getCompleteSession: jest.fn(),
            isTokenExpired: jest.fn(),
        })),
    },
}))

const TestComponent = () => {
    const { navigate, goBack, currentPath, checkAuth } = useNavigation()
    return (
        <div>
            <button onClick={() => navigate('/test')}>Navigate</button>
            <button onClick={goBack}>Go Back</button>
            <button onClick={checkAuth}>Check Auth</button>
            <span data-testid="current-path">{currentPath}</span>
        </div>
    )
}

describe('NavigationContext', () => {
    let authHelperMock: any

    beforeEach(() => {
        authHelperMock = UserHelper.getInstance()
        jest.clearAllMocks()
    })

    it('should sync currentPath with window location on mount', () => {
        render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        expect(currentPath.set).toHaveBeenCalledWith(window.location.pathname)
    })

    it('should navigate to a new path', async () => {
        authHelperMock.getCompleteSession.mockResolvedValue({ isAuthenticated: true })
        authHelperMock.isTokenExpired.mockReturnValue(false)

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Navigate').click()
        })

        expect(currentPath.set).toHaveBeenCalledWith('/test')
        expect(previousPath.set).toHaveBeenCalledWith('/')
        expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/test')
        expect(toast.success).toHaveBeenCalledWith('Navigated to /test')
    })

    it('should block navigation if user is not authenticated', async () => {
        authHelperMock.getCompleteSession.mockResolvedValue({ isAuthenticated: false })

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Navigate').click()
        })

        expect(toast.error).toHaveBeenCalledWith('Please login to access this page')
        expect(currentPath.set).toHaveBeenCalledWith('/login')
    })

    it('should go back to the previous path', async () => {
        (previousPath.get as jest.Mock).mockReturnValue('/previous')

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Go Back').click()
        })

        expect(currentPath.set).toHaveBeenCalledWith('/previous')
        expect(window.history.back).toHaveBeenCalled()
        expect(toast.info).toHaveBeenCalledWith('Returned to previous page')
    })

    it('should warn if there is no previous path on goBack', async () => {
        previousPath.get.mockReturnValue(null)

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Go Back').click()
        })

        expect(toast.warning).toHaveBeenCalledWith('No navigation history available')
        expect(currentPath.set).toHaveBeenCalledWith('/')
    })

    it('should check authentication status', async () => {
        authHelperMock.getCompleteSession.mockResolvedValue({ isAuthenticated: true })
        authHelperMock.isTokenExpired.mockReturnValue(false)

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Check Auth').click()
        })

        expect(authHelperMock.getCompleteSession).toHaveBeenCalled()
        expect(authHelperMock.isTokenExpired).toHaveBeenCalled()
    })
})