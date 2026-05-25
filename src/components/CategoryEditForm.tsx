import React, { useRef, useState } from "react";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import {
    FormControl,
    ListItemIcon,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import { CategoryItem } from "../types";
import DynamicIcon from "./common/DynamicIcon";
import { expenseMuiIcons, incomeMuiIcons } from "../config/CategoryIcon";
import { useCategoryContext } from "../context/CategoryContext";
import { useAppContext } from "../context/AppContext";
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

type LocalItem = {
    id: number;
    label: string;
    icon: string;
};

const toLocalItems = (categories: CategoryItem[] | undefined): LocalItem[] =>
    categories?.filter((c) => c.id !== undefined).map((c) => ({
        id: c.id!,
        label: c.label,
        icon: c.icon,
    })) ?? [];


interface CategoryEditProps {
    edited: boolean;
    type: "income" | "expense";
    categories: CategoryItem[] | undefined;
    selected: readonly number[];
    added: boolean;
    isSaving: boolean;
    setSelected: React.Dispatch<React.SetStateAction<readonly number[]>>;
    setAdded: React.Dispatch<React.SetStateAction<boolean>>;
    setEdited: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
    onChanged?: () => void;
}

const SortableRow = ({
    id,
    showLineAbove,
    showLineBelow,
    children,
}: {
    id: number;
    showLineAbove?: boolean;
    showLineBelow?: boolean;
    children: React.ReactNode;
}) => {
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });
    return (
        <TableRow
            ref={setNodeRef}
            {...attributes}
            sx={{
                opacity: isDragging ? 0.3 : 1,
                boxShadow: showLineAbove
                    ? "inset 0 2px 0 0 #1976d2"
                    : showLineBelow
                    ? "inset 0 -2px 0 0 #1976d2"
                    : "none",
            }}
        >
            <TableCell
                padding="checkbox"
                align="center"
                {...listeners}
                sx={{ cursor: "grab" }}
            >
                <DragHandleIcon />
            </TableCell>
            {children}
        </TableRow>
    );
};

