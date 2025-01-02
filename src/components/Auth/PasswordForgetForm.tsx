import { Box, Button, Container, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import ModalComponent from "../common/ModalComponent";
import { PasswordForgetScheme } from "../../validations/PasswordForget";
import { PasswordForgetError } from "../../utils/errorHandling";
import AppTitle from "../layout/AppTitle";
import apiClient from "../../utils/axios";

function PasswordForgetForm() {
    type PasswordResetErrMsgs = {
        emailErrMsg?: string;
        passErrMsg?: string;
        passConfErrMsg?: string;
    };

    const [errorMsgs, setErrorMsgs] = useState<PasswordResetErrMsgs>({
        emailErrMsg: "",
    });

    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMainMessage, setModalMainMessage] = useState<string>("");
    const [modalMessage, setModalMessage] = useState<string>("");

    const { control, handleSubmit } = useForm<PasswordForgetScheme>({
        // フォームの初期値設定
        defaultValues: {
            email: "",
        },
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const registerSubmit: SubmitHandler<PasswordForgetScheme> = (data) => {
        //フォームデータ送信時に画面を再更新しないようにする処理
        setIsLoading(true);
        setErrorMsgs(() => {
            return {
                emailErrMsg: "",
            };
        });
        apiClient
            .post("/password/forget", data)
            .then((response) => {
                // 送信成功時の処理
                setShowModal(true);
                setModalMainMessage("パスワード変更メール");
                setModalMessage(
                    "パスワード変更メールを送信しました。ご確認お願いします。"
                );
                setIsLoading(false);
            })
            .catch(function (error) {
                setIsLoading(false);
                const errorResMsgs = error.response.data.errors;
                PasswordForgetError(errorResMsgs, setErrorMsgs);
                // 送信失敗時の処理
                console.log("通信に失敗しました");
            });
    };
    const handleCloseModal: () => void = () => {
        setShowModal(false);
    };

    const formContent = (
        <>
            <Box
                component={"form"}
                sx={{ width: "100%" }}
                onSubmit={handleSubmit(registerSubmit)}
            >
                <Stack spacing={2}>
                    {/* メールアドレス */}
                    {/* メールアドレス */}
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                error={!!errorMsgs?.emailErrMsg}
                                helperText={errorMsgs?.emailErrMsg}
                                {...field}
                                label="メールアドレス"
                                type="email"
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
                            ? "パスワード変更メール送信中"
                            : "パスワード変更メールを送る"}
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
                    <AppTitle title="パスワード変更メール送信"></AppTitle>
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

export default PasswordForgetForm;
