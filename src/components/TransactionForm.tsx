import {
    Box,
    Button,
    ButtonGroup,
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
import { Controller, SubmitHandler, useForm } from "react-hook-form";
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

        useEffect(() => {
            setCategories(ExpenseCategories);
        }, [ExpenseCategories]);

        const {
            control,
            setValue,
            watch,
            // errorsにバリデーションメッセージが格納される
            formState: { errors },
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
                category: "",
                content: "",
            });
        }, [currentDay]);

        //収支タイプを監視
        const currentType = watch("type");

        //収支タイプに応じたカテゴリを取得
        useEffect(() => {
            const newCategories =
                currentType === "expense"
                    ? ExpenseCategories
                    : IncomeCategories;
            setCategories(newCategories);
        }, [currentType]);

        // 送信処理
        const onSubmit: SubmitHandler<Schema> = (data) => {
            if (selectedTransaction) {
                onUpdateTransaction(data, selectedTransaction.id)
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
                onSaveTransaction(data)
                    .then(() => {})
                    .catch((error) => {
                        console.error(error);
                    });
            }
            //reset()でフォームフィールドの内容を引数の値でリセット
            reset({
                type: "expense",
                date: currentDay,
                amount: 0,
                category: "",
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
                    category: "",
                    content: "",
                });
            }
        }, [selectedTransaction]);

        //削除処理
        const handleDelete = () => {
            if (selectedTransaction) {
                onDeleteTransaction(selectedTransaction.id);
                if (isMobile) {
                    setIsDialogOpen(false);
                }
                setSelectedTransaction(null);
            }
        };

        const dispCalculator = () => {
            setShowCalculator(!showCalculator);
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
                                <Box display="flex">
                                    <TextField
                                        sx={{ flexGrow: 1 }}
                                        error={!!errors.amount}
                                        helperText={errors.amount?.message}
                                        {...field}
                                        value={
                                            field.value === 0 ? "" : field.value
                                        }
                                        onChange={(e) => {
                                            // parseIntの第二引数は10進数表示とするため
                                            const newValue =
                                                parseInt(e.target.value, 10) ||
                                                0;
                                            field.onChange(newValue);
                                        }}
                                        label="金額"
                                        type="number"
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
                                        >
                                            <DialogContent
                                                sx={{ textAlign: "center" }}
                                            >
                                                <Caluculator
                                                    setShowCalculator={
                                                        setShowCalculator
                                                    }
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
                        >
                            {selectedTransaction ? "更新" : "保存"}
                        </Button>
                        {selectedTransaction && (
                            <Button
                                onClick={handleDelete}
                                variant="outlined"
                                color={"secondary"}
                                fullWidth
                            >
                                削除
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
