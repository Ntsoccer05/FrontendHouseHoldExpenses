import { literal, z } from "zod";

// react-hook-formのバリデーション
export const transactionSchema = z.object({
    type: z.enum(["income", "expense"]),
    date: z.string().min(1, { message: "日付は必須です" }),
    amount: z
        .number()
        .min(1, { message: "金額は1円以上必須です" })
        .refine((value) => value.toString().length <= 8, {
            message: "金額は8桁以内にしてください",
        }),
    content: z
        .string()
        .max(50, { message: "内容は50文字以内にしてください。" })
        .nullable(),
    category: z.string().min(1, { message: "カテゴリを選択してください" }),

    // category: z
    //     .union([
    //         z.enum(["食費", "日用品", "住居費", "交際費", "娯楽", "交通費"]),
    //         z.enum(["給与", "副収入", "お小遣い"]),
    //         // literalは引数のもののみ許容する
    //         z.literal(""),
    //     ])
    //     .refine((val) => val !== "", {
    //         message: "カテゴリを選択してください",
    //     }),
});

// z.inferでtransactionSchema関数の型を定義
export type Schema = z.infer<typeof transactionSchema>;
