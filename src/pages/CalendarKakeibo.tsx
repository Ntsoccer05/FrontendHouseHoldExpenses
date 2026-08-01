import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";
import StaticPageLayout from "../components/layout/StaticPageLayout";
import { ogIMG } from "../config/ogImg";

const sections = [
    {
        title: "カレンダー家計簿とは",
        body: "カレンダー家計簿とは、日々の収支をカレンダーのマス目に記録していく家計簿のスタイルです。表やリストで管理する一般的な家計簿と違い、「いつ・いくら使ったか」がカレンダー上にそのまま並ぶため、月全体の支出リズムを直感的に把握できるのが特徴です。",
    },
    {
        title: "表形式の家計簿との違い",
        body: "エクセルや紙の家計簿帳のような表形式は、費目ごとの集計は得意ですが、「今月はどのあたりで使いすぎたか」を振り返るのには不向きです。カレンダー家計簿なら、給料日前後や週末にお金を使いがちといった生活リズムとの関係が視覚的にわかりやすくなります。",
    },
    {
        title: "カレンダー家計簿が向いている人",
        body: "・家計簿が続かず挫折した経験がある人\n・数字の集計よりも感覚的に支出を把握したい人\n・毎日の生活リズムと支出の関係を見直したい人\n・複雑な機能よりもシンプルな操作を求める人",
    },
    {
        title: "カケポンでカレンダー家計簿を始める方法",
        body: "カケポンは、カレンダー家計簿の考え方をそのままアプリにした無料の家計簿サービスです。登録不要でカレンダーの操作感を試せるほか、無料登録すれば収支の記録・保存、固定費の自動登録、家族との収支共有まで利用できます。",
    },
];

const CalendarKakeibo = () => {
    return (
        <StaticPageLayout>
            <Helmet>
                <title>カレンダー家計簿とは？メリットと続けやすい理由を解説</title>
                <meta
                    name="description"
                    content="カレンダー家計簿とは何か、表形式の家計簿との違いやメリット、向いている人の特徴を解説。無料のカレンダー家計簿アプリ「カケポン」の始め方も紹介します。"
                />
                <meta property="og:title" content="カレンダー家計簿とは？メリットと続けやすい理由を解説" />
                <meta
                    property="og:description"
                    content="カレンダー家計簿の特徴とメリットを解説し、無料アプリ「カケポン」での始め方を紹介します。"
                />
                <meta property="og:url" content="https://kake-pon.com/calendar-kakeibo" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>

            <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
                <Typography variant="h4" component="h1" fontWeight="bold" textAlign="center" sx={{ mb: 6, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                    カレンダー家計簿とは？メリットと続けやすい理由
                </Typography>

                <Stack spacing={4}>
                    {sections.map((section) => (
                        <Box key={section.title} sx={{ p: 3, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ mb: 1.5 }}>
                                {section.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
                                {section.body}
                            </Typography>
                        </Box>
                    ))}
                </Stack>

                <Box textAlign="center" sx={{ mt: 6 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                        <Button component={RouterLink} to="/register" variant="contained" size="large">
                            無料でカレンダー家計簿を始める
                        </Button>
                        <Button component={RouterLink} to="/about" variant="outlined" size="large">
                            カケポンの特徴を見る
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </StaticPageLayout>
    );
};

export default CalendarKakeibo;
