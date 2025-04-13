import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import useSocialLogin from "../../hooks/useSocialLogin";
import { Provider } from "../../types";
import queryString from "query-string";
import { useAuthContext } from "../../context/AuthContext";
import Loading from "../common/Loading";

const GoogleCallback = () => {
    const { provider } = useParams<{ provider: Provider }>();
    const socialResponse = useMemo(
        () => queryString.parse(location.search) ?? {},
        [location.search]
    );
    // const authCode = queryParams.code;
    const socialLogin = useSocialLogin();
    const { fetchLoginUserLoading } = useAuthContext();

    const handleLogin = async () => {
        await socialLogin(provider, socialResponse);
    };

    useEffect(() => {
        handleLogin();
    }, []);

    return  (fetchLoginUserLoading &&
        <Loading loadingTxt="ユーザ情報取得中" loadingColor="info" />
    )
};

export default GoogleCallback;
