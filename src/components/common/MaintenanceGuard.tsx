import { useState, useEffect, ReactNode } from "react";
import { MAINTENANCE_SCHEDULE } from "../../config/maintenance";
import MaintenanceScreen from "./MaintenanceScreen";

function isMaintenanceTime(): boolean {
  const now = new Date();
  const jstMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + 9 * 60) % (24 * 60);
  const { startHour, startMinute, endHour, endMinute } = MAINTENANCE_SCHEDULE;
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return jstMinutes >= start && jstMinutes < end;
}

export default function MaintenanceGuard({ children }: { children: ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(isMaintenanceTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsMaintenance(isMaintenanceTime());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isMaintenance) return <MaintenanceScreen />;
  return <>{children}</>;
}
