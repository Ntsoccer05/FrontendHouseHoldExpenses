import { CheckBoxList } from "./CheckBoxList";
import { useState } from "react";
import {
    Divider,
    Grid,
    IconButton,
    InputBase,
    Paper,
    Popover,
} from "@mui/material";
import { CheckBoxItem } from "../types";
import SearchIcon from "@mui/icons-material/Search";
import { useAppContext } from "../context/AppContext";

type Props = {
    searchPlaceholder: string;
    checkBoxListLabel: string;
    initialItems: CheckBoxItem[];
    items: CheckBoxItem[];
    setItems: React.Dispatch<React.SetStateAction<CheckBoxItem[]>>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    onPopoverClose: () => void;
    anchorEl: Element | null;
};

const filterItems = (
    items: CheckBoxItem[],
    filterText: string
): CheckBoxItem[] => {
    if (filterText == "") return items;
    return items.filter((item) => item.label.includes(filterText));
};

export const PopoverContent = ({
    searchPlaceholder,
    checkBoxListLabel,
    initialItems,
    items,
    setItems,
    setPage,
    onPopoverClose,
    anchorEl,
}: Props) => {
    const [text, setText] = useState("");
    const {isMobile} = useAppContext();

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onPopoverClose}
            sx={{ top: "50px", left: isMobile ? "0px" :"120px" }}
        >
            <Grid container direction="column" sx={{ width: isMobile ? "100%" : "250px" }}>
                {/* 検索ボックス */}
                <Paper
                    className="searchText"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        padding: "4px 8px",
                    }}
                >
                    <InputBase
                        placeholder={searchPlaceholder}
                        value={text}
                        onChange={(e) => {
                            setPage(0);
                            setText(e.target.value);
                            setItems(filterItems(initialItems, e.target.value));
                        }}
                        sx={{ flex: 1 }}
                    />
                    <IconButton sx={{ padding: "4px" }}>
                        <SearchIcon />
                    </IconButton>
                </Paper>
                <Divider sx={{ marginY: 1 }} />
                <Paper
                    sx={{
                        maxHeight: "200px",
                        overflow: "auto",
                        padding: "8px",
                    }}
                >
                    <CheckBoxList
                        label={checkBoxListLabel}
                        checkBoxItems={items}
                        setCheckBoxItems={
                            setItems as React.Dispatch<
                                React.SetStateAction<CheckBoxItem[]>
                            >
                        }
                        setPage={setPage}
                    />
                </Paper>
            </Grid>
        </Popover>
    );
};
