import { Box, Button, Fab, Grid } from "@mui/material";
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
import ShareIcon from '@mui/icons-material/Share';
import { ShareDialog } from '../components/ShareDialog';
import { useSplitGroupContext } from '../context/SplitGroupContext';

const Home = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const [currentDay, setCurrentDay] = useState(today);
    // PCの入力フォーム開閉
    const [isEntryDrawerOpen, setIsEntryDrawerOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const { splitGroups } = useSplitGroupContext();

    const { isMobile, currentMonth, setCurrentMonth } = useAppContext();
    const { isAuthenticated } = useAuthContext();

    //ページ遷移に使用する
    const navigate = useNavigate();

    const calendarRef = useRef<React.RefObject<FullCalendar> | FullCalendar>(
        null
    );

    const { monthlyTransactions, loadedMonth } = useTransactionContext();

    // sessionStorageに前回セッションの表示月が残っている場合、今月に補正する。
    // データ取得自体はCalendar側が currentMonth の変更を検知して行う。
    useEffect(() => {
        if (!isAuthenticated) return;
        const currentDate = new Date();
        const formattedDate = format(currentDate, "yyyyMM");
        if (!currentMonth || format(currentMonth, "yyyyMM") !== formattedDate) {
            setCurrentMonth(currentDate);
        }
    }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    // monthlyTransactionsがcurrentMonthのものとして揃っているか
    // (loadedMonthはTransactionContext側でデータ確定時に更新される)
    const isSummaryDataReady =
        !!currentMonth && loadedMonth === format(currentMonth, "yyyyMM");

    // ローディングが一定時間(150ms)続いた場合のみスケルトンを表示する。
    // Calendar.tsxの日別スケルトンと同じ考え方(キャッシュヒット等の速い遷移ではチラつきを防ぐ)
    const [showSummarySkeleton, setShowSummarySkeleton] = useState(false);
    const summarySkeletonDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!isSummaryDataReady) {
            summarySkeletonDelayRef.current = setTimeout(() => setShowSummarySkeleton(true), 150);
        } else {
            if (summarySkeletonDelayRef.current) clearTimeout(summarySkeletonDelayRef.current);
            setShowSummarySkeleton(false);
        }
        return () => {
            if (summarySkeletonDelayRef.current) clearTimeout(summarySkeletonDelayRef.current);
        };
    }, [isSummaryDataReady]);

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
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        name: "カケポン",
                        alternateName: "らくらく・シンプル家計簿カケポン",
                        url: "https://kake-pon.com/",
                        description:
                            "カレンダー形式で収支を簡単に見える化できる無料家計簿アプリ。登録不要ですぐに使えます。",
                        applicationCategory: "FinanceApplication",
                        operatingSystem: "Web",
                        offers: {
                            "@type": "Offer",
                            price: "0",
                            priceCurrency: "JPY",
                        },
                    })}
                </script>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                {/* 左側コンテンツ */}
                <Box sx={{ flexGrow: 1, fontSize: { xs: "12px", sm: "1em" } }}>
                    <MonthlySummary
                        monthlyTransactions={monthlyTransactions}
                        isLoading={showSummarySkeleton}
                    />
                    {/* 収支共有ボタン */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: { xs: -0.5, sm: 0.5 } }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ShareIcon />}
                            onClick={() => setIsShareDialogOpen(true)}
                        >
                            収支を共有
                        </Button>
                    </Box>
                    <ShareDialog
                        open={isShareDialogOpen}
                        onClose={() => setIsShareDialogOpen(false)}
                        splitGroups={splitGroups}
                    />
                    {/* 年月選択 */}
                    <Box sx={{ marginBottom: { xs: "13px", sm: 0 } }}>
                        <ChangeCalendarMonth
                            calendarRef={calendarRef.current as FullCalendar}
                        />
                    </Box>
                    <Box
                        sx={{
                            // モバイル: 親の p:2 (=16px) を負マージンで打ち消して横幅いっぱいに表示
                            mx: { xs: -2, sm: 0 },
                            width: { xs: "calc(100% + 32px)", sm: "100%" },
                            overflowX: "hidden",
                        }}
                    >
                        <Calendar
                            setCurrentDay={setCurrentDay}
                            currentDay={currentDay}
                            today={today}
                            onDateClick={handleDateClick}
                            calendarRef={calendarRef as React.RefObject<FullCalendar>}
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

                {/* PC版・モバイル版: 固定FABボタン（右下） */}
                <Fab
                    color="primary"
                    aria-label="今日の家計簿記録"
                    onClick={handleTodayTransactionForm}
                    sx={{
                        position: "fixed",
                        bottom: { xs: 10, lg: 24 },
                        right: { xs: 20, lg: 24 },
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