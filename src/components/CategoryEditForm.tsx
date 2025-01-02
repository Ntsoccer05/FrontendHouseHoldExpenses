import * as React from "react";
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
import { useState } from "react";
import DynamicIcon from "./common/DynamicIcon";
import { expenseMuiIcons, incomeMuiIcons } from "../config/CategoryIcon";
import { useCategoryContext } from "../context/CategoryContext";
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandleIcon from "@mui/icons-material/DragHandle";

interface CategoryEditProps {
    edited: boolean;
    type: "income" | "expense";
    categories: CategoryItem[] | undefined;
    selected: readonly number[];
    swichedCategory: boolean;
    added: boolean;
    deleted: boolean;
    setSelected: React.Dispatch<React.SetStateAction<readonly number[]>>;
    setCategories: React.Dispatch<
        React.SetStateAction<CategoryItem[] | undefined>
    >;
    setAdded: React.Dispatch<React.SetStateAction<boolean>>;
    setEdited: React.Dispatch<React.SetStateAction<boolean>>;
    setDeleted: React.Dispatch<React.SetStateAction<boolean>>;
}

const SortableItem = ({
    id,
    children,
}: {
    id: number;
    children: React.ReactNode;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
        swichedCategory,
        added,
        deleted,
        setSelected,
        setCategories,
        setAdded,
        setEdited,
        setDeleted,
    }: CategoryEditProps) => {
        // const { editCategory, sortCategory } = useCategoryContext();
        const { editCategory, sortCategories } = useCategoryContext();

        const [initialized, setInitialized] = useState<boolean>(false);

        // Check if the target element is interactive
        const isInteractiveElement = (target: EventTarget | null) => {
            if (target instanceof HTMLElement) {
                const interactiveElements = [
                    "input",
                    "textarea",
                    "select",
                    "button",
                ];
                return interactiveElements.includes(
                    target.tagName.toLowerCase(),
                );
            }
            return false;
        };

        const sensors = useSensors(
            useSensor(MouseSensor, {
                activationConstraint: {
                    distance: 5,
                },
            }),
            useSensor(TouchSensor, {
                activationConstraint: {
                    distance: 10,
                },
            }),
        );

        const handleDragStart = (event: any) => {
            if (event.active && isInteractiveElement(event.active.node)) {
                // Prevent drag start if the target is an interactive element
                event.preventDefault();
            }
        };

        const handleDragEnd = async (event: DragEndEvent) => {
            if (event.active.id !== event.over?.id && categories) {
                const oldIndex = categories.findIndex(
                    (category) => category.filtered_id === event.active.id,
                );
                const newIndex = categories.findIndex(
                    (category) => category.filtered_id === event.over?.id,
                );

                const newCategories = arrayMove(categories, oldIndex, newIndex);

                setContentValues(
                    (prevCategory) =>
                        (prevCategory = newCategories.map(
                            (category) => category.label || "",
                        )),
                );
                setIconValues(
                    (prevCategory) =>
                        (prevCategory = newCategories.map(
                            (category) => category.icon || "",
                        )),
                );
                sortCategories(newCategories, type);
            }
        };

        const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
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

        const [contentValues, setContentValues] = useState<string[]>(
            categories?.map((category) => category.label || "") || [],
        );
        const [iconValues, setIconValues] = useState<string[]>(
            categories?.map((category) => category.icon || "") || [],
        );

        const setCategoryValues = (option: boolean) => {
            if (!categories) {
                return;
            } else if (categories.length === 0) {
                return;
            } else {
                if (categories[0].label !== "") {
                    if (option && initialized) {
                        return;
                    }
                    // カテゴリが取得できたときに初期値を設定
                    setContentValues(
                        (prevCategory) =>
                            (prevCategory = categories.map(
                                (category) => category.label || "",
                            )),
                    );
                    setIconValues(
                        (prevCategory) =>
                            (prevCategory = categories.map(
                                (category) => category.icon || "",
                            )),
                    );
                    option && setInitialized(() => true); // 初期化完了フラグを立てる
                }
            }
        };

        React.useEffect(() => {
            setCategoryValues(true);
        }, [categories, initialized]);

        React.useEffect(() => {
            setCategoryValues(false);
        }, [swichedCategory]);

        React.useEffect(() => {
            if (
                added &&
                categories &&
                categories.length > contentValues.length
            ) {
                setCategoryValues(false);
                setAdded(() => false);
                setEdited(false);
            }
        }, [added, categories]);
        React.useEffect(() => {
            if (
                deleted &&
                categories &&
                contentValues.length > categories.length
            ) {
                setCategoryValues(false);
                setDeleted(false);
            }
        }, [deleted, categories]);

        const handleCategoryChange =
            (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
                if (categories && categories?.length > 0) {
                    const ids = extractIds(event.target.name);
                    if (ids) {
                        const newValues = [...contentValues];
                        newValues[index] = event.target.value;
                        setContentValues(newValues);
                        const id = ids && Number(ids.id);
                        const filtered_id = ids && Number(ids.filtered_id);
                        // const fixed_category_id =
                        //     ids && Number(ids.fixed_category_id);
                        const content = event.target.value;
                        const tgtCategory = categories.filter((category) => {
                            return category.filtered_id === filtered_id;
                        });
                        const icon = tgtCategory[0].icon;
                        const argument = {
                            id,
                            content,
                            icon,
                            type,
                            // fixed_category_id,
                        };
                        editCategory(argument);
                    }
                }
            };

        const handleIconChange =
            (index: number) => (event: SelectChangeEvent<string>) => {
                if (categories && categories?.length > 0) {
                    const ids = extractIds(event.target.name);
                    if (ids) {
                        const newValues = [...iconValues];
                        newValues[index] = event.target.value;
                        setIconValues(newValues);
                        const id = ids && Number(ids.id);
                        const filtered_id = ids && Number(ids.filtered_id);
                        // const fixed_category_id =
                        //     ids && Number(ids.fixed_category_id);
                        const icon = event.target.value;
                        const tgtCategory = categories.filter((category) => {
                            return category.filtered_id === filtered_id;
                        });
                        const content = tgtCategory[0].label;
                        const argument = {
                            id,
                            icon,
                            content,
                            type,
                            // fixed_category_id,
                        };
                        editCategory(argument);
                    }
                }
            };

        const extractIds = (
            str: string,
        ): {
            id: string;
            filtered_id: string;
            // fixed_category_id: string;
        } | null => {
            // const regex = /(\D+)(\d+)(\D+)(\d+)(\D+)(\d+)/;
            const regex = /(\D+)(\d+)(\D+)(\d+)/;
            const matches = str.match(regex);
            if (matches) {
                const id = matches[2];
                const filtered_id = matches[4];
                // const fixed_category_id = matches[6];
                // return { id, filtered_id, fixed_category_id };
                return { id, filtered_id };
            }
            return null;
        };

        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                // autoScroll={false}
            >
                <SortableContext
                    items={
                        categories?.map(
                            (category) => category.filtered_id || 0,
                        ) || []
                    }
                    strategy={verticalListSortingStrategy}
                >
                    <TableBody>
                        {categories?.map((category, index) => {
                            const isItemSelected = isSelected(
                                category.filtered_id || 0,
                            );
                            const labelId = `enhanced-table-checkbox-${index}`;

                            const tableRowContent = (
                                <>
                                    {!edited ? (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isItemSelected}
                                                inputProps={{
                                                    "aria-labelledby": labelId,
                                                }}
                                            />
                                        </TableCell>
                                    ) : (
                                        <TableCell
                                            padding="checkbox"
                                            align="center"
                                        >
                                            <DragHandleIcon />
                                        </TableCell>
                                    )}
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
                                                name={
                                                    "content_" +
                                                    String(category.id) +
                                                    "filteredContent_" +
                                                    String(category.filtered_id)
                                                    // "fixed_category_id_" +
                                                    // String(
                                                    //     category.fixed_category_id ||
                                                    //         0
                                                    // )
                                                }
                                                value={contentValues[index]}
                                                onChange={handleCategoryChange(
                                                    index,
                                                )}
                                                InputProps={{
                                                    style: {
                                                        height: "36px", // TextField自体の高さ
                                                        padding: "0", // パディング調整
                                                    },
                                                }}
                                            />
                                        ) : (
                                            category.label
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {edited ? (
                                            <FormControl fullWidth>
                                                <Select
                                                    value={iconValues[index]}
                                                    name={
                                                        "icon_" +
                                                        String(category.id) +
                                                        "filteredIcon_" +
                                                        String(
                                                            category.filtered_id,
                                                        )
                                                        // "fixed_category_id_" +
                                                        // String(
                                                        //     category.fixed_category_id ||
                                                        //         0
                                                        // )
                                                    }
                                                    onChange={handleIconChange(
                                                        index,
                                                    )}
                                                    style={{ height: "36px" }}
                                                >
                                                    {(type === "expense"
                                                        ? expenseMuiIcons
                                                        : incomeMuiIcons
                                                    ).map(
                                                        (
                                                            categoryIcon,
                                                            index,
                                                        ) => {
                                                            return (
                                                                <MenuItem
                                                                    key={index}
                                                                    value={
                                                                        categoryIcon
                                                                    }
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
                                                            );
                                                        },
                                                    )}
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            <DynamicIcon
                                                iconName={category.icon}
                                                fontSize="medium"
                                            />
                                        )}
                                    </TableCell>
                                </>
                            );

                            return edited ? (
                                <SortableItem
                                    key={category.filtered_id}
                                    id={category.filtered_id || 0}
                                >
                                    {tableRowContent}
                                </SortableItem>
                            ) : (
                                <TableRow
                                    key={index}
                                    hover={!edited}
                                    onClick={(event) => {
                                        if (!edited) {
                                            handleClick(
                                                event,
                                                category.filtered_id || 0,
                                            );
                                        }
                                    }}
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                    selected={isItemSelected}
                                    sx={{
                                        cursor: edited ? "default" : "pointer",
                                        textAlign: "center",
                                    }}
                                >
                                    {tableRowContent}
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
