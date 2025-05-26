/**
 * TIPI PRINCIPALI PER LE OPERAZIONI DI BASE
 */

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status?: number;
}