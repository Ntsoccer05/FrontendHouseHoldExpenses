import { useEffect } from "react";
import LoginForm from "../components/Auth/LoginForm";
import { useAppContext } from "../context/AppContext";

function Login() {
    return (
        <>
            <LoginForm></LoginForm>
        </>
    );
}

export default Login;
