import { literal, z } from "zod";

// react-hook-formのバリデーション
export const passwordForgetSchema = z.object({
    email: z.string().min(1, { message: "メールアドレスは必須です" }),
});

// z.inferでtransactionSchema関数の型を定義
export type PasswordForgetScheme = z.infer<typeof passwordForgetSchema>;
