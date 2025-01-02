type RegisterErrs = {
    name?: string[];
    email?: string[];
    password?: string[];
    password_confirmation?: string[];
};
type LoginErrs = {
    email?: string[];
    password?: string[];
};
type PasswordResetErrs = {
    email?: string[];
    password?: string[];
    password_confirmation?: string[];
};
type PasswordForgetErrs = {
    email?: string[];
};

export function RegisterError(errorMsgs: RegisterErrs, setErrorMsgs) {
    // 既にあるオブジェクトを更新するときは...state,を使う
    if (errorMsgs) {
        if ("name" in errorMsgs) {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    nameErrMsg: errorMsgs.name[0],
                };
            });
        }
        if ("email" in errorMsgs) {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    emailErrMsg: errorMsgs.email[0],
                };
            });
        }
        if ("password" in errorMsgs) {
            setErrorMsgs((state) => {
                if (errorMsgs.password?.length > 1) {
                    return {
                        ...state,
                        passErrMsg: errorMsgs.password[1],
                    };
                }
                if (errorMsgs.password[0].indexOf("パスワード確認") > 0) {
                    return {
                        ...state,
                        passConfErrMsg: errorMsgs.password[0],
                    };
                }
                return {
                    ...state,
                    passErrMsg: errorMsgs.password[0],
                };
            });
        }
    }
}
export function LoginError(errorMsgs: LoginErrs, setErrorMsgs) {
    // 既にあるオブジェクトを更新するときは...state,を使う
    if (errorMsgs) {
        if ("email" in errorMsgs) {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    emailErrMsg: errorMsgs.email[0],
                };
            });
        }
        if ("password" in errorMsgs) {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    passErrMsg: errorMsgs.password[0],
                };
            });
        }
    }
}

export function PasswordResetError(errorMsgs: PasswordResetErrs, setErrorMsgs) {
    // 既にあるオブジェクトを更新するときは...state,を使う
    if (errorMsgs) {
        if ("email" in errorMsgs) {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    emailErrMsg: errorMsgs.email[0],
                };
            });
        }
        if ("password" in errorMsgs) {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    passErrMsg: errorMsgs.password[0],
                };
            });
        }
        if ("password_confirmation" in errorMsgs) {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    passConfErrMsg: errorMsgs.password_confirmation[0],
                };
            });
        }
    }
}
export function PasswordForgetError(
    errorMsgs: PassworddForgetErrs,
    setErrorMsgs
) {
    // 既にあるオブジェクトを更新するときは...state,を使う
    if (errorMsgs) {
        if ("email" in errorMsgs) {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    emailErrMsg: errorMsgs.email[0],
                };
            });
        }
    }
}
