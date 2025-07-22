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
        const [isLoading, setIsLoading] = useState(false);
        const [currentMonthData, setCurrentMonthData] = useState<string>('');
        const touchStartRef = useRef({ x: 0, y: 0 });
        const touchEndRef = useRef({ x: 0, y: 0 });
        const mouseStartRef = useRef({ x: 0, y: 0 });
        const mouseEndRef = useRef({ x: 0, y: 0 });
        const [isMouseDown, setIsMouseDown] = useState(false);
        // 日付クリック判定用のフラグを追加
        const isDateClickingRef = useRef(false);
        const swipeStartTimeRef = useRef(0);
        const hasMovedRef = useRef(false);

        // 状態をまとめて管理
        const [calendarState, setCalendarState] = useState({
            holidays: [] as Holiday[],
            holidayEvents: [] as HolidayEvent[],
        });

        // 非同期処理でデータを取得
        const fetchMonthlyTransactions = useCallback(
            async (date: Date) => {
                const formattedDate = format(date, "yyyyMM");
                
                // 既に同じ月のデータを読み込み中または読み込み済みの場合はスキップ
                if (currentMonthData === formattedDate) return;
                
                setIsLoading(true);
                setCurrentMonthData(formattedDate);
                
                try {
                    await getMonthlyTransactions(formattedDate);
                } catch (error) {
                    console.error('Failed to fetch monthly transactions:', error);
                } finally {
                    // データ読み込み完了後に少し遅延を入れてローディングを解除
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 50); // 遅延を短く
                }
            },
            [getMonthlyTransactions, currentMonthData]
        );

        // 初期表示時の処理を改善
        useEffect(() => {
            if (currentMonth) {
                fetchMonthlyTransactions(currentMonth);
            }
        }, [currentMonth, fetchMonthlyTransactions]);

        // 各日付の収支をメモ化（ローディング中は空の配列を返す）
        const dailyBalances = useMemo(() => {
            if (isLoading) return {};
            return calculateDailyBalances(monthlyTransactions);
        }, [monthlyTransactions, isLoading]);

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
                const newMonth = datesetInfo.view.currentStart;
                const newFormattedDate = format(newMonth, "yyyyMM");
                
                // 現在表示中の月と異なる場合のみ更新
                if (currentMonthData !== newFormattedDate) {
                    setCurrentMonth(newMonth);
                }
                
                const thisHolidays = holiday_jp.between(
                    startOfMonth(subMonths(newMonth, 1)),
                    endOfMonth(addMonths(newMonth, 1))
                );

                setCalendarState((prevState) => ({
                    ...prevState,
                    holidays: thisHolidays,
                }));
                
                if (isSameMonth(new Date(), newMonth)) {
                    setCurrentDay(today);
                }
            },
            [setCurrentMonth, setCurrentDay, today, currentMonthData]
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

        const animateCalendarSwipe = useCallback((direction: "prev" | "next") => {
            if (isSwiping || isLoading) return;
            
            const wrapper = swipeWrapperRef.current?.querySelector('.fc-daygrid-body') as HTMLElement;
            if (!wrapper || !calendarRef.current) return;
            
            setIsSwiping(true);
            
            // アニメーション開始
            wrapper.style.transition = "transform 0.3s ease-in-out";
            wrapper.style.transform = direction === "next" ? "translateX(-100%)" : "translateX(100%)";
            
            // カレンダーAPI呼び出しを少し遅らせる
            setTimeout(() => {
                if (calendarRef.current) {
                    const api = calendarRef.current.getApi();
                    direction === "next" ? api.next() : api.prev();
                }
            }, 150);

            // アニメーション完了後のリセット
            setTimeout(() => {
                if (wrapper) {
                    wrapper.style.transition = "none";
                    wrapper.style.transform = "translateX(0)";
                }
                setIsSwiping(false);
            }, 300);
        }, [calendarRef, isSwiping, isLoading]);

        // 日付クリックイベントをラップして、スワイプを無効化
        const handleDateClick = useCallback((dateInfo: DateClickArg) => {
            isDateClickingRef.current = true;
            onDateClick(dateInfo);
            
            // 長めの遅延でフラグをリセット（ダブルクリック対応）
            setTimeout(() => {
                isDateClickingRef.current = false;
            }, 500);
        }, [onDateClick]);

        // 日付セルがクリック可能な要素かチェックする関数
        const isDateCellElement = (element: Element): boolean => {
            // 日付セル関連の要素をチェック
            return (
                element.classList.contains('fc-daygrid-day-number') ||
                element.classList.contains('custom-event') ||
                element.classList.contains('custom-event-content') ||
                element.classList.contains('money') ||
                element.closest('.fc-daygrid-day-frame') !== null ||
                element.closest('.fc-daygrid-day') !== null
            );
        };

        // タッチイベントの処理
        useEffect(() => {
            const calendarElement = calendarRef.current?.elRef?.current as HTMLElement;
            if (!calendarElement) return;

            const thresholdX = 80;
            const thresholdY = 50;

            const handleTouchStart = (e: TouchEvent) => {
                if (isSwiping || isLoading || isDateClickingRef.current) return;
                
                const target = e.target as Element;
                const touch = e.touches[0];
                
                swipeStartTimeRef.current = Date.now();
                hasMovedRef.current = false;
                
                // 日付セル内の要素の場合、短時間のタッチのみスワイプを許可
                if (isDateCellElement(target)) {
                    touchStartRef.current = {
                        x: touch.clientX,
                        y: touch.clientY
                    };
                    return;
                }
                
                touchStartRef.current = {
                    x: touch.clientX,
                    y: touch.clientY
                };
            };

            const handleTouchMove = (e: TouchEvent) => {
                if (isSwiping || isLoading || isDateClickingRef.current) return;
                
                hasMovedRef.current = true;
                const touch = e.touches[0];
                touchEndRef.current = {
                    x: touch.clientX,
                    y: touch.clientY
                };
            };

            const handleTouchEnd = () => {
                if (isSwiping || isLoading || isDateClickingRef.current) return;
                
                const touchDuration = Date.now() - swipeStartTimeRef.current;
                
                // タッチ時間が短すぎる場合（クリック操作）はスワイプしない
                if (touchDuration < 100 || !hasMovedRef.current) return;
                
                const diffX = touchEndRef.current.x - touchStartRef.current.x;
                const diffY = touchEndRef.current.y - touchStartRef.current.y;

                if (Math.abs(diffY) > thresholdY) return;
                if (Math.abs(diffX) < thresholdX) return;

                // スワイプ実行前に少し待機してクリックイベントとの競合を避ける
                setTimeout(() => {
                    if (!isDateClickingRef.current) {
                        if (diffX > 0) {
                            animateCalendarSwipe("prev");
                        } else {
                            animateCalendarSwipe("next");
                        }
                    }
                }, 50);
            };

            // マウスイベントの処理（PC用）
            const handleMouseDown = (e: MouseEvent) => {
                if (isSwiping || isLoading || isDateClickingRef.current) return;
                
                const target = e.target as Element;
                
                swipeStartTimeRef.current = Date.now();
                hasMovedRef.current = false;
                
                // 日付セル内の要素の場合、短時間のクリックのみスワイプを許可
                if (isDateCellElement(target)) {
                    setIsMouseDown(true);
                    mouseStartRef.current = {
                        x: e.clientX,
                        y: e.clientY
                    };
                    return;
                }
                
                setIsMouseDown(true);
                mouseStartRef.current = {
                    x: e.clientX,
                    y: e.clientY
                };
            };

            const handleMouseMove = (e: MouseEvent) => {
                if (!isMouseDown || isSwiping || isLoading || isDateClickingRef.current) return;
                
                hasMovedRef.current = true;
                mouseEndRef.current = {
                    x: e.clientX,
                    y: e.clientY
                };
            };

            const handleMouseUp = () => {
                if (!isMouseDown || isSwiping || isLoading || isDateClickingRef.current) return;
                
                setIsMouseDown(false);
                
                const mouseDuration = Date.now() - swipeStartTimeRef.current;
                
                // マウス操作時間が短すぎる場合（クリック操作）はスワイプしない
                if (mouseDuration < 150 || !hasMovedRef.current) return;
                
                const diffX = mouseEndRef.current.x - mouseStartRef.current.x;
                const diffY = mouseEndRef.current.y - mouseStartRef.current.y;

                if (Math.abs(diffY) > thresholdY) return;
                if (Math.abs(diffX) < thresholdX) return;

                // スワイプ実行前に少し待機してクリックイベントとの競合を避ける
                setTimeout(() => {
                    if (!isDateClickingRef.current) {
                        if (diffX > 0) {
                            animateCalendarSwipe("prev");
                        } else {
                            animateCalendarSwipe("next");
                        }
                    }
                }, 50);
            };

            const handleMouseLeave = () => {
                setIsMouseDown(false);
            };

            // パッシブリスナーで登録
            calendarElement.addEventListener("touchstart", handleTouchStart, { passive: true });
            calendarElement.addEventListener("touchmove", handleTouchMove, { passive: true });
            calendarElement.addEventListener("touchend", handleTouchEnd, { passive: true });
            
            // マウスイベント
            calendarElement.addEventListener("mousedown", handleMouseDown);
            calendarElement.addEventListener("mousemove", handleMouseMove);
            calendarElement.addEventListener("mouseup", handleMouseUp);
            calendarElement.addEventListener("mouseleave", handleMouseLeave);

            return () => {
                calendarElement.removeEventListener("touchstart", handleTouchStart);
                calendarElement.removeEventListener("touchmove", handleTouchMove);
                calendarElement.removeEventListener("touchend", handleTouchEnd);
                calendarElement.removeEventListener("mousedown", handleMouseDown);
                calendarElement.removeEventListener("mousemove", handleMouseMove);
                calendarElement.removeEventListener("mouseup", handleMouseUp);
                calendarElement.removeEventListener("mouseleave", handleMouseLeave);
            };
        }, [calendarRef, animateCalendarSwipe, isSwiping, isLoading, isMouseDown]);

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
            [isMobile]
        );

        return (
            <Box
                ref={swipeWrapperRef}
                sx={{
                    "& .fc-header-toolbar": {
                        paddingLeft: isMobile ? "16px" : "auto",
                        paddingRight: isMobile ? "16px" : "auto",
                    },
                    // ローディング中のスタイル
                    opacity: isLoading ? 0.7 : 1,
                    transition: "opacity 0.2s ease-in-out",
                    // PCでのドラッグ防止
                    userSelect: "none",
                    "& *": {
                        userSelect: "none",
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
                    dateClick={handleDateClick}
                    buttonText={{ today: "今月" }}
                    fixedWeekCount={false}
                />
            </Box>
        );
    }
);

export default Calendar;