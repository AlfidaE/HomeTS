export declare class IncomeExpenseCreate {
    private readonly openNewRoute;
    private urlParams;
    private operationType;
    private categories;
    private typeSelect;
    private categorySelect;
    private amountInput;
    private dateInput;
    private commentInput;
    private createButton;
    private cancelButton;
    private errorElement;
    constructor(openNewRoute: (url: string) => void);
    private initElements;
    private initInputStyles;
    private loadCategories;
    private populateCategories;
    private setOperationType;
    private initEvents;
    private handleInputFocus;
    private handleInputBlur;
    private handleInputChange;
    private handleSelectChange;
    private handleTypeChange;
    private handleCancel;
    private showError;
    private hideError;
    private highlightInvalidFields;
    private clearHighlightedFields;
    private validateForm;
    private createOperation;
    private getErrorMessage;
}
//# sourceMappingURL=income-expense-create.d.ts.map