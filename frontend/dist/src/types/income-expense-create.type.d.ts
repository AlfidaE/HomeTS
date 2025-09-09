export type IncomeExpenseCreateType = {
    id: number;
    title: string;
};
export type OperationResponse = {
    id?: number;
    error?: boolean;
    message?: string;
};
export type OperationData = {
    type: string;
    amount: number;
    date: string;
    comment: string;
    category: string;
    category_id: number;
};
//# sourceMappingURL=income-expense-create.type.d.ts.map