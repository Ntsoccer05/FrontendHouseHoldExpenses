import { Box, Container, Stack, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";
import StaticPageLayout from "../components/layout/StaticPageLayout";

const sections = [
    {
        title: "1. 収集する情報",
        body: [
            "カケポン（以下「当サービス」）は、以下の情報を取得します。",
            "・アカウント登録情報：お名前、メールアドレス、パスワード（暗号化して保存）",
            "・外部サービス連携（Google／GitHub）でログインした場合、当該サービスから提供される氏名・メールアドレス等のプロフィール情報",
            "・当サービスの利用にあたって入力される収支データ（金額、カテゴリ、日付、メモ等）",
            "・お問い合わせフォームから送信される、お名前・メールアドレス・お問い合わせ内容",
            "・Cookieを通じて取得するログイン状態の情報、アクセス解析ツールによる利用状況データ",
        ],
    },
    {
        title: "2. 利用目的",
        body: [
            "取得した情報は、以下の目的の範囲内で利用します。",
            "・当サービスの提供・維持・改善のため",
            "・ユーザー認証、ログイン状態の維持のため",
            "・お問い合わせへの対応のため",
            "・サービス利用状況の分析、機能改善の検討のため",
            "・不正利用の防止のため",
        ],
    },
    {
        title: "3. アクセス解析ツールについて",
        body: [
            "当サービスは、サービス改善のためGoogle Analyticsを利用しています。Google Analyticsはトラフィックデータの収集のためにCookieを使用しますが、このデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することが可能です。詳しくはGoogleのポリシーをご確認ください。",
        ],
    },
    {
        title: "4. 第三者提供について",
        body: [
            "当サービスは、法令に基づく場合を除き、ご本人の同意なく取得した情報を第三者に提供することはありません。",
        ],
    },
    {
        title: "5. 安全管理措置",
        body: [
            "取得した情報は、不正アクセス・紛失・改ざん・漏えい等を防止するため、適切なセキュリティ対策を講じたうえで管理します。",
        ],
    },
    {
        title: "6. 情報の開示・訂正・削除",
        body: [
            "ご本人からのアカウント情報の開示・訂正・削除のご希望については、お問い合わせフォームよりご連絡ください。ご本人確認のうえ、合理的な範囲で対応します。",
        ],
    },
    {
        title: "7. プライバシーポリシーの改定",
        body: [
            "当サービスは、必要に応じて本ポリシーの内容を予告なく変更することがあります。変更後の内容は、本ページに掲載した時点から効力を生じるものとします。",
        ],
    },
];

const Privacy = () => {
    return (
        <StaticPageLayout>
            <Helmet>
                <title>プライバシーポリシー｜らくらく・シンプル家計簿カケポン</title>
                <meta name="robots" content="noindex, follow" />
                <meta
                    name="description"
                    content="家計簿アプリ「カケポン」のプライバシーポリシー。収集する情報・利用目的・第三者提供の有無についてご案内します。"
                />
            </Helmet>

            <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
                <Typography variant="h4" component="h1" fontWeight="bold" textAlign="center" sx={{ mb: 6, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                    プライバシーポリシー
                </Typography>

                <Stack spacing={4}>
                    {sections.map((section) => (
                        <Box key={section.title}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
                                {section.title}
                            </Typography>
                            <Stack spacing={1}>
                                {section.body.map((line, index) => (
                                    <Typography key={index} variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                        {line}
                                    </Typography>
                                ))}
                            </Stack>
                        </Box>
                    ))}

                    <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
                            8. お問い合わせ窓口
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            本ポリシーに関するお問い合わせは
                            <RouterLink to="/contact" style={{ marginLeft: 4, marginRight: 4 }}>
                                お問い合わせフォーム
                            </RouterLink>
                            よりご連絡ください。
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        </StaticPageLayout>
    );
};

export default Privacy;
