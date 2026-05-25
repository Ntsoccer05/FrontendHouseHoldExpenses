import axios from "axios";

// Axios インスタンスを作成
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api", // ベースURLの設定
  withCredentials: true, // Sanctum 認証用
  withXSRFToken: true, // CSRF 保護
  headers: {
    "X-Requested-With": "XMLHttpRequest", // 通常のリクエストを区別するため
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/forget-password', '/reset-password'];
      const isPublicPath = publicPaths.some(p => currentPath.startsWith(p));

      if (!isPublicPath) {
        // cookieとsessionStorageを削除してログインページへ
        document.cookie = 'loginUser=; Max-Age=0; path=/';
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;