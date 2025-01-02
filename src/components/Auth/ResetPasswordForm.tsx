import { Box, Button, Container, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import ModalComponent from "../common/ModalComponent";
import { PasswordResetError } from "../../utils/errorHandling";
import { PasswordResetScheme } from "../../validations/PasswordReset";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppTitle from "../layout/AppTitle";
import apiClient from "../../utils/axios";

function ResetPasswordForm() {
    type PasswordResetErrMsgs = {
        passErrMsg?: string;
        passConfErrMsg?: string;
    };

    const [errorMsgs, setErrorMsgs] = useState<PasswordResetErrMsgs>({
        passErrMsg: "",
        passConfErrMsg: "",
    });

    const navigate = useNavigate();

    // クエリパラメータ取得
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMainMessage, setModalMainMessage] = useState<string>("");
    const [modalMessage, setModalMessage] = useState<string>("");

    const { control, handleSubmit } = useForm<PasswordResetScheme>({
        // フォームの初期値設定
        defaultValues: {
            email: "",
            password: "",
            password_confirmation: "",
        },
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const passwordResetSubmit: SubmitHandler<PasswordResetScheme> = (data) => {
        //フォームデータ送信時に画面を再更新しないようにする処理
        setIsLoading(true);
        setErrorMsgs(() => {
            return {
                passErrMsg: "",
                passConfErrMsg: "",
            };
        });
        apiClient
            .post("/password/reset", { ...data, token })
            .then((response) => {
                // 送信成功時の処理
                setShowModal(true);
                setModalMainMessage("パスワード変更完了");
                setModalMessage(
                    "パスワード変更完了しました。ログインしてください。"
                );
                setIsLoading(false);
            })
            .catch(function (error) {
                setIsLoading(false);
                const errorResMsgs = error.response.data.errors;
                PasswordResetError(errorResMsgs, setErrorMsgs);
                // 送信失敗時の処理
                console.log("通信に失敗しました");
            });
    };
    const handleCloseModal: () => void = () => {
        setShowModal(false);
        navigate("/login");
    };

    const formContent = (
        <>
            <Box
                component={"form"}
                sx={{ width: "100%" }}
                onSubmit={handleSubmit(passwordResetSubmit)}
            >
                <Stack spacing={2}>
                    {/* メールアドレス */}
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="メールアドレス"
                                type="email"
                                required
                                // inputProps 属性に input タグに渡したい属性を props として渡せるっぽいので、この props 経由で readonly を指定できる
                                inputProps={{ readonly: true }}
                            />
                        )}
                    />
                    {/* パスワード */}
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                error={!!errorMsgs?.passErrMsg}
                                helperText={errorMsgs?.passErrMsg}
                                {...field}
                                label="パスワード"
                                type="password"
                                required
                            />
                        )}
                    />
                    {/* パスワード確認 */}
                    <Controller
                        name="password_confirmation"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                error={!!errorMsgs?.passConfErrMsg}
                                helperText={errorMsgs?.passConfErrMsg}
                                {...field}
                                label="パスワード確認"
                                type="password"
                                required
                            />
                        )}
                    />
                    {/* 保存ボタン */}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "パスワード変更中"
                            : "パスワードを変更する"}
                    </Button>
                </Stack>
            </Box>
        </>
    );
    return (
        <>
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <AppTitle title="パスワード変更"></AppTitle>
                    {formContent}
                    <ModalComponent
                        showModal={showModal}
                        mainMessage={modalMainMessage}
                        contentMessage={modalMessage}
                        handleCloseModal={handleCloseModal}
                    />
                </Box>
            </Container>
        </>
    );
}

export default ResetPasswordForm;
