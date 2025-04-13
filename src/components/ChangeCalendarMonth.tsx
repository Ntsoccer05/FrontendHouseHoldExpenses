import { Box } from "@mui/material";
import { memo, useCallback, useMemo } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { ja } from "date-fns/locale";
import { startOfMonth } from "date-fns";
import { useAppContext } from "../context/AppContext";
import FullCalendar from "@fullcalendar/react";

interface ChangeCalendarMonthProps {
    calendarRef: FullCalendar;
}

const ChangeCalendarMonth = memo(
    ({ calendarRef }: ChangeCalendarMonthProps) => {
        const { currentMonth, setCurrentMonth, isMobile } = useAppContext();

        // モーダルを閉じる関数をメモ化
        const closeModal = useCallback(
            (newMonth: Date | null) => {
                if (!newMonth) return; // 無効な日付は無視

                setCurrentMonth((prevDate) => {
                    if (prevDate.getTime() !== newMonth.getTime()) {
                        if (calendarRef) {
                            const calendarApi = calendarRef.getApi();
                            // 指定した月に移動
                            calendarApi.gotoDate(startOfMonth(newMonth));
                        }
                    }
                    // currentMonth を更新
                    return newMonth;
                });
            },
            [calendarRef, setCurrentMonth]
        );

        // スタイルをメモ化
        const myStyle = useMemo(
            () => ({
                "& .MuiInputBase-root": {
                    border: "none",
                },
                "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                        border: "none",
                    },
                },
                "& .MuiInput-underline:before": {
                    borderBottom: "none",
                },
                "& .MuiInput-underline:hover:before": {
                    borderBottom: "none",
                },
                "& .MuiInput-underline:after": {
                    borderBottom: "none",
                },
            }),
            []
        );

        const mobileDatePickerStyles = useMemo(
            () => ({
                mx: 2,
                position: "absolute",
                top: { xs: "183px", sm: "202px", md: "205px" },
                left: { xs: "0%", md: "235px" },
                cursor: "pointer",
                "& .MuiInputLabel-root": {
                    color: "rgba(0, 0, 0, 0.6)!important"
                },
                "& .MuiInputBase-root": {
                    color: "transparent",
                    border: "none",
                },
                "& .MuiOutlinedInput-root": {
                    maxHeight: isMobile ? "35px" : "auto",
                    "& fieldset": {
                        border: "none",
                        width: "65%",
                        cursor: "pointer",
                    },
                    "& input": {
                        border: "none",
                        width: isMobile ? "40%" : "62%",
                        opacity: 0,
                        zIndex: 1000,
                        cursor: "pointer",
                    },
                    cursor: "pointer",
                },
                "& .MuiPickersArrowSwitcher-root": {
                    visibility: "visible", // 矢印を表示
                    opacity: 1, // 不透明度を確保
                },
            }),
            []
        );

        return (
            <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ja}
                dateFormats={{ monthAndYear: "yyyy年 MM月" }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "left",
                    }}
                >
                    <MobileDatePicker
                        value={currentMonth}
                        // Open状態は自動制御
                        label="年月を選択"
                        // 初期表示を月に変更
                        openTo="month"
                        onMonthChange={closeModal}
                        onAccept={(date) => {
                            if (date) closeModal(date);
                        }}
                        sx={mobileDatePickerStyles}
                        views={["year", "month"]}
                        format="yyyy年MM月"
                        slotProps={{
                            toolbar: {
                                toolbarFormat: "yyyy年 M月",
                                hidden: true,
                            },
                            calendarHeader: {
                                format: "yyyy年 M月",
                            },
                            nextIconButton: true,
                            previousIconButton: true,
                        }}
                    />
                </Box>
            </LocalizationProvider>
        );
    }
);

export default ChangeCalendarMonth;
