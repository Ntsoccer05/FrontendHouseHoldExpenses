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
import { Button, ButtonGroup } from "@mui/material";
import { Stack } from "@mui/material";
import { CategoryItem, TransactionType } from "../types";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import CategoryEditForm from "../components/CategoryEditForm";
import AddIcon from "@mui/icons-material/Add";
import AddCategoryForm from "../components/AddCategoryForm";
import { useCategoryContext } from "../context/CategoryContext";

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
    const [deleted, setDeleted] = useState(false);

    const numSelected = selected.length;
    const [edited, setEdited] = useState<boolean>(false);
    const [type, setType] = useState<TransactionType>("expense");

    const onUpdateCategories = () => {
        setEdited(!edited);
    };

    const handleSelectAllClick = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (!edited) {
            if (event.target.checked) {
                const newSelected =
                    categories && categories.map((n) => n.filtered_id);
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
    const [swichedCategory, setSwichedCategory] = useState<boolean>(false);

    const [initialized, setInitialized] = useState<boolean>(false);

    // モバイル用Drawerを閉じる処理
    const handleCloseMobileDrawer = () => {
        setIsMobileDrawerOpen(false);
    };

    useEffect(() => {
        if (ExpenseCategories && !initialized) {
            if (ExpenseCategories.length > 0) {
                setCategories(ExpenseCategories);
                setInitialized((prevState) => (prevState = true));
            }
        }
    }, [ExpenseCategories]);
    useEffect(() => {
        if (type === "expense") {
            setCategories(ExpenseCategories);
        } else {
            setCategories(IncomeCategories);
        }
    }, [ExpenseCategories, IncomeCategories]);

    // 収支タイプを切り替える関数
    const incomeExpenseToggle = (type: IncomeExpense) => {
        setSwichedCategory(false);
        // formのvalueに値をセット
        setType(type);
        //セレクトボックスクリア
        setSelected([]);
        const newCategories =
            type === "expense" ? ExpenseCategories : IncomeCategories;
        setCategories(newCategories);
        edited && setEdited(false);
    };

    //収支タイプに応じたカテゴリを取得
    useEffect(() => {
        setSwichedCategory(true);
    }, [type]);

    //削除処理
    const onDeleteCategories = () => {
        if (selected.length > 0) {
            const tgtCategories = categories?.filter((category, index) => {
                return selected.includes(category.filtered_id as number);
            }) as CategoryItem[];
            deleteCategories(tgtCategories, type);
            setSelected([]);
            setDeleted(true);
        }
    };

    const openAddCategoryForm = () => {
        isMobile && setIsMobileDrawerOpen(true);
    };

    return (
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
                        {isMobile && (
                            <Tooltip title="追加">
                                <IconButton onClick={openAddCategoryForm}>
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        {numSelected > 0 ? (
                            <Tooltip title="削除">
                                <IconButton onClick={onDeleteCategories}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title={edited ? "保存" : "編集"}>
                                <IconButton onClick={onUpdateCategories}>
                                    {edited ? <SaveIcon /> : <EditIcon />}
                                </IconButton>
                            </Tooltip>
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
                                swichedCategory={swichedCategory}
                                setSelected={setSelected}
                                setCategories={setCategories}
                                added={added}
                                deleted={deleted}
                                setAdded={setAdded}
                                setEdited={setEdited}
                                setDeleted={setDeleted}
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
    );
}

export default Category;
