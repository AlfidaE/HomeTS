import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import type {IncomeExpenseCreateType, OperationData, OperationResponse} from "../types/income-expense-create.type";

export class IncomeExpenseCreate {
    private readonly openNewRoute: (url: string) => void;
    private urlParams: URLSearchParams;
    private operationType: string;
    private categories: IncomeExpenseCreateType[];

    private typeSelect: HTMLSelectElement | null;
    private categorySelect: HTMLSelectElement | null;
    private amountInput: HTMLInputElement | null;
    private dateInput: HTMLInputElement | null;
    private commentInput: HTMLInputElement | null;
    private createButton: HTMLElement | null;
    private cancelButton: HTMLElement | null;
    private errorElement: HTMLElement | null;

    constructor(openNewRoute: (url: string) => void) {
        this.openNewRoute = openNewRoute;
        this.urlParams = new URLSearchParams(window.location.search);
        this.operationType = this.urlParams.get('type') || 'income';
        this.categories = [];

        this.typeSelect = null;
        this.categorySelect = null;
        this.amountInput = null;
        this.dateInput = null;
        this.commentInput = null;
        this.createButton = null;
        this.cancelButton = null;
        this.errorElement = null;

        this.initElements();
        this.initEvents();
        this.loadCategories();
        this.initInputStyles();
    }

    private initElements(): void {
        this.typeSelect = document.querySelector('.income-expense-create-type');
        this.categorySelect = document.querySelector('.income-expense-create-category');
        this.amountInput = document.querySelector('input[type="number"]');
        this.dateInput = document.querySelector('input[type="date"]');
        this.commentInput = document.querySelector('input[type="text"]');
        this.createButton = document.getElementById('income-expense-create-btn-edit');
        this.cancelButton = document.getElementById('income-expense-create-btn-remove');

        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error-message';
        this.errorElement.style.display = 'none';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';
        this.errorElement.style.marginBottom = '10px';
        this.errorElement.style.fontSize = '14px';
        this.errorElement.style.textAlign = 'left';

        const buttonsContainer = document.querySelector('.btn-income-expense-create');
        if (buttonsContainer) {
            buttonsContainer.parentNode?.insertBefore(this.errorElement, buttonsContainer.nextSibling);
        }

        if (this.dateInput) {
            this.dateInput.value = new Date().toISOString().split('T')[0] || '';
        }
    }

    private initInputStyles(): void {
        const inputs = [this.amountInput, this.dateInput, this.commentInput].filter(Boolean) as HTMLInputElement[];
        const selects = [this.typeSelect, this.categorySelect].filter(Boolean) as HTMLSelectElement[];

        inputs.forEach(input => {
            if (input && !input.value) {
                input.style.color = '#6C757D';
            }
        });

        selects.forEach(select => {
            if (select && !select.value) {
                select.style.color = '#6C757D';
            }
        });
    }

    private async loadCategories(): Promise<void> {
        try {
            const endpoint = this.operationType === 'income' ? '/categories/income' : '/categories/expense';
            const response: any = await CustomHttp.request(config.host + endpoint);

            if (response && Array.isArray(response)) {
                this.categories = response;
                this.populateCategories();
                this.setOperationType();
            }
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
            this.showError('Не удалось загрузить категории');
        }
    }

