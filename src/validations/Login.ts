import { literal, z } from "zod";

// react-hook-formのバリデーション
export const loginSchema = z.object({
    email: z.string().min(1, { message: "メールアドレスは必須です" }),
    password: z.string(),
    // .regex(
    //     /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,100}$/i,
    //     "パスワードは半角英数字混合で入力してください"
    // ),
});
// z.inferでtransactionSchema関数の型を定義
export type LoginScheme = z.infer<typeof loginSchema>;
