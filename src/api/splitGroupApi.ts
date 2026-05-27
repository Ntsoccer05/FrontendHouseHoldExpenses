import apiClient from '../utils/axios';
import type {
    SplitGroup,
    SplitGroupCategoryOverride,
    SplitGroupFormData,
    SplitPreview,
} from '../types';

interface SplitGroupSettings {
    income_other_ratio: number | null;
    income_other_offset: number | null;
    expense_other_ratio: number | null;
    expense_other_offset: number | null;
    overrides?: SplitGroupCategoryOverride[];
}

export const splitGroupApi = {
    getAll: () =>
        apiClient.get<{ status: number; splitGroups: SplitGroup[] }>('/split-groups'),

    create: (data: SplitGroupFormData) =>
        apiClient.post<{ status: number; splitGroup: SplitGroup }>('/split-groups', data),

    update: (id: number, data: Partial<SplitGroupFormData>) =>
        apiClient.put<{ status: number; splitGroup: SplitGroup }>(`/split-groups/${id}`, data),

    remove: (id: number) =>
        apiClient.delete(`/split-groups/${id}`),

    updateSettings: (id: number, data: SplitGroupSettings) =>
        apiClient.put<{ status: number; splitGroup: SplitGroup }>(
            `/split-groups/${id}/settings`,
            data
        ),

    getPreview: (id: number, month: string) =>
        apiClient.get<{ status: number } & SplitPreview>(
            `/split-groups/${id}/preview?month=${month}`
        ),

    getMonthlySummary: (month: string) =>
        apiClient.get<{ status: number; income: number; expense: number; balance: number }>(
            `/monthly-summary?month=${month}`
        ),
};
