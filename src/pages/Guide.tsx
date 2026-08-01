import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";
import StaticPageLayout from "../components/layout/StaticPageLayout";
import { ogIMG } from "../config/ogImg";

const steps = [
    {
        title: "1. アカウントを登録する",
        body: "トップページ右上（またはメニュー）の「アカウント登録」から、メールアドレスとパスワードを入力するだけで登録できます。GoogleアカウントやGitHubアカウントでのログインにも対応しています。",
    },
    {
        title: "2. カレンダーで収支を記録する",
        body: "記録したい日付をタップし、「追加」ボタンから支出・収入を選んで金額とカテゴリを入力するだけです。入力した内容はその日のマスにすぐ反映され、月の収支もリアルタイムで更新されます。",
    },
    {
        title: "3. カテゴリを自分好みにカスタマイズする",
        body: "サイドメニューの「カテゴリ編集」から、支出・収入のカテゴリを自由に追加・編集できます。色やアイコンも選べるので、カレンダーがひと目で見やすくなります。",
    },
    {
        title: "4. 固定費を登録してほったらかしにする",
        body: "「固定収支管理」から家賃やサブスクリプションなどの固定費を一度登録しておけば、毎月1日に自動でカレンダーへ記録されます。毎月の入力の手間を減らせます。",
    },
    {
        title: "5. レポートで収支を分析する",
        body: "「レポート」画面では、月別・年別の収支をグラフで確認できます。前月・前年との比較もでき、ムダ遣いの傾向をつかみやすくなります。",
    },
    {
        title: "6. 家族・パートナーと収支を共有する",
        body: "「収支分担管理」からグループを作成し、分担割合を設定すれば、家族やパートナーと家計を分担して管理できます。",
    },
];

const Guide = () => {
    return (
        <StaticPageLayout>
            <Helmet>
                <title>カケポンの使い方ガイド｜登録から記録・分析まで解説</title>
                <meta
                    name="description"
                    content="無料家計簿アプリ「カケポン」の使い方を解説。アカウント登録、カレンダーでの収支記録、カテゴリ編集、固定費の自動登録、収支分析、家族との共有まで、基本操作をまとめて紹介します。"
                />
                <meta property="og:title" content="カケポンの使い方ガイド｜登録から記録・分析まで解説" />
                <meta
                    property="og:description"
                    content="無料家計簿アプリ「カケポン」の基本操作をまとめて紹介します。"
                />
                <meta property="og:url" content="https://kake-pon.com/guide" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>

            <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
                <Typography variant="h4" component="h1" fontWeight="bold" textAlign="center" sx={{ mb: 2, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                    カケポンの使い方ガイド
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
                    登録不要でカレンダーの操作感を試せて、無料登録すればすぐに家計簿として使い始められます。
                </Typography>

                <Stack spacing={4}>
                    {steps.map((step) => (
                        <Box key={step.title} sx={{ p: 3, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                {step.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                {step.body}
                            </Typography>
                        </Box>
                    ))}
                </Stack>

                <Box textAlign="center" sx={{ mt: 6 }}>
                    <Button component={RouterLink} to="/register" variant="contained" size="large">
                        今すぐ無料で始める
                    </Button>
                </Box>
            </Container>
        </StaticPageLayout>
    );
};

export default Guide;
