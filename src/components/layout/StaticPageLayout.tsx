import { Box, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ReactNode } from "react";

interface StaticPageLayoutProps {
    children: ReactNode;
}

const footerLinks = [
    { to: "/about", label: "カケポンとは" },
    { to: "/guide", label: "使い方ガイド" },
    { to: "/calendar-kakeibo", label: "カレンダー家計簿とは" },
    { to: "/contact", label: "お問い合わせ" },
    { to: "/privacy", label: "プライバシーポリシー" },
    { to: "/company", label: "運営者情報" },
];

const StaticPageLayout = ({ children }: StaticPageLayoutProps) => {
    const headerIMG = import.meta.env.VITE_APP_HEADER_IMG_URL || "/src/assets/logo/カケポン.png";

    return (
        <>
            <Box component="header" sx={{ borderBottom: "1px solid", borderColor: "grey.200", bgcolor: "#fff" }}>
                <Container maxWidth="md" sx={{ py: 2, display: "flex", alignItems: "center" }}>
                    <RouterLink to="/" style={{ display: "inline-flex" }}>
                        <Box component="img" src={headerIMG} alt="カケポン" sx={{ height: 48, objectFit: "contain" }} />
                    </RouterLink>
                </Container>
            </Box>

            <Box component="main" sx={{ bgcolor: "grey.50", minHeight: "60vh" }}>
                {children}
            </Box>

            <Box component="footer" sx={{ bgcolor: "grey.100", py: 3, textAlign: "center" }}>
                <Container maxWidth="md">
                    <Stack
                        direction="row"
                        spacing={3}
                        justifyContent="center"
                        sx={{ mb: 1.5, flexWrap: "wrap", rowGap: 1 }}
                    >
                        {footerLinks.map((link) => (
                            <Typography
                                key={link.to}
                                component={RouterLink}
                                to={link.to}
                                variant="body2"
                                color="text.secondary"
                                sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                            >
                                {link.label}
                            </Typography>
                        ))}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} カケポン
                    </Typography>
                </Container>
            </Box>
        </>
    );
};

export default StaticPageLayout;
