import { ReactNode } from "react";
import { useAppContext } from "../context/AppContext";
import { Navigate } from "react-router-dom";
import Loading from "../components/common/Loading";

// カスタムコンポーネントは大文字で始める必要がある
const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const { loginFlg } = useAppContext();
    if (loginFlg === 0) {
        return (
            <Loading
                loadingTxt="ユーザ情報取得中"
                loadingColor="info"
            ></Loading>
        );
    }
    return loginFlg === 2 ? <Navigate to="/login" /> : children;
};

export default PrivateRoute;
