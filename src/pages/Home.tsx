import { Box, Fab, Grid } from "@mui/material";
import React, {
    useMemo,
    useRef,
    useState,
    useEffect,
} from "react";
import MonthlySummary from "../components/MonthlySummary";
import Calendar from "../components/Calendar";
import TransactionMenu from "../components/TransactionMenu";
import TransactionForm from "../components/TransactionForm";
import { Transaction } from "../types";
import { format } from "date-fns";
import { DateClickArg } from "@fullcalendar/interaction";
import { useAppContext } from "../context/AppContext";
import ChangeCalendarMonth from "../components/ChangeCalendarMonth";
import FullCalendar from "@fullcalendar/react";
import "../assets/css/calendar.css";
import { useNavigate } from "react-router-dom";
import { CalendarApi } from "fullcalendar";
import { useTransactionContext } from "../context/TransactionContext";
import { useAuthContext } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";
import { ogIMG } from "../config/ogImg";
import AddIcon from '@mui/icons-material/Add';

const Home = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const [currentDay, setCurrentDay] = useState(today);
    // PCの入力フォーム開閉
    const [isEntryDrawerOpen, setIsEntryDrawerOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const { isMobile, currentMonth, setCurrentMonth } = useAppContext();
    const { isAuthenticated } = useAuthContext();

    //ページ遷移に使用する
    const navigate = useNavigate();

    const calendarRef = useRef<React.RefObject<FullCalendar> | FullCalendar>(
        null
    );

    const { monthlyTransactions, getMonthlyTransactions } = useTransactionContext();

    // 初期データの読み込み
    useEffect(() => {
        const initializeData = async () => {
            const currentDate = new Date();
            const formattedDate = format(currentDate, "yyyyMM");
            
            try {
                // 現在の月のデータを読み込み
                await getMonthlyTransactions(formattedDate);
                
                // currentMonthが設定されていない場合は設定
                if (!currentMonth || format(currentMonth, "yyyyMM") !== formattedDate) {
                    setCurrentMonth(currentDate);
                }
            } catch (error) {
                console.error('Failed to initialize data:', error);
            } finally {
                // 初期化完了を少し遅らせて確実にデータを表示
                setTimeout(() => {
                    setIsInitialLoad(false);
                }, 200);
            }
        };

        if (isInitialLoad) {
            initializeData();
        }
    }, [isInitialLoad, getMonthlyTransactions, currentMonth, setCurrentMonth]);

    // 一日分のデータを取得
    const dailyTransactions = useMemo(() => {
        return monthlyTransactions.filter(
            (transaction) => transaction.date === currentDay
        );
    }, [monthlyTransactions, currentDay]);

    const closeForm = () => {
        setSelectedTransaction(null);
        if (isMobile) {
            setIsDialogOpen(false);
        } else {
            setIsEntryDrawerOpen(!isEntryDrawerOpen);
        }
    };

    // フォームの開閉処理(内訳追加ボタンを押したとき)
    const handleAddTransactionForm = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        if (isMobile) {
            setSelectedTransaction(null);
            setIsDialogOpen(true);
        } else {
            const shouldCloseDrawer = selectedTransaction && isEntryDrawerOpen;

            if (shouldCloseDrawer) {
                setSelectedTransaction(null);
            } else {
                setIsEntryDrawerOpen((prev) => !prev);
            }
        }
    };
    //取り引きが選択された時の処理
    const handleSelectTransaction = (trnsaction: Transaction) => {
        setSelectedTransaction(trnsaction);
        if (isMobile) {
            setIsDialogOpen(true);
        } else {
            setIsEntryDrawerOpen(true);
        }
    };

    // モバイル用Drawerを閉じる処理
    const handleCloseMobileDrawer = () => {
        setIsMobileDrawerOpen(false);
    };

    // 日付を選択したときの処理
    const handleDateClick = (dateInfo: DateClickArg) => {
        if (isEntryDrawerOpen) {
            setIsEntryDrawerOpen(false);
        }
        const clickedDate = new Date(dateInfo.dateStr);
        const calendarApi: CalendarApi | null = calendarRef.current?.getApi();
        const startDate = calendarApi?.view?.currentStart;
        const endDate = calendarApi?.view?.currentEnd;

        if (
            !startDate ||
            !endDate ||
            clickedDate < startDate ||
            clickedDate >= endDate
        ) {
            return;
        }
        setCurrentDay(dateInfo.dateStr);
        if (isMobile) {
            setIsMobileDrawerOpen(true);
        }
    };

    // 今日の家計簿記録ボタンの処理
    const handleTodayTransactionForm = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        
        // 今日の日付に設定
        setCurrentDay(today);
        
        // カレンダーが今月を表示していない場合は、今月に移動
        const currentDate = new Date();
        const calendarApi: CalendarApi | null = calendarRef.current?.getApi();
        if (calendarApi) {
            const viewDate = calendarApi.getDate();
            if (viewDate.getMonth() !== currentDate.getMonth() || 
                viewDate.getFullYear() !== currentDate.getFullYear()) {
                calendarApi.gotoDate(currentDate);
            }
        }
        
        // TransactionMenuとTransactionFormの両方を開く
        setSelectedTransaction(null);
        if (isMobile) {
            setIsMobileDrawerOpen(true); // TransactionMenuを開く
            setIsDialogOpen(true); // TransactionFormも開く
        } else {
            setIsEntryDrawerOpen(true); // TransactionFormを開く
        }
    };

    return (
        <>
            <Helmet>
                <title>らくらく・シンプル家計簿カケポン｜カレンダーで支出・収入をかんたん管理</title>
                <meta name="description" content="登録してすぐ使える完全無料家計簿アプリ「カケポン」。カレンダー形式で支出・収入を見える化し、家計管理を続けたい主婦・社会人・カップル・一人暮らし・学生におすすめです。" />
                <meta property="og:title" content="カレンダーで見える家計簿｜完全無料アプリ「カケポン」" />
                <meta property="og:description" content="毎日の支出・収入をカレンダーで見える化！登録してすぐ使える完全無料家計簿アプリ『カケポン』。忙しくても続けやすい設計です。" />
                <meta property="og:url" content="https://kake-pon.com/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>
            <Box sx={{ display: "flex" }}>
                {/* 左側コンテンツ */}
                <Box sx={{ flexGrow: 1, fontSize: { xs: "12px", sm: "1em" } }}>
                    <MonthlySummary monthlyTransactions={monthlyTransactions} />
                    <Grid
                        item
                        xs={12}
                        sx={{
                            marginBottom: { xs: "13px", sm: 0 },
                        }}
                    >
                        {/* 日付選択エリア */}
                        <ChangeCalendarMonth
                            calendarRef={calendarRef.current as FullCalendar}
                        />
                    </Grid>
                    <Box
                        sx={{
                            position: isMobile ? "absolute" : "relative",
                            left: isMobile ? 0 : "auto",
                            width: isMobile ? "100vw" : "auto",
                            height: isMobile ? "100vh" : "auto", // 全画面分を使う
                            overflowY: isMobile ? "auto" : "visible", // スクロール有効化
                            // 初期読み込み中の表示制御
                            opacity: isInitialLoad ? 0.5 : 1,
                            transition: "opacity 0.3s ease-in-out",
                        }}
                    >
                        {/* 初期データが読み込まれてからカレンダーを表示 */}
                        {!isInitialLoad && (
                            <Calendar
                                setCurrentDay={setCurrentDay}
                                currentDay={currentDay}
                                today={today}
                                onDateClick={handleDateClick}
                                calendarRef={calendarRef as React.RefObject<FullCalendar>}
                            />
                        )}
                    </Box>
                </Box>
                {/* 右側コンテンツ */}
                <Box>
                    <TransactionMenu
                        dailyTransactions={dailyTransactions}
                        currentDay={currentDay}
                        onAddTransactionForm={handleAddTransactionForm}
                        onSelectTransaction={handleSelectTransaction}
                        open={isMobileDrawerOpen}
                        onClose={handleCloseMobileDrawer}
                    />
                    <TransactionForm
                        onCloseForm={closeForm}
                        isEntryDrawerOpen={isEntryDrawerOpen}
                        currentDay={currentDay}
                        selectedTransaction={selectedTransaction}
                        setSelectedTransaction={setSelectedTransaction}
                        isDialogOpen={isDialogOpen}
                        setIsDialogOpen={setIsDialogOpen}
                    />
                </Box>

                {/* PC版・モバイル版: 固定FABボタン（右下） */}
                <Fab
                    color="primary"
                    aria-label="今日の家計簿記録"
                    onClick={handleTodayTransactionForm}
                    sx={{
                        position: "fixed",
                        bottom: isMobile ? 10 : 274,
                        right: isMobile ? 20 : 344,
                        width: isMobile ? 50 : 64,
                        height: isMobile ? 50 : 64,
                        boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
                        background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                        "&:hover": {
                            boxShadow: "0 8px 20px rgba(25, 118, 210, 0.4)",
                            transform: "translateY(-2px)",
                        },
                        "&:active": {
                            transform: "translateY(0px)",
                        },
                        transition: "all 0.2s ease-in-out",
                        zIndex: 1000
                    }}
                >
                    <Box sx={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.2
                    }}>
                        <AddIcon sx={{ fontSize: isMobile ? "20px" : "24px" }} />
                        <Box sx={{ 
                            fontSize: isMobile ? "9px" : "10px", 
                            fontWeight: "600",
                            lineHeight: 1,
                            textAlign: "center"
                        }}>
                            今日
                        </Box>
                    </Box>
                </Fab>
            </Box>
        </>
    );
};
export default Home;