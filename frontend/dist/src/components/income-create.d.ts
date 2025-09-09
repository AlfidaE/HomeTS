export declare class IncomeCreate {
    private readonly openNewRoute;
    private inputElement;
    private createButton;
    private cancelButton;
    private errorElement;
    constructor(openNewRoute: (url: string) => void);
    private initElements;
    private initEvents;
    private showError;
    hideError(): void;
    validateInput(): boolean;
    createCategory(): Promise<void>;
}
//# sourceMappingURL=income-create.d.ts.map