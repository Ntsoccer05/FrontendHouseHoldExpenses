import axios from "axios";

// Axios インスタンスを作成
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api", // ベースURLの設定
  withCredentials: true, // Sanctum 認証用
  headers: {
    "X-Requested-With": "XMLHttpRequest", // 通常のリクエストを区別するため
  },
});

export default apiClient;