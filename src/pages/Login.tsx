import { Helmet } from "react-helmet-async";
import LoginForm from "../components/Auth/LoginForm";
import { ogIMG } from "../config/ogImg";

function Login() {
  return (
    <>
      <Helmet>
        <title>ログイン｜無料カレンダー家計簿アプリ「カケポン」</title>
        <meta
          name="description"
          content="無料の家計簿アプリ『カケポン』で簡単に節約＆家計管理。カレンダー形式で支出・収入を見える化し、初心者でも続けやすい設計。Googleログイン対応で今すぐ始められます。"
        />
        <meta property="og:title" content="ログイン｜無料家計簿アプリ「カケポン」" />
        <meta
          property="og:description"
          content="節約や家計管理に最適な無料家計簿アプリ『カケポン』。カレンダーで直感的に支出管理、Googleアカウントですぐログイン。初心者から続けやすく、毎月の無駄遣いをしっかり見直せます。"
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
