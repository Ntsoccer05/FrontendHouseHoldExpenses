import { Helmet } from "react-helmet-async";
import LoginForm from "../components/Auth/LoginForm";
import { ogIMG } from "../config/ogImg";

function Login() {
  return (
    <>
      <Helmet>
        <title>らくらく・シンプル家計簿カケポンに簡単ログイン｜カレンダーで収支をラクに記録</title>
        <meta name="description" content="カケポンは完全無料のカレンダー家計簿アプリ。簡単ログインですぐ使える！支出・収入をサクッと記録して節約習慣をスタートしよう。"/>
        <meta property="og:title" content="無料のらくらく・シンプル家計簿アプリ『カケポン』に簡単ログイン" />
        <meta
          property="og:description"
          content="カケポンは誰でも簡単に使える無料家計簿アプリ。カレンダー形式で収支をラクに記録・分析。ログインして今すぐ節約をはじめよう！"
        />
        <meta property="og:url" content="https://kake-pon.com/login" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogIMG} />
      </Helmet>
      <LoginForm />
    </>
  );
}

export default Login;
