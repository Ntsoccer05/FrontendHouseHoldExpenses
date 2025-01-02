import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/css/app.css"; // 必要に応じてスタイルをインポート
import DefineRouter from "./routes/router";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <DefineRouter />
    </StrictMode>
);
