import { Box, FormControlLabel, Checkbox } from "@mui/material";

type Props = {
    label: string;
    checked: boolean;
    onValueChange: (checked: boolean) => void;
    disabled?: boolean;
    indeterminate?: boolean;
};

export const CheckBox: React.FC<Props> = ({
    label,
    checked,
    onValueChange,
    disabled = false,
    indeterminate = false,
}) => {
    return (
        <Box>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={disabled ? false : checked}
                        onClick={() => onValueChange(checked)}
                        disableRipple
                        disabled={disabled}
                        indeterminate={disabled ? false : indeterminate}
                    />
                }
                label={label}
                sx={{ marginBottom: "4px" }}
            />
        </Box>
    );
};
