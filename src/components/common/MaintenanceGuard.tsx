import { useState, useEffect } from "react";
import { MAINTENANCE_SCHEDULE } from "../../config/maintenance";
import MaintenanceScreen from "./MaintenanceScreen";

function isMaintenanceTime(): boolean {
  const utcHour = new Date().getUTCHours();
  const jstHour = (utcHour + 9) % 24;
  const { startHour, endHour } = MAINTENANCE_SCHEDULE;
  return jstHour >= startHour && jstHour < endHour;
}

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
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
