/*
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { userStore } from '@/store';

// Mock dello store

*/
import { listenToAuthChanges } from '@/store/authStore'
import { userStore } from '@/store'
import { UserHelper } from '~/scripts/old/getAuth'; // Importa la classe UserHelper
import { vi } from 'vitest'

vi.mock('@/store', () => ({
    userStore: {
        get: vi.fn(),
        set: (val: any) => { userStoreValue = val },
    },
}));

let userStoreValue: any = undefined

vi.mock('@/store', () => ({
    userStore: {
        get: vi.fn(() => userStoreValue),
        set: (val: any) => { userStoreValue = val },
    },
}))

vi.mock('@/providers/supabaseAuth', () => ({
    supabase: {
        auth: {
            // Il mock chiama subito il callback simulando un evento di SIGNED_IN
            onAuthStateChange: vi.fn((callback) => {
                callback('SIGNED_IN', { user: { id: '456', email: 'new@example.com' } })
                return { data: { subscription: { unsubscribe: vi.fn() } } }
            }),
            getSession: vi.fn(),
        },
    },
}))



// Mock delle chiamate HTTP
global.fetch = vi.fn();

describe('UserHelper', () => {
    let userHelper;

    beforeEach(() => {
        userHelper = UserHelper.getInstance();
        vi.clearAllMocks();
    });

    describe('getUserInfo', () => {
        it('should return user info if user is authenticated', () => {
            // Arrange
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                created_at: '2023-01-01T00:00:00Z',
                last_sign_in_at: '2023-10-01T00:00:00Z',
                user_metadata: { full_name: 'John Doe', avatar_url: 'avatar.jpg' },
                app_metadata: { provider: 'google' },
            };
            (userStore.get as jest.Mock).mockReturnValue(mockUser);

            // Act
            const userInfo = userHelper.getUserInfo();

            // Assert
            expect(userInfo).toEqual({
                id: '123',
                email: 'test@example.com',
                fullName: 'John Doe',
                createdAt: new Date('2023-01-01T00:00:00Z'),
                lastLogin: new Date('2023-10-01T00:00:00Z'),
                isAuthenticated: true,
                metadata: {
                    provider: 'google',
                    avatarUrl: 'avatar.jpg',
                },
            });
        });
    });
});