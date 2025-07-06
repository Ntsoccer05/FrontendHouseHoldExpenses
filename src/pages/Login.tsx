import { Helmet } from "react-helmet-async";
import LoginForm from "../components/Auth/LoginForm";
import { ogIMG } from "../config/ogImg";

function Login() {
  return (
    <>
      <Helmet>
        <title>らくらく・シンプルに使える家計簿アプリに簡単ログイン｜Googleで無料ではじめる「カケポン」</title>
        <meta name="description" content="【完全無料】簡単ログイン！カレンダー形式で支出・収入を簡単に記録・分析できる家計簿アプリ「カケポン」。主婦・社会人・カップル・学生・一人暮らしの節約に人気！" />
        <meta property="og:title" content="簡単ログイン｜完全無料カレンダー家計簿アプリ「カケポン」" />
        <meta
          property="og:description"
          content="節約を始めたい方に最適。『カケポン』なら簡単にログイン、収支をカレンダーで管理。完全無料で家計を見える化できます。"
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
