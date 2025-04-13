import React from "react";
import { Provider } from "../types";
import apiClient from "../utils/axios";
import { useAuthContext } from "../context/AuthContext";

const useSocialLogin = () => {
    const {fetchUser} = useAuthContext();
    const socialLogin = async (
        provider: Provider,
        socialResponse: queryString.ParsedQuery<string>
    ) => {
        try {
            const { data } = await apiClient.post(
                `/login/${provider}/callback`,
                {
                    code: socialResponse.code,
                }
            );
            await fetchUser();
            return data;
        } catch (e) {
            return false;
        }
    };
    return socialLogin;
};

export default useSocialLogin;
