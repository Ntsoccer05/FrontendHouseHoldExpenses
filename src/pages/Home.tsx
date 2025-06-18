import { Box, Grid } from "@mui/material";
import React, {
    useMemo,
    useRef,
    useState,
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

const Home = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const [currentDay, setCurrentDay] = useState(today);
    // PCの入力フォーム開閉
    const [isEntryDrawerOpen, setIsEntryDrawerOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { isMobile } = useAppContext();
    const { isAuthenticated } = useAuthContext();

    //ページ遷移に使用する
    const navigate = useNavigate();

    const calendarRef = useRef<React.RefObject<FullCalendar> | FullCalendar>(
        null
    );

    const { monthlyTransactions } = useTransactionContext();

    // 一日分のデータを取得
    const dailyTransactions = useMemo(() => {
        return monthlyTransactions.filter(
            (transaction) => transaction.date === currentDay
        );
    }, [monthlyTransactions, currentDay]);

    const closeForm = () => {
        setSelectedTransaction(null);
        if (isMobile) {
            setIsDialogOpen(!isDialogOpen);
        } else {
            setIsEntryDrawerOpen(!isEntryDrawerOpen);
        }
    };

    // フォームの開閉処理(内訳追加ボタンを押したとき)
    const handleAddTransactionForm = () => {
        if (isAuthenticated) {
            if (isMobile) {
                setIsDialogOpen(true);
            } else {
                if (selectedTransaction && isEntryDrawerOpen) {
                    setSelectedTransaction(null);
                    return;
                }
                setIsEntryDrawerOpen(!isEntryDrawerOpen);
            }
        } else {
            navigate("/login");
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

    return (
        <>
            <Helmet>
                <title>完全無料家計簿アプリ「カケポン」｜カレンダーで支出・収入をかんたん管理</title>
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
                          }}
                    >
                        <Calendar
                            setCurrentDay={setCurrentDay}
                            currentDay={currentDay}
                            today={today}
                            onDateClick={handleDateClick}
                            calendarRef={calendarRef as React.LegacyRef<FullCalendar>}
                        />
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
            </Box>
        </>
    );
};
export default Home;
