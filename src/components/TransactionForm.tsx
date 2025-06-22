import {
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    Dialog,
    DialogContent,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    ListItemIcon,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import { CategoryItem, Transaction } from "../types";
import React, { memo, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Schema, transactionSchema } from "../validations/schema";
import { useAppContext } from "../context/AppContext";
import DynamicIcon from "./common/DynamicIcon";
import { useTransactionContext } from "../context/TransactionContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import Caluculator from "./Caluculator/Caluculator";
import DraggablePaper from "./Dialog/DraggablePaper";
import { toHalfWidth } from "../utils/formatting";
interface TransactionFormProps {
    onCloseForm: () => void;
    isEntryDrawerOpen: boolean;
    currentDay: string;
    selectedTransaction: Transaction | null;
    setSelectedTransaction: React.Dispatch<
        React.SetStateAction<Transaction | null>
    >;

    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type IncomeExpense = "income" | "expense";

const TransactionForm = memo(
    ({
        onCloseForm,
        isEntryDrawerOpen,
        currentDay,
        selectedTransaction,
        isDialogOpen,
        setSelectedTransaction,
        setIsDialogOpen,
    }: TransactionFormProps) => {
        const { isMobile, IncomeCategories, ExpenseCategories } =
            useAppContext();
        const { onSaveTransaction, onDeleteTransaction, onUpdateTransaction } =
            useTransactionContext();
        const formWidth = 320;
        const [categories, setCategories] = useState<
            CategoryItem[] | undefined
        >([
            {
                label: "",
                icon: "",
            },
        ]);

        const [isFocused, setIsFocused] = useState<boolean>(false);

        // 削除中ローディング
        const [isDeleting, setIsDeleting] = useState(false);

        const defaultCategory = ExpenseCategories?.[0]?.label ?? "";

        useEffect(() => {
            setCategories(ExpenseCategories);
        }, [ExpenseCategories]);

        const {
            control,
            setValue,
            watch,
            // errorsにバリデーションメッセージが格納される
            formState: { errors, isSubmitting },
            handleSubmit,
            reset,
        } = useForm<Schema>({
            // フォームの初期値設定
            defaultValues: {
                type: "expense",
                date: currentDay,
                amount: 0,
                category: "",
                content: "",
            },
            // resolver: zodResolver()でバリデーション設定
            resolver: zodResolver(transactionSchema),
        });

        const [showCalculator, setShowCalculator] = useState<boolean>(false);

        // 収支タイプを切り替える関数
        const incomeExpenseToggle = (type: IncomeExpense) => {
            // formのvalueに値をセット
            setValue("type", type);
            setValue("category", "");
        };

        //カレンダー上の選択した日付を取得してセット
        useEffect(() => {
            setValue("date", currentDay);
            reset({
                type: "expense",
                date: currentDay,
                amount: 0,
                category: defaultCategory,
                content: "",
            });
        }, [currentDay]);

        // 支出デフォルト値セット
        useEffect(() => {
            if (ExpenseCategories?.length) {
                reset({
                    type: "expense",
                    date: currentDay,
                    amount: 0,
                    category: ExpenseCategories[0].label ?? "",
                    content: "",
                });
                setCategories(ExpenseCategories);
            }
        }, [ExpenseCategories]);

        //収支タイプを監視
        const currentType = watch("type");
        // 現在選択しているカテゴリ
        const selectedLabel = watch("category");

        //収支タイプに応じたカテゴリを取得
        useEffect(() => {
            const newCategories =
                currentType === "expense"
                    ? ExpenseCategories
                    : IncomeCategories;
            setCategories((prevCategory)=>prevCategory = newCategories);
            reset({
                type: currentType,
                date: currentDay,
                amount: 0,
                category: newCategories?.[0]?.label,
                content: "",
            });
        }, [currentType]);

        // 送信処理
        const onSubmit: SubmitHandler<Schema> = async(data) => {
            if (selectedTransaction) {
                await onUpdateTransaction(data, selectedTransaction.id)
                    .then(() => {
                        setSelectedTransaction(null);
                        if (isMobile) {
                            setIsDialogOpen(false);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                await onSaveTransaction(data)
                    .then(() => {})
                    .catch((error) => {
                        console.error(error);
                    });
            }
            //reset()でフォームフィールドの内容を引数の値でリセット
            reset({
                type: currentType,
                date: currentDay,
                amount: 0,
                category: selectedLabel,
                content: "",
            });
        };

        //選択肢が更新されたか確認
        useEffect(() => {
            if (selectedTransaction) {
                // some()では配列の中に特定の値があればtrueを返す（categoriesの中にselectedTransaction.categoryの値があるか）
                const categoryExists = categories?.some(
                    (category) =>
                        category.label === selectedTransaction.category
                );
                setValue(
                    "category",
                    categoryExists ? selectedTransaction.category : ""
                );
            }
        }, [selectedTransaction, categories]);

        //フォーム内容を更新
        useEffect(() => {
            if (selectedTransaction) {
                setValue("type", selectedTransaction.type);
                setValue("date", selectedTransaction.date);
                setValue("amount", selectedTransaction.amount);
                setValue("content", selectedTransaction.content);
            } else {
                reset({
                    type: "expense",
                    date: currentDay,
                    amount: 0,
                    category: categories?.[0].label,
                    content: "",
                });
            }
        }, [selectedTransaction]);

        //削除処理
        const handleDelete = async () => {
            if (selectedTransaction) {
                setIsDeleting(true);
                try {
                    await onDeleteTransaction(selectedTransaction.id);
                    if (isMobile) {
                        setIsDialogOpen(false);
                    }
                    setSelectedTransaction(null);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsDeleting(false);
                }
            }
        };

        const dispCalculator = () => {
            setShowCalculator(!showCalculator);
        };

        const toggleSign = (value: number) => {
            return value === 0 ? 0 : -value;
        };

        // 金額フォーカス時に数値化
        const handleFocus = (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            field: ControllerRenderProps<any, any>
            ) => {
            const raw = e.target.value.replace(/,/g, "");
            const parsed = Number(raw);
            if (!isNaN(parsed)) {
                field.onChange(parsed);
            }
        };

        // 金額ブラー時にカンマ区切り
        const handleBlur = (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            field: ControllerRenderProps<any, any>
            ) => {
            const raw = toHalfWidth(e.target.value).replace(/,/g, "");
            const parsed = Number(raw);
            field.onChange(isNaN(parsed) ? 0 : parsed);
        };

        // 金額修正
        const handleChange = (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            field: ControllerRenderProps<any, any>
            ) => {
            const raw = e.target.value
                            .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)) // 全角数字を半角に変換
                            .replace(/[^\d-]/g, ""); // 半角数字とハイフン以外を除去
            const parsed = Number(raw);
            if (!isNaN(parsed) || raw === "") {
                field.onChange(raw === "" ? 0 : parsed);
            }
        };

        const formContent = (
            <>
                {/* 入力エリアヘッダー */}
                <Box display={"flex"} justifyContent={"space-between"} mb={2}>
                    <Typography variant="h6">入力</Typography>
                    {/* 閉じるボタン */}
                    <IconButton
                        onClick={onCloseForm}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                {/* フォーム要素 */}
                {/* hundleSubmitで送信処理 */}
                <Box component={"form"} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        {/* 収支切り替えボタン */}
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => {
                                return (
                                    <ButtonGroup fullWidth>
                                        <Button
                                            variant={
                                                field.value === "expense"
                                                    ? "contained"
                                                    : "outlined"
                                            }
                                            color="error"
                                            onClick={() =>
                                                incomeExpenseToggle("expense")
                                            }
                                        >
                                            支出
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                incomeExpenseToggle("income")
                                            }
                                            color={"primary"}
                                            variant={
                                                field.value === "income"
                                                    ? "contained"
                                                    : "outlined"
                                            }
                                        >
                                            収入
                                        </Button>
                                    </ButtonGroup>
                                );
                            }}
                        />
                        {/* 日付 */}
                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="日付"
                                    type="date"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    // errors.dateは値が入っており、!!で値が入っている場合True、ない場合はFalseと変換している
                                    error={!!errors.date}
                                    helperText={errors.date?.message}
                                />
                            )}
                        />
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    fullWidth
                                    error={!!errors.category}
                                >
                                    <InputLabel id="category-select-label">
                                        カテゴリ
                                    </InputLabel>
                                    <Select
                                        {...field}
                                        labelId="category-select-label"
                                        id="category-select"
                                        label="カテゴリ"
                                    >
                                        {categories?.map((category, index) => (
                                            <MenuItem
                                                value={category.label}
                                                key={index}
                                            >
                                                <ListItemIcon>
                                                    <DynamicIcon
                                                        iconName={category.icon}
                                                        fontSize="small"
                                                    />
                                                </ListItemIcon>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        {errors.category?.message}
                                    </FormHelperText>
                                </FormControl>
                            )}
                        />
                        {/* 金額 */}
                        <Controller
                            name="amount"
                            control={control}
                            render={({ field }) => (
                                <Box display="flex" alignItems="center">
                                    <IconButton
                                        onClick={() => field.onChange(toggleSign(field.value))}
                                        size="small"
                                        sx={{
                                            border: "1px solid #ccc",
                                            borderRadius: "8px",
                                            marginRight: "8px",
                                            width: 30,
                                            height: 30,
                                        }}
                                    >
                                        <Typography variant="h6">±</Typography>
                                    </IconButton>
                                    <TextField
                                        sx={{ flexGrow: 1 }}
                                        error={!!errors.amount}
                                        helperText={errors.amount?.message}
                                        {...field}
                                        value={
                                            isFocused
                                            ? field.value === 0
                                                ? ""
                                                : String(field.value) // カンマ無し表示
                                            : field.value === 0
                                                ? ""
                                                : Number(field.value).toLocaleString() // カンマ付き表示
                                        }
                                        onFocus={(e) => {
                                            setIsFocused(true);
                                            handleFocus(e, field);
                                        }}
                                        onBlur={(e) => {
                                            setIsFocused(false);
                                            handleBlur(e, field);
                                        }}
                                        onChange={(e) => handleChange(e, field)}
                                        label="金額"
                                        type="text"
                                        inputMode="numeric"
                                        inputProps={{
                                            inputMode: "numeric",
                                        }}
                                    />
                                    <IconButton onClick={dispCalculator}>
                                        <FontAwesomeIcon icon={faCalculator} />
                                    </IconButton>
                                    {showCalculator && (
                                        <Dialog
                                            open={showCalculator}
                                            onClose={dispCalculator}
                                            fullWidth
                                            maxWidth={"xs"}
                                            PaperComponent={DraggablePaper}
                                        >
                                            {/* ドラッグの取っ手 */}
                                            <div
                                                id="draggable-dialog-title"
                                                style={{
                                                    padding: "10px 10px",
                                                    cursor: "move",
                                                    backgroundColor: "#f5f5f5",
                                                    borderBottom: "1px solid #ccc",
                                                    display: "flex",
                                                    justifyContent: "flex-end",  // ボタンを右端に寄せる
                                                    alignItems: "center",
                                                }}
                                                >
                                                <IconButton
                                                    aria-label="close"
                                                    onTouchStart={dispCalculator}
                                                    onClick={dispCalculator}
                                                    size="small"
                                                    sx={{
                                                        cursor: "pointer",
                                                        zIndex: 1000,
                                                        position: "relative",
                                                        touchAction: "auto",
                                                        pointerEvents: "auto"
                                                    }}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </div>
                                            <DialogContent
                                                sx={{ textAlign: "center", padding: "16px 0 0 0" }}
                                            >
                                                <Caluculator
                                                    setShowCalculator={
                                                        setShowCalculator
                                                    }
                                                    amount={field.value}
                                                    onAmountChange={(
                                                        newValue
                                                    ) => {
                                                        // Calculatorから渡された新しい金額を反映する
                                                        field.onChange(
                                                            newValue
                                                        );
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </Box>
                            )}
                        />
                        {/* 内容 */}
                        <Controller
                            name="content"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    error={!!errors.content}
                                    helperText={errors.content?.message}
                                    {...field}
                                    label="内容"
                                    type="text"
                                />
                            )}
                        />
                        {/* 保存ボタン */}
                        <Button
                            type="submit"
                            variant="contained"
                            color={
                                currentType === "expense" ? "error" : "primary"
                            }
                            fullWidth
                            startIcon={
                                isSubmitting && (
                                    <CircularProgress color="inherit" size={20} />
                                )
                            }
                            disabled={isSubmitting || isDeleting}
                            sx={{
                                bgcolor: (theme) =>
                                    (isSubmitting || isDeleting)
                                        ? theme.palette.action.disabledBackground
                                        : undefined,
                                color: (theme) =>
                                    (isSubmitting || isDeleting)
                                        ? theme.palette.action.disabled
                                        : undefined,
                            }}
                        >
                            {isSubmitting
                                ? selectedTransaction
                                    ? "更新中…"
                                    : "保存中…"
                                : selectedTransaction
                                    ? "更新"
                                    : "保存"
                            }
                        </Button>
                        {selectedTransaction && (
                            <Button
                                onClick={handleDelete}
                                variant="outlined"
                                color={"secondary"}
                                fullWidth
                                startIcon={
                                    isDeleting && (
                                        <CircularProgress color="inherit" size={20} />
                                    )
                                }
                                disabled={isSubmitting || isDeleting}
                                sx={{
                                    bgcolor: (theme) =>
                                        (isSubmitting || isDeleting)
                                            ? theme.palette.action.disabledBackground
                                            : undefined,
                                    color: (theme) =>
                                        (isSubmitting || isDeleting)
                                            ? theme.palette.action.disabled
                                            : undefined,
                                }}
                            >
                                {isDeleting ? "削除中…" : "削除"}
                            </Button>
                        )}
                    </Stack>
                </Box>
            </>
        );
        return (
            <>
                {isMobile ? (
                    //mobile
                    <Dialog
                        open={isDialogOpen}
                        onClose={onCloseForm}
                        fullWidth
                        maxWidth={"sm"}
                    >
                        <DialogContent>{formContent}</DialogContent>
                    </Dialog>
                ) : (
                    //PC
                    <Box
                        sx={{
                            position: "fixed",
                            top: 64,
                            right: isEntryDrawerOpen ? formWidth : "-2%", // フォームの位置を調整
                            width: formWidth,
                            height: "100%",
                            bgcolor: "background.paper",
                            zIndex: (theme) => theme.zIndex.drawer - 1,
                            transition: (theme) =>
                                theme.transitions.create("right", {
                                    easing: theme.transitions.easing.sharp,
                                    duration:
                                        theme.transitions.duration
                                            .enteringScreen,
                                }),
                            p: 2, // 内部の余白
                            boxSizing: "border-box", // ボーダーとパディングをwidthに含める
                            boxShadow: "0px 0px 15px -5px #777777",
                        }}
                    >
                        {formContent}
                    </Box>
                )}
            </>
        );
    }
);
export default TransactionForm;
