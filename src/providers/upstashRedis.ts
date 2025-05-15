
import { Redis } from '@upstash/redis'

// Initialize Redis client with environment variables
export const redis = new Redis({
    url: import.meta.env.PUBLIC_REDIS_API_URL || '',
    token: import.meta.env.PUBLIC_REDIS_API_TOKEN || '',
})