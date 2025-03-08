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
    errorMsgs.map((error) => {
        if (error.field === "name") {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    nameErrMsg: error.detail,
                };
            });
        }
        if (error.field === "email") {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    emailErrMsg: error.detail,
                };
            });
        }
        if (error.field === "password") {
            setErrorMsgs((state) => {
                if (error.detail.indexOf("パスワード確認") > 0) {
                    return {
                        ...state,
                        passConfErrMsg: error.detail,
                    };
                }
                else{
                    return {
                        ...state,
                        passErrMsg: error.detail,
                    };
                }
            });
        }
    })
}
export function LoginError(errorMsgs: LoginErrs, setErrorMsgs) {
    // 既にあるオブジェクトを更新するときは...state,を使う
    errorMsgs.map((error) => {
        if (error.field === "email") {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    emailErrMsg: error.detail,
                };
            });
        }
        if (error.field === "password") {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    passErrMsg: error.detail,
                };
            });
        }
    })
}

export function PasswordResetError(errorMsgs: PasswordResetErrs, setErrorMsgs) {
    // 既にあるオブジェクトを更新するときは...state,を使う
    errorMsgs.map((error) => {
        if (error.field === "email") {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    emailErrMsg: error.detail,
                };
            });
        }
        if (error.field === "password") {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    passErrMsg: error.detail,
                };
            });
        }
        if (error.field === "password_confirmation") {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    passConfErrMsg: error.detail,
                };
            });
        }
    })
}
export function PasswordForgetError(
    errorMsgs: PassworddForgetErrs,
    setErrorMsgs
) {
    // 既にあるオブジェクトを更新するときは...state,を使う
    errorMsgs.map((error) => {
        if (error.field === "email") {
            setErrorMsgs((state) => {
                return {
                    ...state,
                    emailErrMsg: error.detail,
                };
            });
        }
    })
}
