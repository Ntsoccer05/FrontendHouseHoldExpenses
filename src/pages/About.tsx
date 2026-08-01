import { Box, Button, Container, Divider, Grid, Stack, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PaletteIcon from "@mui/icons-material/Palette";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import GroupsIcon from "@mui/icons-material/Groups";
import BarChartIcon from "@mui/icons-material/BarChart";
import { ogIMG } from "../config/ogImg";
import StaticPageLayout from "../components/layout/StaticPageLayout";

const features = [
    {
        icon: <CalendarMonthIcon fontSize="large" color="primary" />,
        title: "カレンダーで支出・収入がひと目でわかる",
        description:
            "1日ごとの収支がカレンダー上にそのまま表示されるので、「いつ・どれくらい使ったか」が直感的にわかります。使わなかった日もひと目で確認できます。",
    },
    {
        icon: <LockOpenIcon fontSize="large" color="primary" />,
        title: "登録不要ですぐ試せる",
        description:
            "アカウント登録なしでカレンダー画面の操作感をすぐに試せます。収支を記録・保存したくなったら、無料登録するだけで続けられます。",
    },
    {
        icon: <PaletteIcon fontSize="large" color="primary" />,
        title: "カテゴリを自由にカスタマイズ",
        description: "支出・収入のカテゴリは色やアイコンを自由に設定可能。自分だけの家計簿に育てられます。",
    },
    {
        icon: <EventRepeatIcon fontSize="large" color="primary" />,
        title: "固定費はほったらかしでOK",
        description: "家賃やサブスクなどの固定収支を一度登録しておけば、毎月自動でカレンダーに記録されます。",
    },
    {
        icon: <GroupsIcon fontSize="large" color="primary" />,
        title: "家族・パートナーと収支を共有",
        description: "グループで分担割合を設定して、家族やパートナーと家計をまとめて見える化できます。",
    },
    {
        icon: <BarChartIcon fontSize="large" color="primary" />,
        title: "グラフで分析",
        description: "月別・年別の推移や前月・前年との比較をグラフで確認でき、ムダ遣いの発見に役立ちます。",
    },
];

const faqs = [
    {
        q: "カケポンは本当に無料ですか？広告は表示されますか？",
        a: "はい、カケポンは登録・利用ともに完全無料です。広告も表示されないので、家計管理そのものに集中できます。",
    },
    {
        q: "アカウント登録なしで使えますか？",
        a: "カレンダー画面の閲覧・操作感のお試しは登録なしでも可能です。収支データを保存して継続的に使うには、無料のアカウント登録が必要です。",
    },
    {
        q: "カレンダー形式の家計簿にはどんなメリットがありますか？",
        a: "表やリストで管理する家計簿と違い、日々の生活リズムと支出の関係を視覚的に把握できます。使いすぎた日・使わなかった日が一目瞭然です。",
    },
    {
        q: "家族やパートナーと支出を共有できますか？",
        a: "はい、「収支を共有」機能でグループ内の分担割合を設定し、家族やパートナーと家計を見える化できます。",
    },
    {
        q: "毎月の固定費（家賃・サブスクなど）は自動で記録できますか？",
        a: "はい、固定収支を一度登録しておけば、毎月自動的にカレンダーへ反映されます。",
    },
    {
        q: "スマートフォンでも使えますか？",
        a: "はい、スマートフォン・タブレット・PCのブラウザからご利用いただけます。アプリのインストールは不要です。",
    },
    {
        q: "入力したデータはどのように管理されますか？",
        a: "入力いただいた収支データはご本人のみが閲覧でき、第三者に提供されることはありません。",
    },
    {
        q: "Zaimやマネーフォワードなど他の家計簿アプリとの違いは何ですか？",
        a: "カケポンは「カレンダーで見る」ことに特化したシンプルな家計簿アプリです。銀行口座等との自動連携機能は持たない分、動作が軽く直感的な操作で続けやすい設計になっています。多機能な家計簿アプリで挫折してしまった方にもおすすめです。",
    },
];

const About = () => {
    return (
        <StaticPageLayout>
            <Helmet>
                <title>カケポンとは？無料カレンダー家計簿の特徴・使い方・よくある質問</title>
                <meta
                    name="description"
                    content="カケポンは、カレンダー形式で収支を見える化できる完全無料の家計簿アプリ。登録不要ですぐ試せて、固定費の自動登録や家族との収支共有にも対応。特徴とよくある質問をまとめて紹介します。"
                />
                <meta property="og:title" content="カケポンとは？無料カレンダー家計簿の特徴・使い方・よくある質問" />
                <meta
                    property="og:description"
                    content="カレンダーで収支を見える化する無料家計簿アプリ「カケポン」の特徴・使い方・よくある質問をまとめて紹介します。"
                />
                <meta property="og:url" content="https://kake-pon.com/about" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>

            <Box>
                {/* ヒーロー */}
                <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 }, textAlign: "center" }}>
                    <Typography variant="h3" component="h1" fontWeight="bold" sx={{ fontSize: { xs: "1.8rem", sm: "2.5rem" }, mb: 2 }}>
                        カレンダーを見れば、家計がわかる。
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, mb: 4 }}>
                        登録不要で今すぐ使える、完全無料のカレンダー家計簿アプリ「カケポン」
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                        <Button component={RouterLink} to="/register" variant="contained" size="large">
                            今すぐ無料で始める
                        </Button>
                        <Button component={RouterLink} to="/" variant="outlined" size="large">
                            カレンダーを見てみる
                        </Button>
                    </Stack>
                </Container>

                {/* 特徴 */}
                <Container maxWidth="md" sx={{ pb: { xs: 6, sm: 10 } }}>
                    <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 6, fontSize: { xs: "1.4rem", sm: "1.8rem" } }}>
                        カケポンの特徴
                    </Typography>
                    <Grid container spacing={4}>
                        {features.map((f) => (
                            <Grid item xs={12} sm={6} key={f.title}>
                                <Stack spacing={1.5} sx={{ height: "100%", p: 3, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
                                    {f.icon}
                                    <Typography variant="h6" fontWeight="bold">
                                        {f.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {f.description}
                                    </Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                <Divider />

                {/* FAQ */}
                <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
                    <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 6, fontSize: { xs: "1.4rem", sm: "1.8rem" } }}>
                        よくある質問
                    </Typography>
                    <Stack spacing={3}>
                        {faqs.map((item) => (
                            <Box key={item.q} sx={{ p: 3, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                    Q. {item.q}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    A. {item.a}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Container>

                {/* 下部CTA */}
                <Container maxWidth="md" sx={{ pb: { xs: 8, sm: 12 }, textAlign: "center" }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
                        今日から、カレンダーでラクに家計管理を始めませんか？
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                        <Button component={RouterLink} to="/register" variant="contained" size="large">
                            無料で新規登録
                        </Button>
                        <Button component={RouterLink} to="/login" variant="outlined" size="large">
                            ログイン
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </StaticPageLayout>
    );
};

export default About;
