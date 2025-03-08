import { useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../utils/axios";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
    const { id, hash } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await apiClient.get(
                    `/email/verify/${id}/${hash}`
                );
                navigate('/');
            } catch (error) {
                console.error("Error verifying email:", error);
            }
        };

        verifyEmail();
    }, [id, hash]);

    return <div>メールアドレスが一致しているか確認中です</div>;
};

export default VerifyEmail;
