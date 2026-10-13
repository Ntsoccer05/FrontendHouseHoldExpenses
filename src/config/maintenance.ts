// RDS の停止スケジュール (HouseHoldExpenses/infra/terraform/modules/scheduler/variables.tf) に合わせる。
// RDS 停止時刻 - 10分 (停止直前の操作失敗を防ぐ) 〜 起動時刻 + 20分 (DB 起動待ち) をメンテナンス時間とする。
export type MaintenanceWindow = {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
};

export const MAINTENANCE_SCHEDULE: Record<"weekday" | "holiday", readonly MaintenanceWindow[]> = {
  // 平日 (JST)
  weekday: [
    { startHour: 0, startMinute: 50, endHour: 6, endMinute: 20 },
    { startHour: 10, startMinute: 50, endHour: 17, endMinute: 20 },
  ],
  // 土日祝 (JST)
  holiday: [{ startHour: 0, startMinute: 50, endHour: 7, endMinute: 20 }],
};

// 祝日判定にはスケジューラー Lambda と同じ API を使う
export const HOLIDAYS_API_URL = "https://holidays-jp.github.io/api/v1/date.json";
export const HOLIDAYS_STORAGE_KEY = "holidaysJp";
