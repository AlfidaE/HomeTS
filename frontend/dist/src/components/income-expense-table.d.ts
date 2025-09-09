export declare class IncomeExpenseTable {
    private readonly openNewRoute;
    private operations;
    private readonly recordsElement;
    private readonly popup;
    private currentOperationId;
    private activeFilter;
    private startDate;
    private endDate;
    private startDatePicker;
    private endDatePicker;
    constructor(openNewRoute: (url: string) => void);
    private init;
    private initDate;
    private loadOperations;
    private setActiveFilter;
    private applyFilter;
    private formatDisplayDate;
    private showRecords;
    private formatDate;
    private formatAmount;
    private setupEvents;
    private showPopup;
    private hidePopup;
    private deleteOperation;
    private editOperation;
}
//# sourceMappingURL=income-expense-table.d.ts.map