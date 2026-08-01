import { Helmet } from "react-helmet-async";
import PasswordForgetForm from "../components/Auth/PasswordForgetForm";

function PasswordForget() {
    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <PasswordForgetForm></PasswordForgetForm>
        </>
    );
}

export default PasswordForget;