const CategoryEditForm = React.memo(
    ({
        edited,
        type,
        categories,
        selected,
        added,
        isSaving,
        setSelected,
        setAdded,
        setEdited,
        setIsSaving,
        onChanged,
    }: CategoryEditProps) => {
        const { batchSaveCategories } = useCategoryContext();
        const { setIsLoading } = useAppContext();

        const [localItems, setLocalItems] = useState<LocalItem[]>([]);
        const [activeId, setActiveId] = useState<number | null>(null);
        const [overId, setOverId] = useState<number | null>(null);
        const originalItemsRef = useRef<LocalItem[]>([]);
        // stale closure 回避: effect 内で最新の localItems/categories を読む
        const localItemsRef = useRef<LocalItem[]>(localItems);
        localItemsRef.current = localItems;
        const categoriesRef = useRef(categories);
        categoriesRef.current = categories;

        const sensors = useSensors(
            useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
            useSensor(TouchSensor, { activationConstraint: { distance: 10 } }),
        );

        // 編集開始時のみ localItems を初期化（編集中の categories 変化は無視）
        React.useEffect(() => {
            if (edited) {
                const items = toLocalItems(categoriesRef.current);
                setLocalItems(items);
                originalItemsRef.current = items;
            }
        }, [edited]);

        // 非編集・非保存時のみ categories → localItems を同期
        // （バグ根本の排除: 編集中に categories が変化しても上書きしない）
        React.useEffect(() => {
            if (!edited && !isSaving) {
                setLocalItems(toLocalItems(categories));
            }
        }, [categories, edited, isSaving]);

        // 編集中にカテゴリが追加された場合、編集モードを終了
        React.useEffect(() => {
            if (added) {
                if (edited) setEdited(false);
                setAdded(false);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [added]);

        // 保存: isSaving が true になったとき一括送信
        React.useEffect(() => {
            if (!isSaving) return;
            const save = async () => {
                setIsLoading(true);
                try {
                    const items = localItemsRef.current;
                    const categories = items.map((item, index) => ({
                        id: item.id,
                        label: item.label,
                        icon: item.icon,
                        filtered_id: index + 1,
                    }));
                    await batchSaveCategories(categories, type);
                } finally {
                    setIsLoading(false);
                    setIsSaving(false);
                }
            };
            save();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isSaving]);

        const handleDragStart = (event: DragStartEvent) => {
            setActiveId(event.active.id as number);
        };

        const handleDragOver = (event: DragOverEvent) => {
            setOverId((event.over?.id as number) ?? null);
        };

        const handleDragCancel = () => {
            setActiveId(null);
            setOverId(null);
        };

        const handleDragEnd = (event: DragEndEvent) => {
            setActiveId(null);
            setOverId(null);
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            let moved = false;
            setLocalItems((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === Number(active.id));
                const newIndex = prev.findIndex((item) => item.id === Number(over.id));
                if (oldIndex === -1 || newIndex === -1) return prev;
                moved = true;
                return arrayMove(prev, oldIndex, newIndex);
            });
            if (moved) onChanged?.();
        };

        const handleLabelChange = (index: number, value: string) => {
            setLocalItems((prev) =>
                prev.map((item, i) =>
                    i === index ? { ...item, label: value } : item,
                ),
            );
            onChanged?.();
        };

        const handleIconChange = (index: number, value: string) => {
            setLocalItems((prev) =>
                prev.map((item, i) =>
                    i === index ? { ...item, icon: value } : item,
                ),
            );
            onChanged?.();
        };

        const handleClick = (
            _event: React.MouseEvent<unknown>,
            id: number,
        ) => {
            const selectedIndex = selected.indexOf(id);
            let newSelected: readonly number[] = [];
            if (selectedIndex === -1) {
                newSelected = newSelected.concat(selected, id);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(selected.slice(1));
            } else if (selectedIndex === selected.length - 1) {
                newSelected = newSelected.concat(selected.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(
                    selected.slice(0, selectedIndex),
                    selected.slice(selectedIndex + 1),
                );
            }
            setSelected(newSelected);
        };

        const isSelected = (id: number) => selected.indexOf(id) !== -1;

        const activeIndex = localItems.findIndex((item) => item.id === activeId);

        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                modifiers={[restrictToVerticalAxis]}
                accessibility={{ container: document.body }}
            >
                <SortableContext
                    items={localItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <TableBody>
                        {localItems.map((item, index) => {
                            const isItemSelected = isSelected(item.id);
                            const labelId = `enhanced-table-checkbox-${index}`;
                            const isOver = overId === item.id && activeId !== null;
                            const showLineAbove = isOver && activeIndex !== -1 && activeIndex > index;
                            const showLineBelow = isOver && activeIndex !== -1 && activeIndex < index;

                            const dataCells = (
                                <>
                                    <TableCell
                                        component="th"
                                        id={labelId}
                                        scope="row"
                                        padding="none"
                                        align="center"
                                    >
                                        {edited ? (
                                            <TextField
                                                required
                                                value={item.label}
                                                onChange={(e) =>
                                                    handleLabelChange(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                InputProps={{
                                                    style: {
                                                        height: "36px",
                                                        padding: "0",
                                                    },
                                                }}
                                            />
                                        ) : (
                                            item.label
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {edited ? (
                                            <FormControl fullWidth>
                                                <Select
                                                    value={item.icon}
                                                    onChange={(
                                                        e: SelectChangeEvent<string>,
                                                    ) =>
                                                        handleIconChange(
                                                            index,
                                                            e.target.value,
                                                        )
                                                    }
                                                    style={{ height: "36px" }}
                                                >
                                                    {(type === "expense"
                                                        ? expenseMuiIcons
                                                        : incomeMuiIcons
                                                    ).map(
                                                        (categoryIcon) => (
                                                            <MenuItem
                                                                key={categoryIcon}
                                                                value={categoryIcon}
                                                            >
                                                                <ListItemIcon>
                                                                    <DynamicIcon
                                                                        iconName={
                                                                            categoryIcon
                                                                        }
                                                                        fontSize="medium"
                                                                    />
                                                                </ListItemIcon>
                                                            </MenuItem>
                                                        ),
                                                    )}
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            <DynamicIcon
                                                iconName={item.icon}
                                                fontSize="medium"
                                            />
                                        )}
                                    </TableCell>
                                </>
                            );

                            if (edited) {
                                return (
                                    <SortableRow
                                        key={item.id}
                                        id={item.id}
                                        showLineAbove={showLineAbove}
                                        showLineBelow={showLineBelow}
                                    >
                                        {dataCells}
                                    </SortableRow>
                                );
                            }

                            return (
                                <TableRow
                                    key={item.id}
                                    hover
                                    onClick={(event) =>
                                        handleClick(event, item.id)
                                    }
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                    selected={isItemSelected}
                                    sx={{
                                        cursor: "pointer",
                                        textAlign: "center",
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={isItemSelected}
                                            inputProps={{
                                                "aria-labelledby": labelId,
                                            }}
                                        />
                                    </TableCell>
                                    {dataCells}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </SortableContext>
            </DndContext>
        );
    },
);

export default CategoryEditForm;
