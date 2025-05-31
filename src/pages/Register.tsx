import { Helmet } from "react-helmet-async";
import RegisterForm from "../components/Auth/RegisterForm";
import { ogIMG } from "../config/ogImg";

function Register() {
    return (
        <>
            <Helmet>
                <title>家計簿アプリを今すぐ無料登録｜カレンダー管理が人気の「カケポン」</title>
                <meta name="description" content="初心者も簡単！Googleログインで今すぐ無料登録。カレンダー式で支出・収入を見える化できる家計簿アプリ「カケポン」。主婦・学生・節約中の方に大好評！" />
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
