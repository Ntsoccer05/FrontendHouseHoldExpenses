import { useState, useEffect, ReactNode } from "react";
import { HOLIDAYS_API_URL, HOLIDAYS_STORAGE_KEY, MAINTENANCE_SCHEDULE } from "../../config/maintenance";
import MaintenanceScreen from "./MaintenanceScreen";

// 前回取得した祝日を初期値に使い、取得完了までの間に平日扱いでメンテナンス画面が一瞬出るのを防ぐ
function loadCachedHolidays(): Set<string> {
  try {
    const cached = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
    return new Set(cached ? (JSON.parse(cached) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveCachedHolidays(holidays: string[]): void {
  try {
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(holidays));
  } catch {
    // 保存できなくても毎回取得するだけなので無視する
  }
}

function isMaintenanceTime(holidays: Set<string>): boolean {
  // JST に変換した日時を UTC メソッドで読む
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const jstMinutes = jst.getUTCHours() * 60 + jst.getUTCMinutes();
  const jstDate = jst.toISOString().slice(0, 10);
  const day = jst.getUTCDay();
  // 祝日カレンダーが取得できない場合は平日扱い (スケジューラー Lambda と同じ挙動)
  const isHoliday = day === 0 || day === 6 || holidays.has(jstDate);
  const windows = MAINTENANCE_SCHEDULE[isHoliday ? "holiday" : "weekday"];

  return windows.some(({ startHour, startMinute, endHour, endMinute }) => {
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    if (start <= end) {
      return jstMinutes >= start && jstMinutes < end;
    }
    // 日をまたぐ場合 (例: 23:30〜翌7:50)
    return jstMinutes >= start || jstMinutes < end;
  });
}

export default function MaintenanceGuard({ children }: { children: ReactNode }) {
  const [holidays, setHolidays] = useState<Set<string>>(loadCachedHolidays);
  const [isMaintenance, setIsMaintenance] = useState(() => isMaintenanceTime(holidays));

  useEffect(() => {
    fetch(HOLIDAYS_API_URL)
      .then((res) => res.json())
      .then((data: Record<string, string>) => {
        const dates = Object.keys(data);
        saveCachedHolidays(dates);
        setHolidays(new Set(dates));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsMaintenance(isMaintenanceTime(holidays));
    const interval = setInterval(() => {
      setIsMaintenance(isMaintenanceTime(holidays));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [holidays]);

  if (isMaintenance) return <MaintenanceScreen />;
  return <>{children}</>;
}
