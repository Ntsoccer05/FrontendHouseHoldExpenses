import apiClient from '../utils/axios';
import type { FixedExpense, FixedExpenseFormData } from '../types';

export const fixedExpenseApi = {
    getAll: () =>
        apiClient.get<{ status: number; fixedExpenses: FixedExpense[] }>('/fixed-expenses'),

    create: (data: FixedExpenseFormData) =>
        apiClient.post('/fixed-expenses', data),

    update: (
        id: number,
        data: Partial<FixedExpenseFormData> & { is_active?: boolean }
    ) =>
        apiClient.put(`/fixed-expenses/${id}`, data),

    remove: (id: number) =>
        apiClient.delete(`/fixed-expenses/${id}`),
};
