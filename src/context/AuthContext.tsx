import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../utils/axios";
import { LoginUser } from "../types";
import { useCookie } from 'react-use'
import { holdingCookieTime } from "../config/cookieExpiration";
import { useNavigate } from "react-router-dom";
import { deleteAllSessionStorage } from "../utils/manageSessionStorage";

interface AuthContextType {
  loginUser: LoginUser | null;
  isAuthenticated: boolean;
  fetchLoginUserLoading: boolean;
  setFetchLoginUserLoading: React.Dispatch<React.SetStateAction<boolean>>
  login: (credentials: { email: string; password: string }) => Promise<unknown>;
  logout: () => void;
  fetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);
  const [fetchLoginUserLoading, setFetchLoginUserLoading] = useState<boolean>(false);
  const [cookieValue, updateCookie, deleteCookie] = useCookie('loginUser');
  const navigate = useNavigate();

  const fetchUser = async () => {
    try{
      const expireAt = new Date(Date.now() + holdingCookieTime * 60 * 1000);
      setFetchLoginUserLoading((prevValue) => prevValue = true);
      const res = await apiClient.get("/user");
      updateCookie(res.data, {
        expires: expireAt,
        path: '/', // '/' にしておくと全体で使える
      });
      setLoginUser(res.data);
    }catch(error) {
      setLoginUser(null);
      deleteCookie();
      deleteAllSessionStorage();
      navigate("/login");
    } finally {
      setFetchLoginUserLoading((prevValue) => prevValue = false);
    }
  };

  useEffect(() => {
    if (cookieValue) {
      const loginData = typeof cookieValue === 'string' ? JSON.parse(cookieValue) : cookieValue;
      const {id, name, email} = loginData;
      setLoginUser({ id, name, email });
    }
  }, [cookieValue]);

  const login = async (credentials: { email: string; password: string }) => {
    try{
      await apiClient.get("/sanctum/csrf-cookie");
      await apiClient.post("/login", credentials);
      await fetchUser();
    } catch (error) {
      return error;
    }
  };

  const logout = async () => {
    setLoginUser(null);
    deleteCookie();
    deleteAllSessionStorage();
    try{
      await apiClient.post("/logout");
      navigate("/login");
    } catch (error) {
      return error;
    }
  };



  return (
    <AuthContext.Provider value={{ loginUser, isAuthenticated: !!loginUser || !!cookieValue, fetchLoginUserLoading, setFetchLoginUserLoading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
// コンテキストを使用するためのカスタムフック
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
      throw new Error(
          "useAuthContextはAppProvider内で使用する必要があります。"
      );
  }
  return context;
};
