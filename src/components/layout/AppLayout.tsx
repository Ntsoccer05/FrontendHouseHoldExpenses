import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import SideBar from "../common/SideBar";
import { useAppContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import { Alert, AlertTitle } from "@mui/material";
import SnackBar from "../common/SnackBar";
import AppContentSkeleton from "../common/AppContentSkeleton";

const drawerWidth = 240;

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isAlert, setIsAlert] = React.useState(false);
    const { setIsLoading, snackBarState, setSnackBarState } = useAppContext();
    const { loginUser, isAuthenticated } = useAuthContext();
    const navigate = useNavigate();
    const headerIMG = import.meta.env.VITE_APP_HEADER_IMG_URL || "/src/assets/logo/カケポン.png"
    const location = useLocation();

    // サイドバーの開閉をトグル
    const handleDrawerToggle = React.useCallback(() => {
        setMobileOpen((prev) => !prev);
    }, []);

    React.useEffect(() => {
        if (loginUser) {
            setIsLoading(false);
        }
    }, [loginUser, setIsLoading]);

    React.useEffect(()=>{
        if (!isAuthenticated) {
            setIsAlert(true);
        } else {
            setIsAlert(false); // ログイン済ならアラートを非表示にする（お好みで）
        }
    }, [isAuthenticated])

    // ホームへのナビゲーション
    const toHome = React.useCallback(() => {
        // handleDrawerToggle();
        navigate("/");
    }, [navigate]);

    const topImgLogoStyle = React.useMemo(
        () => ({
            width: "260px",
            height: "64px",
            objectFit: "contain",
            marginRight: "10px",
        }),
        []
    );

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    bgcolor: (theme) => theme.palette.grey[100],
                    // 100vh は iOS の "large viewport"（URL バー非表示時）基準。
                    // URL バー表示中の可視 viewport は 100svh（small viewport height）。
                    // 100vh のまま使うと ~75px のスクロール余地が生じてページが縦スクロールする。
                    minHeight: "100svh",
                    overflow: "hidden",
                }}
            >
                <CssBaseline />
                {/* ヘッダー */}
                <AppBar
                    position="fixed"
                    sx={{
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        ml: { md: `${drawerWidth}px` },
                        bgcolor: "#fff",
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                >
                        {isAlert && location.pathname === "/" ? (
                            <Alert severity="warning" onClose={() => setIsAlert(false)}>
                                <AlertTitle>ログインが必要です</AlertTitle>
                                全ての機能を完全無料で利用するにはログインしてください。
                                <Box mt={1}>
                                    <Link
                                        to="/login"
                                        style={{
                                            display: "inline-block",
                                            padding: "6px 16px",
                                            backgroundColor: "#f57c00", // MUIオレンジ
                                            color: "#fff",
                                            textDecoration: "none",
                                            borderRadius: "4px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        ログインページへ
                                    </Link>
                                    <Link
                                        to="/about"
                                        style={{
                                            display: "inline-block",
                                            marginLeft: "12px",
                                            padding: "6px 16px",
                                            color: "#f57c00",
                                            textDecoration: "underline",
                                            fontWeight: 500,
                                        }}
                                    >
                                        カケポンとは？
                                    </Link>
                                </Box>
                            </Alert>
                            )
                        : (
                            <>
                                <Toolbar>
                                    <IconButton
                                        color="inherit"
                                        aria-label="open drawer"
                                        edge="start"
                                        onClick={handleDrawerToggle}
                                        sx={{ mr: 2, display: { md: "none" }, color: "black" }}
                                    >
                                        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                                    </IconButton>
                                    <Typography
                                        variant="h6"
                                        noWrap
                                        component="div"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            margin: "0 auto",
                                            cursor: "pointer",
                                        }}
                                        onClick={toHome}
                                    >
                                        {/* <span className="topTitle">カケポン</span> */}
                                        <img
                                            style={topImgLogoStyle}
                                            // publicフォルダ内のロゴを参照
                                            src={headerIMG}
                                            alt="toplogo"
                                        />
                                    </Typography>
                                </Toolbar>
                            </>
                        )}
                </AppBar>

                {/* サイドバー */}
                <SideBar
                    drawerWidth={drawerWidth}
                    mobileOpen={mobileOpen}
                    handleDrawerToggle={handleDrawerToggle}
                />

                {/* メインコンテンツ */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3 },
                        width: { md: `calc(100% - ${drawerWidth}px)`, xs: "100%" },
                    }}
                >
                    <Toolbar />
                    {/* Outletで子コンポーネントにレイアウトを継承する */}
                    {/* ヘッダー・サイドバーは表示済みのまま、コンテンツ部分のみスケルトンに差し替える */}
                    <Suspense fallback={<AppContentSkeleton />}>
                        <Outlet />
                    </Suspense>
                </Box>
            </Box>
            <SnackBar
                snackBarState={snackBarState}
                setSnackBarState={setSnackBarState}
            />
        </>
    );
}
