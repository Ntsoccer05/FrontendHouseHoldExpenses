import { Helmet } from "react-helmet-async";
import ResetPasswordForm from "../components/Auth/ResetPasswordForm";

function ResetPassword() {
    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <ResetPasswordForm></ResetPasswordForm>
        </>
    );
}

export default ResetPassword;
