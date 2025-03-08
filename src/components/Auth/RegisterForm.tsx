import { useState } from "react";
import { RegisterScheme } from "../../validations/Register";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
    Box,
    Container,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
} from "@mui/material";
import { RegisterError } from "../../utils/errorHandling";
import ModalComponent from "../common/ModalComponent";
import AppTitle from "../layout/AppTitle";
import LockOpen from "@mui/icons-material/LockOpen";
import { LoadingButton } from "@mui/lab";
import { FiEye, FiEyeOff } from "react-icons/fi";
import SocialLoginBtn from "./Common/SocialLoginBtn";
import apiClient from "../../utils/axios";

function RegisterForm() {
    type RegisterErrMsgs = {
        nameErrMsg?: string;
        emailErrMsg?: string;
        passErrMsg?: string;
        passConfErrMsg?: string;
    };

    const [errorMsgs, setErrorMsgs] = useState<RegisterErrMsgs>({
        nameErrMsg: "",
        emailErrMsg: "",
        passErrMsg: "",
        passConfErrMsg: "",
    });

    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMainMessage, setModalMainMessage] = useState<string>("");
    const [modalMessage, setModalMessage] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConf, setShowPasswordConf] = useState(false);

    const {
        control,
        // setValue,
        // watch,
        // errorsにバリデーションメッセージが格納される
        // formState: { errors },
        handleSubmit,
        reset,
    } = useForm<RegisterScheme>({
        // フォームの初期値設定
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
        },
        // resolver: zodResolver()でバリデーション設定
        // resolver: zodResolver(registerSchema),
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const registerSubmit: SubmitHandler<RegisterScheme> = (data) => {
        //フォームデータ送信時に画面を再更新しないようにする処理
        setIsLoading(true);
        setErrorMsgs(() => {
            return {
                nameErrMsg: "",
                emailErrMsg: "",
                passErrMsg: "",
                passConfErrMsg: "",
            };
        });

        apiClient
            .post("/register", data)
            .then((response) => {
                // 送信成功時の処理
                setShowModal(true);
                setModalMainMessage("認証用メール");
                setModalMessage(
                    "認証用メールを送信しました。ご確認お願いします。"
                );

                setIsLoading(false);
            })
            .catch(function (error) {
                setIsLoading(false);
                const errorResMsgs = error.response.data.errors;
                RegisterError(errorResMsgs, setErrorMsgs);
                // 送信失敗時の処理
                console.log("通信に失敗しました");
            });
    };
    const handleCloseModal: () => void = () => {
        setShowModal(false);
    };
    const IconComponents: JSX.Element = <LockOpen />;

    const formContent = (
        <>
            <Box
                component={"form"}
                sx={{ width: "100%" }}
                onSubmit={handleSubmit(registerSubmit)}
            >
                <Stack spacing={2}>
                    {/* ユーザー名 */}
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                // errors.nameは値が入っており、!!で値が入っている場合True、ない場合はFalseと変換している
                                error={!!errorMsgs?.nameErrMsg}
                                helperText={errorMsgs?.nameErrMsg}
                                {...field}
                                autoFocus
                                label="ユーザー名"
                                type="text"
                                required
                            />
                        )}
                    />
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
                    {/* パスワード */}
                    <Controller
                        name="password"
                        control={control}
                        rules={{
                            required: "パスワードは必須です",
                            minLength: {
                                value: 8,
                                message: "パスワードは8文字以上で入力してください",
                            },
                        }}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                error={!!fieldState.error || !!errorMsgs.passErrMsg}
                                helperText={fieldState.error?.message || errorMsgs?.passErrMsg}
                                required
                                label="パスワード"
                                type={showPassword ? "text" : "password"}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                edge="end"
                                            >
                                                {showPassword ? (
                                                    <FiEyeOff />
                                                ) : (
                                                    <FiEye />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                    {/* パスワード確認 */}
                    <Controller
                        name="password_confirmation"
                        control={control}
                        rules={{
                            required: "パスワード確認は必須です",
                            minLength: {
                                value: 8,
                                message: "パスワードは8文字以上で入力してください",
                            }
                        }}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                error={!!fieldState.error || !!errorMsgs.passConfErrMsg}
                                helperText={fieldState.error?.message || errorMsgs?.passConfErrMsg}
                                required
                                label="パスワード確認"
                                type={showPasswordConf ? "text" : "password"}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPasswordConf(
                                                        !showPasswordConf
                                                    )
                                                }
                                                edge="end"
                                            >
                                                {showPasswordConf ? (
                                                    <FiEyeOff />
                                                ) : (
                                                    <FiEye />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                    {/* 保存ボタン */}
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        loading={isLoading}
                        loadingPosition="start"
                    >
                        {isLoading
                            ? modalMessage
                                ? "認証メールを確認してください"
                                : "認証メール送信中"
                            : "登録"}
                    </LoadingButton>
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
                        gap: "20px",
                    }}
                >
                    <AppTitle
                        title="サインイン"
                        icon={IconComponents}
                    ></AppTitle>
                    <SocialLoginBtn></SocialLoginBtn>
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

export default RegisterForm;
