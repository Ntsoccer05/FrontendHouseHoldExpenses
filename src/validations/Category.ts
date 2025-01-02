import { literal, z } from "zod";
import { expenseMuiIcons, incomeMuiIcons } from "../config/CategoryIcon";

const iconOptions = [...expenseMuiIcons, ...incomeMuiIcons];

// react-hook-formのバリデーション
export const categorySchema = z.object({
    type: z.enum(["income", "expense"]),
    contents: z
        .string()
        .min(1, { message: "カテゴリ名は必須です。" })
        .max(20, { message: "内容は20文字以内にしてください。" })
        .refine(
            (val) =>
                !ExpenseCategories.some((category) => category.label === val),
            {
                message: "このカテゴリ名は既に存在します。",
            }
        ),
    // 入力はstringで受けるけど、型はnumber
    icon: z.enum(iconOptions).nullable().optional(),
});

// z.inferでtransactionSchema関数の型を定義
export type Schema = z.infer<typeof categorySchema>;
