import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
import Home from "../pages/Home";
import AppLayout from "../components/layout/AppLayout";
import { theme } from "../theme/theme";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";

import { AppProvider } from "../context/AppContext";
import { CategoryProvider } from "../context/CategoryContext";
import OnlyPublicRoute from "./OnlyPublicRoute";
import { TransactionProvider } from "../context/TransactionContext";
import { PrivateRoute } from "./PrivateRoute";
import { AuthProvider } from "../context/AuthContext";
import { HelmetProvider } from "react-helmet-async";
// import MaintenanceGuard from "../components/common/MaintenanceGuard"; // メンテナンス時間終了のため無効化
import { FixedExpenseProvider } from "../context/FixedExpenseContext";
import { SplitGroupProvider } from "../context/SplitGroupContext";
import PageSkeleton from "../components/common/PageSkeleton";

// ルート単位でコード分割し、初期バンドルサイズを削減する
// Homeはアプリのメイン画面（登録不要でも即表示させたい）のためlazy化の対象から除外
const Report = lazy(() => import("../pages/Report"));
const NoMatch = lazy(() => import("../pages/NoMatch"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const VerifyEmail = lazy(() => import("../components/Auth/VerifyEmail"));
const PasswordForget = lazy(() => import("../pages/PasswordForget"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Category = lazy(() => import("../pages/Category"));
const GoogleCallback = lazy(() => import("../components/Auth/GoogleCallback"));
const FixedExpense = lazy(() => import("../pages/FixedExpense"));
const SplitGroup = lazy(() => import("../pages/SplitGroup"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Company = lazy(() => import("../pages/Company"));
const Guide = lazy(() => import("../pages/Guide"));
const CalendarKakeibo = lazy(() => import("../pages/CalendarKakeibo"));

function DefineRouter() {
    return (
        <QueryClientProvider client={queryClient}>
        <HelmetProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {/* <MaintenanceGuard> */}
                    <Router>
                    <AuthProvider>
                        {/* AppProviderで囲まれている中でvalueで設定した値をグローバルに参照できる */}
                        <AppProvider>
                                <Suspense fallback={<PageSkeleton />}>
                                <Routes>
                                    <Route path="/about" element={<About />} />
                                    <Route path="/contact" element={<Contact />} />
                                    <Route path="/privacy" element={<Privacy />} />
                                    <Route path="/company" element={<Company />} />
                                    <Route path="/guide" element={<Guide />} />
                                    <Route path="/calendar-kakeibo" element={<CalendarKakeibo />} />
                                    <Route path="/" element={<AppLayout />}>
                                        {/* 親と同じパスはindexと記述できる */}
                                        <Route
                                            index
                                            // PrivateRoute：ログインしていなかったらログイン画面へリダイレクト
                                            element={
                                                <TransactionProvider>
                                                    <SplitGroupProvider>
                                                        <Home />
                                                    </SplitGroupProvider>
                                                </TransactionProvider>
                                            }
                                        />
                                        <Route
                                            path="/login"
                                            element={
                                                <OnlyPublicRoute>
                                                    <Login />
                                                </OnlyPublicRoute>
                                            }
                                        />
                                        <Route
                                            path="/register"
                                            element={
                                                <OnlyPublicRoute>
                                                    <Register />
                                                </OnlyPublicRoute>
                                            }
                                        />
                                        <Route
                                            path="/login/:provider/callback"
                                            element={
                                                <OnlyPublicRoute>
                                                    <GoogleCallback />
                                                </OnlyPublicRoute>
                                            }
                                        />
                                        <Route
                                            path="/report"
                                            element={
                                                <TransactionProvider>
                                                    <PrivateRoute>
                                                        <Report />
                                                    </PrivateRoute>
                                                </TransactionProvider>
                                            }
                                        />
                                        {/* routerの中でcontextを一部に使いたいときはelementの中で指定する */}
                                        <Route
                                            path="/category"
                                            element={
                                                <PrivateRoute>
                                                    <CategoryProvider>
                                                        <Category />
                                                    </CategoryProvider>
                                                </PrivateRoute>
                                            }
                                        />
                                        <Route
                                            path="/fixed-expenses"
                                            element={
                                                <PrivateRoute>
                                                    <FixedExpenseProvider>
                                                        <FixedExpense />
                                                    </FixedExpenseProvider>
                                                </PrivateRoute>
                                            }
                                        />
                                        <Route
                                            path="/split-groups"
                                            element={
                                                <PrivateRoute>
                                                    <SplitGroupProvider>
                                                        <SplitGroup />
                                                    </SplitGroupProvider>
                                                </PrivateRoute>
                                            }
                                        />
                                        <Route
                                            path="/api/email/verify/:id/:hash"
                                            element={
                                                <VerifyEmail />
                                            }
                                        />
                                        <Route
                                            path="/api/password/reset"
                                            element={
                                                <OnlyPublicRoute>
                                                    <ResetPassword />
                                                </OnlyPublicRoute>
                                            }
                                        />
                                        <Route
                                            path="/password/forget"
                                            element={
                                                <OnlyPublicRoute>
                                                    <PasswordForget />
                                                </OnlyPublicRoute>
                                            }
                                        />
                                        {/* 最後にpath='*'で上記に当てはまらない全てのページを指す */}
                                        <Route path="*" element={<NoMatch />} />
                                    </Route>
                                </Routes>
                                </Suspense>
                        </AppProvider>
                    </AuthProvider>
                    </Router>
                {/* </MaintenanceGuard> */}
            </ThemeProvider>
        </HelmetProvider>
        </QueryClientProvider>
    );
}

export default DefineRouter;
