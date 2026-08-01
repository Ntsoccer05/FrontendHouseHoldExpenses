import { Box, Grid, Skeleton, Stack } from "@mui/material";

// AppLayoutのOutlet（Home/Report/Category等）用Suspenseフォールバック。
// ヘッダー・サイドバーは既に表示された状態を維持し、メインコンテンツ領域だけを
// カレンダーページに近い概形（サマリーカード3枚+大きな矩形）のスケルトンにすることで、
// 読み込み完了時のレイアウトシフトを抑える。
const AppContentSkeleton = () => {
    return (
        <Box sx={{ display: "flex" }}>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Grid item xs={4} key={index}>
                            <Skeleton variant="rounded" height={64} />
                        </Grid>
                    ))}
                </Grid>
                <Stack spacing={1}>
                    <Skeleton variant="text" width={160} height={32} />
                    <Skeleton variant="rounded" height={500} />
                </Stack>
            </Box>
        </Box>
    );
};

export default AppContentSkeleton;
