import { Helmet } from "react-helmet-async";
import LoginForm from "../components/Auth/LoginForm";
import { ogIMG } from "../config/ogImg";

function Login() {
  return (
    <>
      <Helmet>
        <title>無料カレンダー家計簿アプリで簡単ログイン｜カケポン</title>
        <meta
          name="description"
          content="無料で使える家計簿アプリ『カケポン』はGoogleログインですぐに開始。カレンダー形式で支出・収入を簡単に管理、初心者・主婦・学生にも人気！"
        />
        <meta property="og:title" content="簡単ログイン｜無料カレンダー家計簿アプリ「カケポン」" />
        <meta
          property="og:description"
          content="節約を始めたい方に最適。『カケポン』ならGoogleアカウントで簡単にログイン、収支をカレンダーで管理。完全無料で家計を見える化できます。"
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
