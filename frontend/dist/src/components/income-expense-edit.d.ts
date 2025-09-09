export declare class IncomeExpenseEdit {
    private openNewRoute;
    private urlParams;
    private operationId;
    private operationType;
    private categories;
    private operation;
    private typeSelect;
    private categorySelect;
    private amountInput;
    private dateInput;
    private commentInput;
    private saveButton;
    private cancelButton;
    private errorElement;
    constructor(openNewRoute: (url: string) => void);
    private initElements;
    private loadOperationData;
    private loadCategories;
    private populateForm;
    private populateCategories;
    private initEvents;
    private showError;
    private hideError;
    private highlightInvalidFields;
    private clearHighlightedFields;
    private validateForm;
    private updateOperation;
}
//# sourceMappingURL=income-expense-edit.d.ts.map