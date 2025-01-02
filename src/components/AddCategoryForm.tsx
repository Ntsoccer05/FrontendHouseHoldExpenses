import {
    Box,
    Button,
    Drawer,
    Stack,
    Typography,
    FormControl,
    FormHelperText,
    InputLabel,
    ListItemIcon,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import { memo } from "react";
import { TransactionType } from "../types";
import { useAppContext } from "../context/AppContext";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicIcon from "./common/DynamicIcon";
import { expenseMuiIcons, incomeMuiIcons } from "../config/CategoryIcon";
import { z } from "zod";
import { useCategoryContext } from "../context/CategoryContext";

interface AddCategoryFormProps {
    type: TransactionType;
    open: boolean;
    setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onClose: () => void;
    setAdded: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddCategoryForm = memo(
    ({
        type,
        open,
        onClose,
        setIsMobileDrawerOpen,
        setAdded,
    }: AddCategoryFormProps) => {
        const { isMobile, ExpenseCategories, IncomeCategories } =
            useAppContext();
        const { addCategories } = useCategoryContext();
        const menuDrawerWidth = 320;

        const categorySchema = z.object({
            type: z.enum(["income", "expense"]),
            content: z
                .string()
                .min(1, { message: "カテゴリ名は必須です。" })
                .max(20, { message: "内容は20文字以内にしてください。" })
                .refine(
                    (val) =>
                        !(
                            type === "expense"
                                ? ExpenseCategories
                                : IncomeCategories
                        )?.some((category) => category.label === val),
                    {
                        message: "このカテゴリ名は既に存在します。",
                    }
                ),
            // 入力はstringで受けるけど、型はnumber
            icon: z.string().optional(),
        });

        type Schema = z.infer<typeof categorySchema>;

        const {
            control,
            // errorsにバリデーションメッセージが格納される
            formState: { errors, isValid },
            handleSubmit,
            reset,
        } = useForm<Schema>({
            mode: "onChange", // リアルタイムでバリデーションをチェック
            // フォームの初期値設定
            defaultValues: {
                type: "expense",
                content: "",
                icon: "",
            },
            // resolver: zodResolver()でバリデーション設定
            resolver: zodResolver(categorySchema),
        });

        // 送信処理
        const onSubmit: SubmitHandler<Schema> = async (data) => {
            data.type = type;
            await addCategories(data);
            // フォームの入力値を空にする
            setIsMobileDrawerOpen(false);
            reset();
            setAdded(true);
        };

        return (
            <Drawer
                sx={{
                    width: isMobile ? "auto" : menuDrawerWidth,
                    "& .MuiDrawer-paper": {
                        width: isMobile ? "auto" : menuDrawerWidth,
                        boxSizing: "border-box",
                        p: 2,
                        ...(isMobile && {
                            height: "80vh",
                            borderTopRightRadius: 8,
                            borderTopLeftRadius: 8,
                        }),
                        ...(!isMobile && {
                            top: 64,
                            height: `calc(100% - 64px)`, // AppBarの高さを引いたビューポートの高さ
                            border: "1px solid rgba(0, 0, 0, 0.12);",
                        }),
                    },
                }}
                variant={isMobile ? "temporary" : "permanent"}
                anchor={isMobile ? "bottom" : "right"}
                open={open}
                onClose={onClose}
            >
                <Stack sx={{ height: "100%" }} spacing={2}>
                    {/* 内訳タイトル&内訳追加ボタン */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1,
                        }}
                    ></Box>
                    {/* 入力エリアヘッダー */}
                    <Box
                        display={"flex"}
                        justifyContent={"space-between"}
                        mb={2}
                    >
                        <Typography variant="h6" sx={{ margin: "auto" }}>
                            カテゴリ追加
                        </Typography>
                    </Box>
                    {/* フォーム要素 */}
                    {/* hundleSubmitで送信処理 */}
                    <Box component={"form"} onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2}>
                            {/* 内容 */}
                            <Controller
                                name="content"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        error={!!errors.content}
                                        helperText={errors.content?.message}
                                        {...field}
                                        label="カテゴリ名"
                                        type="text"
                                    />
                                )}
                            />
                            <Controller
                                name="icon"
                                control={control}
                                render={({ field }) => (
                                    <FormControl
                                        fullWidth
                                        error={!!errors.icon}
                                    >
                                        <InputLabel id="category-select-label">
                                            アイコン
                                        </InputLabel>
                                        <Select
                                            {...field}
                                            labelId="category-select-label"
                                            id="category-select"
                                            label="カテゴリ"
                                        >
                                            {(type === "expense"
                                                ? expenseMuiIcons
                                                : incomeMuiIcons
                                            )?.map((icon, index) => (
                                                <MenuItem
                                                    value={icon}
                                                    key={index}
                                                >
                                                    <ListItemIcon>
                                                        <DynamicIcon
                                                            iconName={icon}
                                                            fontSize="small"
                                                        />
                                                    </ListItemIcon>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>
                                            {errors.icon?.message}
                                        </FormHelperText>
                                    </FormControl>
                                )}
                            />

                            {/* 保存ボタン */}
                            <Button
                                type="submit"
                                variant="contained"
                                color={type === "expense" ? "error" : "primary"}
                                fullWidth
                                disabled={!isValid} // isValidを使ってエラーがあれば無効化
                            >
                                追加
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </Drawer>
        );
    }
);

export default AddCategoryForm;
