import { Box, Container, Stack, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";
import StaticPageLayout from "../components/layout/StaticPageLayout";

const items = [
    { label: "サービス名", value: "カケポン（らくらく・シンプル家計簿カケポン）" },
    { label: "URL", value: "https://kake-pon.com" },
    { label: "運営形態", value: "個人開発" },
    { label: "サービス内容", value: "カレンダー形式で収支を管理できる無料の家計簿Webアプリケーションの提供" },
];

const Company = () => {
    return (
        <StaticPageLayout>
            <Helmet>
                <title>運営者情報｜らくらく・シンプル家計簿カケポン</title>
                <meta name="robots" content="noindex, follow" />
                <meta
                    name="description"
                    content="家計簿アプリ「カケポン」の運営者情報についてご案内します。"
                />
            </Helmet>

            <Container maxWidth="sm" sx={{ py: { xs: 6, sm: 10 } }}>
                <Typography variant="h4" component="h1" fontWeight="bold" textAlign="center" sx={{ mb: 6, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                    運営者情報
                </Typography>

                <Box sx={{ p: { xs: 3, sm: 4 }, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
                    <Stack spacing={3}>
                        {items.map((item) => (
                            <Box key={item.label}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {item.label}
                                </Typography>
                                <Typography variant="body1">{item.value}</Typography>
                            </Box>
                        ))}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                お問い合わせ
                            </Typography>
                            <Typography variant="body1">
                                ご質問・ご要望は
                                <RouterLink to="/contact" style={{ marginLeft: 4, marginRight: 4 }}>
                                    お問い合わせフォーム
                                </RouterLink>
                                よりご連絡ください。
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </Container>
        </StaticPageLayout>
    );
};

export default Company;
