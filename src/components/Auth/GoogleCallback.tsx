import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSocialLogin from "../../hooks/useSocialLogin";
import { Provider } from "../../types";
import { useAppContext } from "../../context/AppContext";
import queryString from "query-string";
import Loading from "../common/Loading";

const GoogleCallback = () => {
    const navigate = useNavigate();
    const { provider } = useParams<{ provider: Provider }>();
    const socialResponse = useMemo(
        () => queryString.parse(location.search) ?? {},
        [location.search]
    );
    // const authCode = queryParams.code;
    const socialLogin = useSocialLogin();
    const { setLoginFlg, getLoginUser } = useAppContext();

    const handleLogin = async () => {
        try {
            await socialLogin(provider, socialResponse);
            await getLoginUser();
            setLoginFlg(1);
            navigate("/");
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        handleLogin();
    }, [navigate]);

    return (
        <Loading
            loadingTxt="ログインしています..."
            loadingColor="info"
        ></Loading>
    );
};

export default GoogleCallback;
