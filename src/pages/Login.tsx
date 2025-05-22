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
          content="【無料】カレンダーで簡単に収支管理！初心者・主婦・学生にもやさしい家計簿アプリ『カケポン』。Googleログインですぐに家計の見える化を始めましょう。"
        />
        <meta property="og:title" content="簡単ログイン｜無料カレンダー家計簿アプリ「カケポン」" />
        <meta
          property="og:description"
          content="節約・貯金の第一歩に。カレンダー形式で直感的に支出管理ができる無料家計簿アプリ『カケポン』。Googleアカウントで簡単ログイン、今すぐ使えます。"
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
