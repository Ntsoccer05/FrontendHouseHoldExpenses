import apiClient from '../utils/axios';
import type {
    SplitGroup,
    SplitGroupCategoryOverride,
    SplitGroupFormData,
    SplitPreview,
} from '../types';

export const splitGroupApi = {
    getAll: () =>
        apiClient.get<{ status: number; splitGroups: SplitGroup[] }>('/split-groups'),

    create: (data: SplitGroupFormData) =>
        apiClient.post<{ status: number; splitGroup: SplitGroup }>('/split-groups', data),

    update: (id: number, data: Partial<SplitGroupFormData> & { is_active?: boolean }) =>
        apiClient.put<{ status: number; splitGroup: SplitGroup }>(`/split-groups/${id}`, data),

    remove: (id: number) =>
        apiClient.delete(`/split-groups/${id}`),

    updateSettings: (
        id: number,
        data: { income_other_ratio: number | null; expense_other_ratio: number | null }
    ) =>
        apiClient.put<{ status: number; splitGroup: SplitGroup }>(
            `/split-groups/${id}/settings`,
            data
        ),

    getCategoryOverrides: (id: number) =>
        apiClient.get<{ status: number; categoryOverrides: SplitGroupCategoryOverride[] }>(
            `/split-groups/${id}/category-overrides`
        ),

    updateCategoryOverrides: (id: number, overrides: SplitGroupCategoryOverride[]) =>
        apiClient.put<{ status: number; categoryOverrides: SplitGroupCategoryOverride[] }>(
            `/split-groups/${id}/category-overrides`,
            { overrides }
        ),

    getPreview: (id: number, month: string) =>
        apiClient.get<{ status: number } & SplitPreview>(
            `/split-groups/${id}/preview?month=${month}`
        ),
};
