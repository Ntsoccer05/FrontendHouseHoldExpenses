import { Box } from "@mui/material";
import { CheckBox } from "./CheckBox";
import { CheckBoxItem } from "../types";

export type CheckedState = "checked" | "indeterminate" | "unchecked";

type Props = {
    label: string;
    checkedState: CheckedState;
    items: CheckBoxItem[];
    onListValueChange: () => void;
    onValueChange: (index: number, checked: boolean) => void;
    isDisabled: boolean;
};

const CheckBoxList = ({
    label,
    checkedState,
    items,
    onListValueChange,
    onValueChange,
    isDisabled,
}: Props) => {
    return (
        <>
            <Box sx={{ paddingBottom: "8px" }}>
                <CheckBox
                    disabled={isDisabled}
                    checked={checkedState === "checked"}
                    onValueChange={() => onListValueChange()}
                    label={label}
                    indeterminate={checkedState === "indeterminate"}
                />
            </Box>
            <Box>
                {items.map((item, index) => (
                    <CheckBox
                        key={`${item.key}${index}`}
                        checked={item.checked}
                        onValueChange={(checked) => {
                            onValueChange(index, checked);
                            item.onStateChange(checked, item.key);
                        }}
                        label={item.label}
                        disabled={item.disabled}
                    />
                ))}
            </Box>
        </>
    );
};

export default CheckBoxList;
