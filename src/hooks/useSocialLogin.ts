import React from "react";
import { Provider } from "../types";
import apiClient from "../utils/axios";

const useSocialLogin = () => {
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
            return data;
        } catch (e) {
            console.log(e);
            return false;
        }
    };
    return socialLogin;
};

export default useSocialLogin;
