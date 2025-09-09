export type IncomeExpenseEditType = {
    id: number;
    title: string;
};
export type Operation = {
    id?: number;
    type?: string;
    amount?: number;
    date?: string;
    comment?: string;
    category?: string;
    category_id?: number;
};
export type OperationResponse = {
    id?: number;
    error?: boolean;
    message?: string;
};
//# sourceMappingURL=income-expense-edit.type.d.ts.map