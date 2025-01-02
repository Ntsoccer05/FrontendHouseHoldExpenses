import { literal, z } from "zod";

// react-hook-formのバリデーション
export const registerSchema = z
    .object({
        name: z.string(),
        email: z.string().min(1, { message: "メールアドレスは必須です" }),
        password: z
            .string()
            // .regex(
            //     /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,100}$/i,
            //     "パスワードは半角英数字混合で入力してください"
            // ),
        password_confirmation: z
            .string()
            .min(1, "確認用のパスワードを入力してください"),
    })
    .superRefine(({ password, password_confirmation }, ctx) => {
        if (password !== password_confirmation) {
            ctx.addIssue({
                path: ["password_confirmation"],
                code: "custom",
                message: "パスワードが一致しません",
            });
        }
    });

// z.inferでtransactionSchema関数の型を定義
export type RegisterScheme = z.infer<typeof registerSchema>;
