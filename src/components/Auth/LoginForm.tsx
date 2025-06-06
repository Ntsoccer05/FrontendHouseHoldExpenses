import { useState } from "react";
import { LoginScheme, loginSchema } from "../../validations/Login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
    Box,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LoginError } from "../../utils/errorHandling";
import ModalComponent from "../common/ModalComponent";
import { Link } from "react-router-dom";
import AppTitle from "../layout/AppTitle";
import { MeetingRoomOutlined } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { FiEye, FiEyeOff } from "react-icons/fi";
import SocialLoginBtn from "./Common/SocialLoginBtn";
import apiClient from "../../utils/axios";
import { useAuthContext } from "../../context/AuthContext";

function LoginForm() {
    type LoginErrMsgs = {
        emailErrMsg?: string;
        passErrMsg?: string;
    };

    const [errorMsgs, setErrorMsgs] = useState<LoginErrMsgs>({
        emailErrMsg: "",
        passErrMsg: "",
    });

    const { login } = useAuthContext();

    const [reConfirmEmail, setReConfirmEmail] = useState<boolean>(false);

    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMainMessage, setModalMainMessage] = useState<string>("");
    const [modalMessage, setModalMessage] = useState<string>("");

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const {
        control,
        // errorsにバリデーションメッセージが格納される
        formState: { errors },
        handleSubmit,
        getValues,
    } = useForm<LoginScheme>({
        // フォームの初期値設定
        defaultValues: {
            email: "",
            password: "",
        },
        // resolver: zodResolver()でバリデーション設定
        resolver: zodResolver(loginSchema),
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loginSubmit: SubmitHandler<LoginScheme> = async (data) => {
        setIsLoading(true);
        setErrorMsgs(() => {
            return {
                emailErrMsg: "",
                passErrMsg: "",
            };
        });
        // CSRF保護
        try{
            await login(data);
            navigate("/");
        }catch(error){
            // 送信失敗時の処理
            if (error.response.status == 403) {
                setErrorMsgs((state) => {
                    return {
                        ...state,
                        emailErrMsg: error.response.data.error,
                    };
                });
                setReConfirmEmail(true);
            }else{
                setReConfirmEmail(false);
            }
            const errorResMsgs = error.response.data.errors;
            LoginError(errorResMsgs, setErrorMsgs);
        }finally{
            setIsLoading(false);
        }
    };

    const resendConfirmEmail: () => void = async () => {
        //フォームデータ送信時に画面を再更新しないようにする処理
        setIsLoading(true);
        const formEmailVal = getValues("email");
        setModalMainMessage("認証用メール");
        setModalMessage("認証用メールを送信しました。ご確認お願いします。");
        await apiClient
            .post("/email/verification-notification", {
                email: formEmailVal,
            })
            .then((res) => {
                setShowModal(true);
                setIsLoading(false);
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err);
            });
    };

    const handleCloseModal: () => void = () => {
        setShowModal(false);
    };

    const IconComponents: JSX.Element = <MeetingRoomOutlined />;

    const formContent = (
        <>
            <Box
                component={"form"}
                sx={{ width: "100%" }}
                onSubmit={handleSubmit(loginSubmit)}
            >
                <Stack spacing={2}>
                    {/* メールアドレス */}
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                error={!!errors.email}
                                helperText={errorMsgs?.emailErrMsg}
                                {...field}
                                autoFocus
                                required
                                label="メールアドレス"
                                type="email"
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
                                error={!!fieldState.error || !!errors.password}
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
                    {/* 保存ボタン */}
                    {/* イベントハンドラで条件式の場合onClick={()=>}のようにアロー関数型で記述する */}
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        loading={isLoading}
                    >
                        ログイン
                    </LoadingButton>
                    {reConfirmEmail && (
                        <LoadingButton
                            color="error"
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isLoading}
                            loading={isLoading}
                            onClick={() => resendConfirmEmail()}
                        >
                            {isLoading ? "認証メール送信中" : "再度メール認証"}
                        </LoadingButton>
                    )}
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
                    <AppTitle title="ログイン" src={`${import.meta.env.VITE_API_URL}/storage/images/kakepon_login_jump.gif`} alt="ログイン|カケポン"></AppTitle>
                    <SocialLoginBtn></SocialLoginBtn>

                    {formContent}
                    <Grid container sx={{ mt: 5, display: "block" }}>
                        <Grid item xs sx={{ mb: 1 }}>
                            <Link to="/password/forget">
                                パスワードを忘れましたか？
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link to="/register">
                                {"アカウントをお持ちでないですか？ 新規アカウント登録"}
                            </Link>
                        </Grid>
                    </Grid>
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

export default LoginForm;
