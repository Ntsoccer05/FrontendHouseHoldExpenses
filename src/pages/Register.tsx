import { Helmet } from "react-helmet-async";
import RegisterForm from "../components/Auth/RegisterForm";
import { ogIMG } from "../config/ogImg";

function Register() {
    return (
        <>
            <Helmet>
                <title>無料で始めるカレンダー家計簿アプリ｜主婦・学生も簡単登録｜カケポン</title>
                <meta
                name="description"
                content="面倒な家計簿は卒業！『カケポン』はカレンダー形式で日々の支出・収入を楽しく記録できる無料家計簿アプリ。Googleログイン対応で、主婦・学生・一人暮らしの節約にも最適。"
                />
                <meta property="og:title" content="家計簿アプリを無料で始める｜簡単登録「カケポン」" />
                <meta
                property="og:description"
                content="収支管理をカレンダーで見える化！初心者・主婦・学生にもおすすめの無料家計簿アプリ『カケポン』。Googleアカウントでかんたん登録、今日から節約生活スタート。"
                />
                <meta property="og:url" content="https://kake-pon.com/register" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>
            <RegisterForm></RegisterForm>
        </>
    );
}

export default Register;
