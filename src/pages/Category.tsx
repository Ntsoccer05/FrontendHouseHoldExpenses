import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import {
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import { Stack } from "@mui/material";
import { CategoryItem, TransactionType } from "../types";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import CategoryEditForm from "../components/CategoryEditForm";
import AddIcon from "@mui/icons-material/Add";
import AddCategoryForm from "../components/AddCategoryForm";
import { useCategoryContext } from "../context/CategoryContext";
import { Helmet } from "react-helmet-async";
import { ogIMG } from "../config/ogImg";

interface Data {
    id: number;
    contents: string;
    icon: number;
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: "contents",
        numeric: false,
        disablePadding: true,
        label: "カテゴリ名",
    },
    {
        id: "icon",
        numeric: true,
        disablePadding: false,
        label: "アイコン",
    },
];

interface EnhancedTableProps {
    numSelected: number;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    rowCount: number;
    edited: boolean;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { onSelectAllClick, numSelected, rowCount, edited } = props;

    return (
        <TableHead>
            <TableRow>
                {!edited ? (
                    <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            indeterminate={
                                numSelected > 0 && numSelected < rowCount
                            }
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{
                                "aria-label": "select all desserts",
                            }}
                        />
                    </TableCell>
                ) : (
                    <TableCell align="center" padding="normal"></TableCell>
                )}
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align="center"
                        padding={headCell.disablePadding ? "none" : "normal"}
                    >
                        {headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

function Category() {
    const [selected, setSelected] = useState<readonly number[]>([]);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [added, setAdded] = useState(false);

    const numSelected = selected.length;
    const [edited, setEdited] = useState<boolean>(false);
    const [type, setType] = useState<TransactionType>("expense");

    const onUpdateCategories = () => {
        if (edited) {
            setIsSaving(true);
            setHasChanged(false);
            setEdited(false);
        } else {
            setHasChanged(false);
            setEdited(true);
        }
    };

    const handleSelectAllClick = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (!edited) {
            if (event.target.checked) {
                const newSelected =
                    categories && categories.map((n) => n.id);
                setSelected(newSelected as number[]);
                return;
            }
            setSelected([]);
        }
    };

    type IncomeExpense = TransactionType;

    const { isMobile } = useAppContext();
    const { deleteCategories } = useCategoryContext();
    const { IncomeCategories, ExpenseCategories } = useAppContext();
    const [categories, setCategories] = useState<CategoryItem[] | undefined>([
        {
            id: 0,
            label: "",
            icon: "",
            filtered_id: 0,
        },
    ]);

    const [initialized, setInitialized] = useState<boolean>(false);

    // タブ切り替え確認ダイアログ
    const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
    const [pendingType, setPendingType] = useState<TransactionType | null>(null);

    // 並び替えの保存フラグ（true = 保存ボタン押下、false = キャンセル）
    const [isSaving, setIsSaving] = useState(false);
    // 未保存の変更があるか（並び替え・ラベル・アイコン）
    const [hasChanged, setHasChanged] = useState(false);
    // キャンセル確認ダイアログ
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    // モバイル用Drawerを閉じる処理
    const handleCloseMobileDrawer = () => {
        setIsMobileDrawerOpen(false);
    };

    useEffect(() => {
        if (ExpenseCategories && !initialized) {
            if (ExpenseCategories.length > 0) {
                setCategories(ExpenseCategories);
                setInitialized(true);
            }
        }
    }, [ExpenseCategories, initialized]);
    useEffect(() => {
        if (type === "expense") {
            setCategories(ExpenseCategories);
        } else {
            setCategories(IncomeCategories);
        }
    }, [ExpenseCategories, IncomeCategories, type]);

    // 収支タイプを切り替える（内部実装）
    const doSwitchType = (nextType: IncomeExpense) => {
        setType(nextType);
        setSelected([]);
        const newCategories =
            nextType === "expense" ? ExpenseCategories : IncomeCategories;
        setCategories(newCategories);
        setEdited(false);
        setHasChanged(false);
    };

    // 収支タイプを切り替える関数（編集中の場合は確認ダイアログを表示）
    const incomeExpenseToggle = (nextType: IncomeExpense) => {
        if (nextType === type) return;
        if (edited) {
            setPendingType(nextType);
            setSwitchDialogOpen(true);
            return;
        }
        doSwitchType(nextType);
    };

    // 確認ダイアログで「切り替える」を選択
    const handleSwitchConfirm = () => {
        setSwitchDialogOpen(false);
        if (pendingType) doSwitchType(pendingType);
        setPendingType(null);
    };

    // 確認ダイアログでキャンセル
    const handleSwitchCancel = () => {
        setSwitchDialogOpen(false);
        setPendingType(null);
    };

    // キャンセルボタン押下
    const handleCancelEdit = () => {
        if (hasChanged) {
            setCancelDialogOpen(true);
        } else {
            setEdited(false);
        }
    };

    // キャンセル確認ダイアログで「破棄する」
    const handleCancelConfirm = () => {
        setCancelDialogOpen(false);
        setHasChanged(false);
        setEdited(false);
    };

    // キャンセル確認ダイアログを閉じる（編集継続）
    const handleCancelClose = () => {
        setCancelDialogOpen(false);
    };

    //削除処理
    const onDeleteCategories = async () => {
        if (selected.length > 0) {
            const tgtCategories = categories?.filter((category) => {
                return selected.includes(category.id as number);
            }) as CategoryItem[];
            await deleteCategories(tgtCategories, type);
            setSelected([]);
        }
    };

    const openAddCategoryForm = () => {
        if (isMobile) setIsMobileDrawerOpen(true);
    };

    return (
        <>
            <Helmet>
                <title>カテゴリを自由にカスタマイズ｜らくらく・シンプル家計簿カケポン</title>
                <meta
                    name="description"
                    content="家計簿の支出・収入カテゴリを自由に追加・編集。好きな色やアイコンで自分だけの家計簿を作成できます。"
                />
                <meta property="og:title" content="カテゴリを自由にカスタマイズ｜カケポン" />
                <meta
                    property="og:description"
                    content="「カケポン」なら支出や収入カテゴリを自分好みに設定可能。色やアイコンも自由に選べて、使いやすさアップ！"
                />
                <meta property="og:url" content="https://kake-pon.com/categories" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>
            <Box sx={{ width: "100%", display: "flex" }}>
                {/* 左側コンテンツ */}
                <Box sx={{ flexGrow: 1 }}>
                    {/* 収支切り替えボタン */}
                    <Stack spacing={2}>
                        <ButtonGroup fullWidth>
                            <Button
                                variant={
                                    type === "expense" ? "contained" : "outlined"
                                }
                                color="error"
                                onClick={() => incomeExpenseToggle("expense")}
                            >
                                支出
                            </Button>
                            <Button
                                onClick={() => incomeExpenseToggle("income")}
                                color={"primary"}
                                variant={
                                    type === "income" ? "contained" : "outlined"
                                }
                            >
                                収入
                            </Button>
                        </ButtonGroup>
                    </Stack>
                    <Paper sx={{ width: "100%", mb: 2, mt: 5, overflow: "hidden" }}>
                    <Toolbar
                        sx={{
                            pl: { sm: 2 },
                            pr: { xs: 1, sm: 1 },
                            ...(numSelected > 0 && {
                            bgcolor: (theme) =>
                                alpha(
                                theme.palette.primary.main,
                                theme.palette.action.activatedOpacity,
                                ),
                            }),
                        }}
                        >
                        {numSelected > 0 ? (
                            <Typography
                            sx={{ flex: "1 1 100%" }}
                            color="inherit"
                            variant="subtitle1"
                            component="div"
                            >
                            {numSelected} 件
                            </Typography>
                        ) : (
                            <Typography
                            sx={{ flex: "1 1 100%" }}
                            variant="h6"
                            id="tableTitle"
                            component="div"
                            >
                            カテゴリ編集
                            </Typography>
                        )}
                            {isMobile ? (
                                <Box display="flex" gap={2} alignItems="center">
                                    <Box textAlign="center">
                                        <IconButton onClick={openAddCategoryForm} sx={{flexDirection: "column"}}>
                                            <AddIcon />
                                            <Typography variant="caption">追加</Typography>
                                        </IconButton>
                                    </Box>
                                    {numSelected > 0 ? (
                                        <Box textAlign="center">
                                            <IconButton onClick={onDeleteCategories} sx={{ flexDirection: "column" }}>
                                                <DeleteIcon />
                                                <Typography variant="caption">削除</Typography>
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box display="flex" gap={1}>
                                            {edited && (
                                                <Box textAlign="center">
                                                    <IconButton onClick={handleCancelEdit} sx={{ flexDirection: "column" }}>
                                                        <CancelIcon />
                                                        <Typography variant="caption" sx={{ whiteSpace: "nowrap" }}>キャンセル</Typography>
                                                    </IconButton>
                                                </Box>
                                            )}
                                            <Box textAlign="center">
                                                <IconButton onClick={onUpdateCategories} sx={{ flexDirection: "column" }}>
                                                    {edited ? <SaveIcon /> : <EditIcon />}
                                                    <Typography variant="caption">{edited ? "保存" : "編集"}</Typography>
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                                ) : (
                                <>
                                    <Tooltip title="追加">
                                        <IconButton onClick={openAddCategoryForm}>
                                            <AddIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {numSelected > 0 ? (
                                        <Tooltip title="削除">
                                            <IconButton onClick={onDeleteCategories}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <>
                                            {edited && (
                                                <Tooltip title="キャンセル">
                                                    <IconButton onClick={handleCancelEdit}>
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title={edited ? "保存" : "編集"}>
                                                <IconButton onClick={onUpdateCategories}>
                                                    {edited ? <SaveIcon /> : <EditIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </>
                            )}
                        </Toolbar>
                        <TableContainer sx={{ maxHeight: 740 }}>
                            <Table
                                aria-labelledby="tableTitle"
                                stickyHeader
                                aria-label="sticky"
                            >
                                <EnhancedTableHead
                                    numSelected={selected.length}
                                    onSelectAllClick={handleSelectAllClick}
                                    rowCount={categories ? categories.length : 0}
                                    edited={edited}
                                />
                                <CategoryEditForm
                                    edited={edited}
                                    type={type}
                                    categories={categories}
                                    selected={selected}
                                    setSelected={setSelected}
                                    added={added}
                                    setAdded={setAdded}
                                    setEdited={setEdited}
                                    isSaving={isSaving}
                                    setIsSaving={setIsSaving}
                                    onChanged={() => setHasChanged(true)}
                                />
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
                {/* 右側コンテンツ */}
                <Box>
                    <AddCategoryForm
                        type={type}
                        open={isMobileDrawerOpen}
                        onClose={handleCloseMobileDrawer}
                        setIsMobileDrawerOpen={setIsMobileDrawerOpen}
                        setAdded={setAdded}
                    ></AddCategoryForm>
                </Box>
            </Box>

            {/* キャンセル確認ダイアログ */}
            <Dialog open={cancelDialogOpen} onClose={handleCancelClose}>
                <DialogTitle>変更を破棄しますか？</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        並び替えの変更は保存されません。編集をキャンセルしますか？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelClose}>編集を続ける</Button>
                    <Button onClick={handleCancelConfirm} color="error" variant="contained">
                        破棄する
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 編集中タブ切り替え確認ダイアログ */}
            <Dialog open={switchDialogOpen} onClose={handleSwitchCancel}>
                <DialogTitle>編集を破棄しますか？</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        編集中の変更は保存されません。
                        {pendingType === "income" ? "収入" : "支出"}に切り替えますか？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSwitchCancel}>キャンセル</Button>
                    <Button onClick={handleSwitchConfirm} color="error" variant="contained">
                        切り替える
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Category;
