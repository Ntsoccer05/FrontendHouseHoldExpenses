import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Loading from "../components/common/Loading";
import { useAuthContext } from "../context/AuthContext";

// カスタムコンポーネントは大文字で始める必要がある
const OnlyPublicRoute = ({ children }: { children: ReactNode }) => {
    const { fetchLoginUserLoading, isAuthenticated } = useAuthContext();
    if (fetchLoginUserLoading) {
        return <Loading loadingTxt="ユーザ情報取得中" loadingColor="info" />;
    }
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default OnlyPublicRoute;
