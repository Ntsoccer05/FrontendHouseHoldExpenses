import { useCallback, useEffect, useState } from "react";
import Presenter, { CheckedState } from "./presenter";
import { CheckBoxItem } from "../types";

type Props = {
    label: string;
    checkBoxItems: CheckBoxItem[];
    setCheckBoxItems: React.Dispatch<React.SetStateAction<CheckBoxItem[]>>;
};

const judgeCheckBoxListState = (items: CheckBoxItem[]): CheckedState => {
    const allChecked = items.every((item) => item.checked && !item.disabled);
    const allUnchecked = items.every((item) => !item.checked || item.disabled);
    if (allChecked) return "checked";
    if (allUnchecked) return "unchecked";
    return "indeterminate";
};
const judgeCheckBoxListStateFromIndeterminate = (
    items: CheckBoxItem[]
): "checked" | "unchecked" => {
    if (items.filter((item) => !item.disabled).every((item) => item.checked))
        return "unchecked";
    return "checked";
};

export const CheckBoxList = ({
    label,
    checkBoxItems,
    setCheckBoxItems,
}: Props) => {
    const [checkedState, setCheckedState] = useState<CheckedState>(
        judgeCheckBoxListState(checkBoxItems)
    );

    useEffect(() => {
        setCheckedState(judgeCheckBoxListState(checkBoxItems));
    }, [checkBoxItems]);

    const checkAllCheckBoxes = useCallback(
        (checked: boolean) => {
            setCheckBoxItems((currentItems) =>
                currentItems.map((item) => ({ ...item, checked }))
            );
            checkBoxItems
                .filter((item) => !item.disabled && item.checked === !checked)
                .forEach((item) => item.onStateChange(item.checked, item.key));
        },

        [setCheckBoxItems, checkBoxItems]
    );

    const onListValueChange = useCallback(() => {
        if (checkedState === "checked") {
            checkAllCheckBoxes(false);
            return;
        }
        if (checkedState === "unchecked") {
            checkAllCheckBoxes(true);
            return;
        }
        if (
            judgeCheckBoxListStateFromIndeterminate(checkBoxItems) === "checked"
        ) {
            checkAllCheckBoxes(true);
            return;
        }
        if (
            judgeCheckBoxListStateFromIndeterminate(checkBoxItems) ===
            "unchecked"
        ) {
            checkAllCheckBoxes(false);
            return;
        }
    }, [checkedState, checkBoxItems, checkAllCheckBoxes]);

    const onValueChange = useCallback(
        (index: number, checked: boolean) => {
            setCheckBoxItems((currentItems) => {
                const copiedItems = [...currentItems];
                copiedItems[index].checked = !checked;
                return copiedItems;
            });
        },
        [setCheckBoxItems]
    );

    return (
        <Presenter
            label={label}
            checkedState={checkedState}
            items={checkBoxItems}
            onListValueChange={onListValueChange}
            onValueChange={onValueChange}
            isDisabled={checkBoxItems.length === 0}
        />
    );
};
