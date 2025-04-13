import { Navigate } from "react-router-dom";
import Loading from "../components/common/Loading";
import { useAuthContext } from "../context/AuthContext";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { fetchLoginUserLoading, isAuthenticated } = useAuthContext();
  
  if (fetchLoginUserLoading) return <Loading loadingTxt="ユーザ情報取得中" loadingColor="info"/>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};