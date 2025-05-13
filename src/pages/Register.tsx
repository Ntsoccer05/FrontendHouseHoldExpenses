import { Helmet } from "react-helmet-async";
import RegisterForm from "../components/Auth/RegisterForm";
import { ogIMG } from "../config/ogImg";

function Register() {
    return (
        <>
            <Helmet>
                <title>無料で始める家計簿アプリ｜カケポン</title>
                <meta
                    name="description"
                    content="家計管理をもっとカンタンに。カレンダー形式で日々の支出・収入を楽しく記録できる「カケポン」。Googleログインですぐに使えます。"
                />
                <meta property="og:title" content="無料で始める家計簿アプリ｜カケポン" />
                <meta
                    property="og:description"
                    content="面倒な家計簿はもう卒業。カレンダーで直感的に収支管理ができる家計簿アプリ「カケポン」。Googleアカウントでかんたん登録！"
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
