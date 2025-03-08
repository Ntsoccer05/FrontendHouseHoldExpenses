import { Box, Button, styled, Typography } from "@mui/material";
import { SocialIcon } from "../../common/SocialIcon";
import apiClient from "../../../utils/axios";

const SocialLoginBtn = () => {
    const SocialButton = styled(Button)(({ theme }) => ({
        width: "100%",
        padding: theme.spacing(1.5),
        display: "flex",
        gap: theme.spacing(1.5),
        justifyContent: "center",
        alignItems: "center",
        textTransform: "none",
        fontSize: "15px",
        fontWeight: 500,
        backgroundColor: "white",
        color: "rgba(0, 0, 0, 0.54)", // Googleのボタンの文字色
        border: "1px solid #DADCE0", // Googleのボタン枠線
        borderRadius: "4px", // 角丸を小さめに
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)", // 軽い影
        transition: "all 0.2s ease-in-out",
    
        "&:hover": {
            backgroundColor: "#F8F9FA", // Googleのホバー時背景
            borderColor: "#C6C6C6",
        },
    
        "&:active": {
            backgroundColor: "#E8E8E8", // クリック時の背景
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.2)",
        },
    }));
    const googleLogin = async () => {
        try {
            const response = await apiClient.get("/login/google");
            window.location.href = response.data.redirectUrl;
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <>
            <SocialButton
                onClick={googleLogin}
                startIcon={<SocialIcon.google />}
            >
                <span style={{ textTransform: "none" }} className="ml-4">
                    Googleログイン
                </span>
            </SocialButton>
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {/* 横線 */}
                <Box
                    sx={{
                        flex: 1, // 横線を伸ばす
                        borderTop: "1px solid black",
                        zIndex: 0, // 背景として設定
                    }}
                />
                {/* テキスト */}
                <Box
                    sx={{
                        position: "relative",
                        px: 2, // 横の余白を調整
                        zIndex: 1, // 横線より前面に表示
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: "gray", // テキストの色を調整
                        }}
                    >
                        Or
                    </Typography>
                </Box>
                {/* 横線（右側） */}
                <Box
                    sx={{
                        flex: 1, // 横線を伸ばす
                        borderTop: "1px solid black",
                        zIndex: 0, // 背景として設定
                    }}
                />
            </Box>
        </>
    );
};

export default SocialLoginBtn;
