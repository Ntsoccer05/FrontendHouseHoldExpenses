import { useState } from "react";
import {
    Alert,
    Box,
    Container,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Helmet } from "react-helmet-async";
import { AxiosError } from "axios";
import { contactSchema, ContactScheme } from "../validations/Contact";
import { contactApi } from "../api/contactApi";
import StaticPageLayout from "../components/layout/StaticPageLayout";
import { ogIMG } from "../config/ogImg";

const Contact = () => {
    const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<ContactScheme>({
        defaultValues: { name: "", email: "", message: "" },
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactScheme) => {
        setSubmitState("idle");
        try {
            await contactApi.send(data);
            setSubmitState("success");
            reset();
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            setErrorMessage(
                axiosError.response?.data?.message || "送信に失敗しました。時間をおいて再度お試しください。"
            );
            setSubmitState("error");
        }
    };

    return (
        <StaticPageLayout>
            <Helmet>
                <title>お問い合わせ｜らくらく・シンプル家計簿カケポン</title>
                <meta name="robots" content="noindex, follow" />
                <meta
                    name="description"
                    content="家計簿アプリ「カケポン」に関するご質問・ご要望はこちらのフォームからお問い合わせください。"
                />
                <meta property="og:title" content="お問い合わせ｜カケポン" />
                <meta property="og:url" content="https://kake-pon.com/contact" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>

            <Container maxWidth="sm" sx={{ py: { xs: 6, sm: 10 } }}>
                <Typography variant="h4" component="h1" fontWeight="bold" textAlign="center" sx={{ mb: 2, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                    お問い合わせ
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 5 }}>
                    カケポンに関するご質問・ご要望・不具合報告などは、下記フォームよりお気軽にお問い合わせください。
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: { xs: 3, sm: 4 }, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
                    <Stack spacing={3}>
                        {submitState === "success" && (
                            <Alert severity="success">お問い合わせを受け付けました。ご連絡いただきありがとうございます。</Alert>
                        )}
                        {submitState === "error" && <Alert severity="error">{errorMessage}</Alert>}

                        <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="お名前"
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />
                        <Controller
                            name="email"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="メールアドレス"
                                    type="email"
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />
                        <Controller
                            name="message"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="お問い合わせ内容"
                                    fullWidth
                                    multiline
                                    minRows={5}
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />

                        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                            送信する
                        </LoadingButton>
                    </Stack>
                </Box>
            </Container>
        </StaticPageLayout>
    );
};

export default Contact;
