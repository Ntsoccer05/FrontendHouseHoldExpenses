// components/DraggablePaper.tsx
import React from "react";
import Draggable from "react-draggable";
import Paper from "@mui/material/Paper";

type DraggablePaperProps = {
    children?: React.ReactNode;
};

const DraggablePaper = (props: DraggablePaperProps) => {
    return (
        <Draggable
            handle="#draggable-dialog-title" // このIDの要素だけがドラッグ可能
            cancel={'[class*="MuiDialogContent-root"]'} // 内容部分ではドラッグをキャンセル
        >
            <Paper {...props} />
        </Draggable>
    );
};

export default DraggablePaper;
