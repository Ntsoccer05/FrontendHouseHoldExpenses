import apiClient from '../utils/axios';
import type { FixedExpense, FixedExpenseFormData } from '../types';

export const fixedExpenseApi = {
    getAll: (userId: number) =>
        apiClient.get<{ status: number; fixedExpenses: FixedExpense[] }>(
            '/fixed-expenses',
            { params: { user_id: userId } }
        ),

    create: (userId: number, data: FixedExpenseFormData) =>
        apiClient.post('/fixed-expenses', { user_id: userId, ...data }),

    update: (
        userId: number,
        id: number,
        data: Partial<FixedExpenseFormData> & { is_active?: boolean }
    ) =>
        apiClient.put(`/fixed-expenses/${id}`, { user_id: userId, ...data }),

    remove: (userId: number, id: number) =>
        apiClient.delete(`/fixed-expenses/${id}`, { params: { user_id: userId } }),
};
