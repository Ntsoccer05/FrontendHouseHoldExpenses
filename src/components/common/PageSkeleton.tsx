import { Box, Container, Skeleton, Stack } from "@mui/material";

// /about, /guide, /contact 等の静的ページ用Suspenseフォールバック。
// StaticPageLayoutのヘッダー高さに合わせることで、読み込み完了時のレイアウトシフトを抑える。
const PageSkeleton = () => {
    return (
        <>
            <Box sx={{ borderBottom: "1px solid", borderColor: "grey.200", bgcolor: "#fff" }}>
                <Container maxWidth="md" sx={{ py: 2 }}>
                    <Skeleton variant="rounded" width={140} height={48} />
                </Container>
            </Box>
            <Box sx={{ bgcolor: "grey.50", minHeight: "60vh" }}>
                <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
                    <Stack spacing={2} alignItems="center" sx={{ mb: 6 }}>
                        <Skeleton variant="text" width="60%" height={48} />
                        <Skeleton variant="text" width="40%" height={28} />
                    </Stack>
                    <Stack spacing={3}>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} variant="rounded" height={100} />
                        ))}
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default PageSkeleton;
