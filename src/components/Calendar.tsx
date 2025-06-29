import FullCalendar from "@fullcalendar/react";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import jaLocale from "@fullcalendar/core/locales/ja";
import {
    DatesSetArg,
    DayCellContentArg,
    EventContentArg,
} from "@fullcalendar/core";
import { calculateDailyBalances } from "../utils/financeCalculations";
import { formatCurrency } from "../utils/formatting";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { Box, useTheme } from "@mui/material";
import {
    isSameMonth,
    startOfMonth,
    endOfMonth,
    format,
    subMonths,
    addMonths,
} from "date-fns";
import { useAppContext } from "../context/AppContext";
import * as holiday_jp from "@holiday-jp/holiday_jp";
import { useTransactionContext } from "../context/TransactionContext";

interface Holiday {
    date: Date;
    name: string;
    name_en: string;
    week: string;
    week_en: string;
}
interface HolidayEvent {
    start: string;
    title: string;
    display: string;
    backgroundColor: string;
}

interface CalendarProps {
    setCurrentDay: React.Dispatch<React.SetStateAction<string>>;
    currentDay: string;
    today: string;
    onDateClick: (dateInfo: DateClickArg) => void;
    calendarRef: React.RefObject<FullCalendar>;
}
const Calendar = memo(
    ({
        setCurrentDay,
        currentDay,
        today,
        onDateClick,
        calendarRef,
    }: CalendarProps) => {
        const { getMonthlyTransactions, monthlyTransactions } =
            useTransactionContext();
        const { setCurrentMonth, currentMonth, isMobile } = useAppContext();
        const theme = useTheme();

        const swipeWrapperRef = useRef<HTMLDivElement>(null);
        const [isSwiping, setIsSwiping] = useState(false);

        // 状態をまとめて管理
        const [calendarState, setCalendarState] = useState({
            holidays: [] as Holiday[],
            holidayEvents: [] as HolidayEvent[],
        });

        // 非同期処理でデータを取得
        const fetchMonthlyTransactions = useCallback(
            async (date: Date) => {
                const formattedDate = format(date, "yyyyMM");
                await getMonthlyTransactions(formattedDate);
            },
            [getMonthlyTransactions]
        );

        // `currentMonth`が変わったときだけデータ取得
        useEffect(() => {
            fetchMonthlyTransactions(currentMonth);
        }, [currentMonth, fetchMonthlyTransactions]);

        // 各日付の収支をメモ化
        const dailyBalances = useMemo(
            () => calculateDailyBalances(monthlyTransactions),
            [monthlyTransactions]
        );

        // FullCalendar用イベントをメモ化
        const calendarEvents = useMemo(
            () =>
                Object.keys(dailyBalances).map((date) => {
                    const { income, expense, balance } = dailyBalances[date];
                    return {
                        start: date,
                        income: formatCurrency(income),
                        expense: formatCurrency(expense),
                        balance: formatCurrency(balance),
                    };
                }),
            [dailyBalances]
        );

        // 祝日イベントを生成する関数
        const backgroundHoliday = useCallback((): HolidayEvent[] => {
            if (!calendarRef?.current) return [];
        
            const api = calendarRef.current.getApi();
            const viewDate = api.getDate();
        
            return calendarState.holidays
            .filter((holiday) => {
                    const holidayDate = new Date(holiday.date);
                    
                    // 非表示にする条件：
                    // 1. 表示されている月以外の祝日
                    // 2. 祝日が日曜日の場合
                    const isNonCurrentMonth =
                        holidayDate.getFullYear() !== viewDate.getFullYear() ||
                        holidayDate.getMonth() !== viewDate.getMonth();
                    const isSunday = holidayDate.getDay() === 0;
        
                    return !isNonCurrentMonth && !isSunday;
                })
                .map((holiday) => ({
                    start: format(holiday.date, "yyyy-MM-dd"),
                    title: holiday.name,
                    display: "background",
                    backgroundColor: theme.palette.holidayColor.main,
                }));
        }, [calendarState.holidays, theme, calendarRef]);

        useEffect(() => {
            setCalendarState((prevState) => ({
                ...prevState,
                holidayEvents: backgroundHoliday(),
            }));
        }, [backgroundHoliday]);

        // 日付変更時の処理を最適化
        const handleDateSet = useCallback(
            (datesetInfo: DatesSetArg) => {
                const currentMonth = datesetInfo.view.currentStart;
                setCurrentMonth(currentMonth);
                const thisHolidays = holiday_jp.between(
                    startOfMonth(subMonths(currentMonth, 1)),
                    endOfMonth(addMonths(currentMonth, 1))
                );

                setCalendarState((prevState) => ({
                    ...prevState,
                    holidays: thisHolidays,
                }));
                if (isSameMonth(new Date(), currentMonth)) {
                    setCurrentDay(today);
                }
            },
            [setCurrentMonth, setCurrentDay, today]
        );

        // 日セルのクラス名を最適化
        const handleDayCellClassNames = useCallback(
            (arg: DayCellContentArg): string[] => {
                const cellDate = arg.date;
                if (calendarRef && calendarRef.current) {
                    const api = calendarRef.current.getApi();
                    const viewDate = api.getDate();
                    if (
                        cellDate.getFullYear() !== viewDate.getFullYear() ||
                        cellDate.getMonth() !== viewDate.getMonth()
                    ) {
                        return ["non-current-month"];
                    }
                }
                return [];
            },
            [calendarRef]
        );

        const animateCalendarSwipe = (direction: "prev" | "next") => {
            if (isSwiping) return;
            const wrapper = swipeWrapperRef.current?.children[0]?.children[1] as HTMLElement;
            if (!wrapper) return;
            setIsSwiping(true);
            wrapper.style.transition = "transform 0.3s ease-in-out";
            wrapper.style.transform = direction === "next" ? "translateX(-100%)" : "translateX(100%)";

            setTimeout(() => {
                if (calendarRef.current) {
                const api = calendarRef.current.getApi();
                direction === "next" ? api.next() : api.prev();
                }

                wrapper.style.transition = "none";
                wrapper.style.transform = "translateX(0)";
                setIsSwiping(false);
            }, 200);
        };

        useEffect(() => {
            const calendarElement = (calendarRef.current as any)?.elRef?.current as HTMLElement;
            if (!calendarElement) return;

            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;

            const thresholdX = 50;
            const thresholdY = 30;

            const handleTouchStart = (e: TouchEvent) => {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
            };

            const handleTouchMove = (e: TouchEvent) => {
                const touch = e.touches[0];
                touchEndX = touch.clientX;
                touchEndY = touch.clientY;
            };

            const handleTouchEnd = () => {
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;

                if (Math.abs(diffY) > thresholdY || Math.abs(diffX) < thresholdX) return;

                if (diffX > 0) {
                animateCalendarSwipe("prev");
                } else {
                animateCalendarSwipe("next");
                }
            };

            calendarElement.addEventListener("touchstart", handleTouchStart, { passive: true });
            calendarElement.addEventListener("touchmove", handleTouchMove, { passive: true });
            calendarElement.addEventListener("touchend", handleTouchEnd, { passive: true });

            return () => {
                calendarElement.removeEventListener("touchstart", handleTouchStart);
                calendarElement.removeEventListener("touchmove", handleTouchMove);
                calendarElement.removeEventListener("touchend", handleTouchEnd);
            };
        }, [calendarRef]);

        // イベントレンダリング関数
        const renderEventContent = useCallback(
            (eventInfo: EventContentArg) => (
                <div className="custom-event" style={{fontSize: isMobile ? "11px" : "auto"}}>
                    <div
                        className="money custom-event-content"
                        id="event-income"
                    >
                        {eventInfo.event.extendedProps.income}
                    </div>
                    <div
                        className="money custom-event-content"
                        id="event-expense"
                    >
                        {eventInfo.event.extendedProps.expense}
                    </div>
                    <div
                        className="money custom-event-content"
                        id="event-balance"
                    >
                        {eventInfo.event.extendedProps.balance}
                    </div>
                </div>
            ),
            []
        );

        return (
            <Box
                ref={swipeWrapperRef}
                sx={{
                    "& .fc-header-toolbar": {
                    paddingLeft: isMobile ? "16px" : "auto",
                    paddingRight: isMobile ? "16px" : "auto",
                    },
                }}
            >
                <FullCalendar
                    ref={calendarRef}
                    locale={jaLocale}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={[
                        ...calendarEvents,
                        ...calendarState.holidayEvents,
                        {
                            start: currentDay,
                            display: "background",
                            backgroundColor: theme.palette.incomeColor.light,
                        },
                    ]}
                    eventContent={renderEventContent}
                    dayCellClassNames={handleDayCellClassNames}
                    datesSet={handleDateSet}
                    dateClick={onDateClick}
                    buttonText={{ today: "今月" }}
                    fixedWeekCount={false}
                />
            </Box>
        );
    }
);

export default Calendar;
