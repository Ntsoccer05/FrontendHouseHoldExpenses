import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Report from "../pages/Report";
import NoMatch from "../pages/NoMatch";
import AppLayout from "../components/layout/AppLayout";
import { theme } from "../theme/theme";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";

import { AppProvider } from "../context/AppContext";
import { CategoryProvider } from "../context/CategoryContext";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../components/Auth/VerifyEmail";
import PasswordForget from "../pages/PasswordForget";
import ResetPassword from "../pages/ResetPassword";
import Category from "../pages/Category";
import OnlyPublicRoute from "./OnlyPublicRoute";
import { TransactionProvider } from "../context/TransactionContext";
import GoogleCallback from "../components/Auth/GoogleCallback";
import { PrivateRoute } from "./PrivateRoute";
import { AuthProvider } from "../context/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import MaintenanceGuard from "../components/common/MaintenanceGuard";
import FixedExpense from "../pages/FixedExpense";
import { FixedExpenseProvider } from "../context/FixedExpenseContext";

function DefineRouter() {
    return (
        <HelmetProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <MaintenanceGuard>
                    <Router>
                    <AuthProvider>
                        {/* AppProviderで囲まれている中でvalueで設定した値をグローバルに参照できる */}
                        <AppProvider>
                                <Routes>
                                    <Route path="/" element={<AppLayout />}>
                                        {/* 親と同じパスはindexと記述できる */}
                                        <Route
                                            index
                                            // PrivateRoute：ログインしていなかったらログイン画面へリダイレクト
                                            element={
                                                <FixedExpenseProvider>
                                                    <TransactionProvider>
                                                        <Home />
                                                    </TransactionProvider>
                                                </FixedExpenseProvider>
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
                        </AppProvider>
                    </AuthProvider>
                    </Router>
                </MaintenanceGuard>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default DefineRouter;