    private populateCategories(): void {
        if (!this.categorySelect) return;

        this.categorySelect.innerHTML = '<option value="" disabled selected>Категория...</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id.toString();
            option.textContent = category.title;
            this.categorySelect?.appendChild(option);
        });
    }

    private setOperationType(): void {
        if (!this.typeSelect) return;

        Array.from(this.typeSelect.options).forEach(option  => {
            if (option.value === this.operationType) {
                option.selected = true;
                if (this.typeSelect) {
                    this.typeSelect.style.color = '#000000';
                }
            }
        });

        if (this.urlParams.has('type')) {
            this.typeSelect.disabled = true;
        }
    }

    private initEvents(): void {
        if (!this.typeSelect || !this.createButton || !this.cancelButton) return;

        this.typeSelect.addEventListener('change', this.handleTypeChange.bind(this));
        this.typeSelect.addEventListener('change', this.handleSelectChange.bind(this));
        if (this.categorySelect) {
            this.categorySelect.addEventListener('change', this.handleSelectChange.bind(this));
        }

        this.createButton.addEventListener('click', this.createOperation.bind(this));
        this.cancelButton.addEventListener('click', this.handleCancel.bind(this));

        const inputs = [this.amountInput, this.dateInput, this.commentInput].filter(Boolean) as HTMLInputElement[];
        inputs.forEach(input => {
            input.addEventListener('focus', this.handleInputFocus.bind(this));
            input.addEventListener('blur', this.handleInputBlur.bind(this));
            input.addEventListener('input', this.handleInputChange.bind(this));
        });

        const validationElements = [
            this.amountInput,
            this.dateInput,
            this.categorySelect
        ].filter(Boolean) as (HTMLInputElement | HTMLSelectElement)[];

        validationElements.forEach(element => {
            element.addEventListener('input', this.hideError.bind(this));
        });
    }

    private handleInputFocus(e: Event): void {
        const target = e.target as HTMLInputElement;
        target.style.color = '#000000';
    }

    private handleInputBlur(e: Event): void {
        const target = e.target as HTMLInputElement;
        if (!target.value) {
            target.style.color = '#6C757D';
        } else {
            target.style.color = '#000000';
        }
    }

    private handleInputChange(e: Event): void {
        const target = e.target as HTMLInputElement;
        if (target.value) {
            target.style.color = '#000000';
        }
    }

    private handleSelectChange(e: Event): void {
        const target = e.target as HTMLSelectElement;
        if (target.value) {
            target.style.color = '#000000';
        } else {
            target.style.color = '#6C757D';
        }
    }

    private handleTypeChange(): void {
        if (!this.typeSelect) return;
        this.operationType = this.typeSelect.value;
        this.loadCategories();
    }

    private handleCancel(e: MouseEvent): void {
        e.preventDefault();
        this.openNewRoute('/income-expense-table');
    }

    private showError(message: string): void {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
            this.highlightInvalidFields();
        }
    }

    private hideError(): void {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
            this.clearHighlightedFields();
        }
    }

    private highlightInvalidFields(): void {
        const fields = [this.typeSelect, this.categorySelect, this.amountInput, this.dateInput].filter(Boolean) as (HTMLInputElement | HTMLSelectElement)[];
        fields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
            }
        });
    }

    private clearHighlightedFields(): void {
        const fields = [this.typeSelect, this.categorySelect, this.amountInput, this.dateInput].filter(Boolean) as (HTMLInputElement | HTMLSelectElement)[];
        fields.forEach(field => {
            field.style.borderColor = '#ced4da';
        });
    }

    private validateForm(): boolean {
        const errors: string[] = [];

        if (!this.typeSelect || !this.typeSelect.value) {
            errors.push('Выберите тип операции');
        }

        if (!this.categorySelect || !this.categorySelect.value) {
            errors.push('Выберите категорию');
        }

        if (!this.amountInput || !this.amountInput.value || parseFloat(this.amountInput.value) <= 0) {
            errors.push('Введите корректную сумму');
        }

        if (!this.dateInput || !this.dateInput.value) {
            errors.push('Выберите дату');
        }

        if (errors.length > 0) {
            this.showError(errors.join(', '));
            return false;
        }

        return true;
    }

    private async createOperation(): Promise<void> {
        if (!this.validateForm()) return;
        if (!this.typeSelect || !this.categorySelect || !this.amountInput || !this.dateInput) return;

        try {
            const selectedCategory = this.categories.find(cat =>
                cat.id.toString() === this.categorySelect!.value
            );

            const operationData: OperationData = {
                type: this.typeSelect.value,
                amount: parseFloat(this.amountInput.value),
                date: this.dateInput.value,
                comment: this.commentInput ? this.commentInput.value.trim() : '',
                category: selectedCategory ? selectedCategory.title : '',
                category_id: parseInt(this.categorySelect.value)
            };

            const response: OperationResponse = await CustomHttp.request(
                `${config.host}/operations`,
                'POST',
                operationData
            ) as OperationResponse;

            if (response && response.id) {
                this.openNewRoute('/income-expense-table');
            } else {
                throw new Error(response?.message || 'Не удалось создать операцию: неверный ответ сервера');
            }
        } catch (error) {
            console.error('Ошибка при создании операции:', error);
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при создании операции';
            this.showError(this.getErrorMessage(errorMessage));
        }
    }

    private getErrorMessage(error: string): string {
        if (error.includes('401') || error.includes('Unauthorized')) {
            return 'Ошибка авторизации. Пожалуйста, войдите снова.';
        } else if (error.includes('404')) {
            return 'Сервер не найден. Проверьте подключение.';
        } else if (error.includes('500')) {
            return 'Ошибка сервера. Попробуйте позже.';
        } else if (error.includes('Network Error')) {
            return 'Ошибка сети. Проверьте интернет-соединение.';
        } else {
            return error;
        }
    }
}