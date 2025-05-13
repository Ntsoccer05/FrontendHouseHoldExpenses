import { Helmet } from "react-helmet-async";
import LoginForm from "../components/Auth/LoginForm";
import { ogIMG } from "../config/ogImg";

function Login() {
    return (
        <>
            <Helmet>
                <title>ログイン｜カレンダーで家計簿管理「カケポン」</title>
                <meta
                    name="description"
                    content="カケポンにログインして、家計管理をもっとカンタン・便利に。Googleログイン対応で、すぐに始められます。"
                />
                <meta property="og:title" content="ログイン｜家計簿アプリ「カケポン」" />
                <meta
                    property="og:description"
                    content="すでにアカウントをお持ちの方はこちらからログイン。カレンダーでかんたん家計簿「カケポン」、Googleログイン対応。"
                />
                <meta property="og:url" content="https://kake-pon.com/login" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>
            <LoginForm></LoginForm>
        </>
    );
}

export default Login;
