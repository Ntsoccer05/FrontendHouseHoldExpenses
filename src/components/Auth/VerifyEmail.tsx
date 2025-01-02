import { useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../utils/axios";

const VerifyEmail = () => {
    const { id, hash } = useParams();

    useEffect(() => {
        const verifyEmail = async () => {
            const token = localStorage.getItem("token"); // 認証トークンを取得
            try {
                const response = await apiClient.get(
                    `/email/verify/${id}/${hash}`
                );
                alert(response.data.message);
            } catch (error) {
                console.error("Error verifying email:", error);
                alert("Failed to verify email.");
            }
        };

        verifyEmail();
    }, [id, hash]);

    return <div>メールアドレスが一致しているか確認中です</div>;
};

export default VerifyEmail;
