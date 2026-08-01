import apiClient from "../utils/axios";
import type { ContactScheme } from "../validations/Contact";

export const contactApi = {
    send: (data: ContactScheme) =>
        apiClient.post<{ status_code: number; message: string }>("/contact", data),
};
