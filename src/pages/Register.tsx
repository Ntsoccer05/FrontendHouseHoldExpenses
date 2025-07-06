import { Helmet } from "react-helmet-async";
import RegisterForm from "../components/Auth/RegisterForm";
import { ogIMG } from "../config/ogImg";

function Register() {
    return (
        <>
            <Helmet>
                <title>らくらく・シンプル家計簿カケポン 新規登録｜カレンダーで家計を見える化</title>
                <meta name="description" content="完全無料で登録して使えるカレンダー式家計簿アプリ「カケポン」。支出・収入の記録をカレンダーでかんたん管理。主婦・社会人・カップル・学生・一人暮らしの節約におすすめ。" />
                <meta property="og:title" content="無料家計簿アプリ「カケポン」新規登録" />
                <meta property="og:description" content="登録してすぐ始められるカレンダー式家計簿アプリ『カケポン』。支出・収入を見える化して、毎日の家計管理をもっとラクに。" />
                <meta property="og:url" content="https://kake-pon.com/register" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>
            <RegisterForm></RegisterForm>
        </>
    );
}

export default Register;
