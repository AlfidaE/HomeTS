import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import type {IncomeExpenseEditType, Operation, OperationResponse} from "../types/income-expense-edit.type";

export class IncomeExpenseEdit {
    private openNewRoute: (url: string) => void;
    private urlParams: URLSearchParams;
    private operationId: string | null;
    private operationType: string | null;
    private categories: IncomeExpenseEditType[];
    private operation: Operation | null;

    private typeSelect: HTMLSelectElement | null;
    private categorySelect: HTMLSelectElement | null;
    private amountInput: HTMLInputElement | null;
    private dateInput: HTMLInputElement | null;
    private commentInput: HTMLInputElement | null;
    private saveButton: HTMLElement | null;
    private cancelButton: HTMLElement | null;
    private errorElement: HTMLElement | null;

    constructor(openNewRoute: (url: string) => void) {
        this.openNewRoute = openNewRoute;
        this.urlParams = new URLSearchParams(window.location.search);
        this.operationId = this.urlParams.get('id');
        this.operationType = this.urlParams.get('type');
        this.categories = [];
        this.operation = null;

        this.typeSelect = null;
        this.categorySelect = null;
        this.amountInput = null;
        this.dateInput = null;
        this.commentInput = null;
        this.saveButton = null;
        this.cancelButton = null;
        this.errorElement = null;

        // Откладываем инициализацию до полной загрузки DOM
        setTimeout(() => {
            this.initElements();
            this.initEvents();
            this.loadOperationData();
        }, 100);
    }


    private initElements(): void {
        this.typeSelect = document.querySelector('.income-expense-edit-type');
        this.categorySelect = document.querySelector('.income-expense-edit-category');
        this.amountInput = document.querySelector('input[type="number"]');
        this.dateInput = document.querySelector('input[type="date"]');
        this.commentInput = document.querySelector('input[type="text"]');
        this.saveButton = document.getElementById('income-expense-edit-btn-edit');
        this.cancelButton = document.getElementById('income-expense-edit-btn-remove');

        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error-message';
        this.errorElement.style.display = 'none';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';
        this.errorElement.style.marginBottom = '10px';
        this.errorElement.style.fontSize = '14px';
        this.errorElement.style.textAlign = 'left';

        const buttonsContainer = document.querySelector('.btn-income-expense-edit');
        if (buttonsContainer) {
            buttonsContainer.parentNode?.insertBefore(this.errorElement, buttonsContainer.nextSibling);
        }
    }

    private async loadOperationData(): Promise<void> {
        try {
            // Загружаем данные операции
            const operationResponse: any = await CustomHttp.request(`${config.host}/operations/${this.operationId}`);

            if (operationResponse && operationResponse.id) {
                this.operation = operationResponse;
                this.populateForm();
            } else {
                throw new Error('Не удалось загрузить данные операции');
            }

            // Загружаем категории
            await this.loadCategories();
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            this.showError('Не удалось загрузить данные для редактирования');
        }
    }

    private async loadCategories(): Promise<void> {
        try {
            const endpoint = this.operationType === 'income' ? '/categories/income' : '/categories/expense';
            const response = await CustomHttp.request(config.host + endpoint);

            if (response && Array.isArray(response)) {
                this.categories = response;
                this.populateCategories();
            }
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
        }
    }

    private populateForm(): void {
        if (!this.operation) return;

        if (this.typeSelect && this.operationType) {
            Array.from(this.typeSelect.options).forEach(option => {
                if (option.value === this.operationType) {
                    option.selected = true;
                }
            });
            this.typeSelect.disabled = true;
        }

        if (this.amountInput && this.operation.amount !== undefined) {
            this.amountInput.value = this.operation.amount.toString();
        }

        if (this.dateInput && this.operation.date) {
            this.dateInput.value = this.operation.date;
        }

        if (this.commentInput && this.operation.comment) {
            this.commentInput.value = this.operation.comment;
        }
    }

    private populateCategories(): void {
        if (!this.categorySelect || !this.operation) return;

        this.categorySelect.innerHTML = '<option value="" disabled selected>Категория...</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id.toString();
            option.textContent = category.title;

            if (this.operation?.category_id === category.id || this.operation?.category === category.title) {
                option.selected = true;
            }

            if (this.categorySelect) {
                this.categorySelect.appendChild(option);
            }

        });

        if (!this.categorySelect.value && this.categories.length > 0) {
            this.categorySelect.value = this.categories[0]!.id.toString();
        }
    }

    private initEvents(): void {
        if(!this.saveButton || !this.cancelButton) {
            return;
        }
        // Проверяем, что кнопки существуют перед добавлением обработчиков
        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => this.updateOperation());
        } else {
            console.error('Save button not found');
        }

        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof this.openNewRoute === 'function') {
                    this.openNewRoute('/income-expense-table');
                }
            });
        } else {
            console.error('Cancel button not found');
        }

        // Валидация при вводе
        [this.amountInput, this.dateInput, this.categorySelect].forEach(element => {
            if (element) {
                element.addEventListener('input', () => this.hideError());
            }
        });
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
        const fields = [this.amountInput, this.dateInput, this.categorySelect].filter(Boolean);
        fields.forEach(field => {
            if (field && !field.value.trim()) {
                field.style.borderColor = '#dc3545';
            }
        });
    }

    private clearHighlightedFields(): void {
        const fields = [this.amountInput, this.dateInput, this.categorySelect].filter(Boolean);
        fields.forEach(field => {
            if (field) {
                field.style.borderColor = '#ced4da';
            }
        });
    }

    private validateForm(): boolean {
        const errors = [];

        if (!this.amountInput || !this.amountInput.value || parseFloat(this.amountInput.value) <= 0) {
            errors.push('Введите корректную сумму');
        }

        if (!this.dateInput || !this.dateInput.value) {
            errors.push('Выберите дату');
        }

        if (!this.categorySelect || !this.categorySelect.value) {
            errors.push('Выберите категорию');
        }

        if (errors.length > 0) {
            this.showError(errors.join(', '));
            return false;
        }

        return true;
    }

    private async updateOperation(): Promise<void> {
        if (!this.validateForm()) return;
        if (!this.operationId || !this.operationType || !this.categorySelect || !this.amountInput || !this.dateInput) return;
        try {
            const selectedCategory = this.categories.find(cat =>
                cat.id.toString() === this.categorySelect!.value
            );

            const operationData = {
                type: this.operationType,
                amount: parseFloat(this.amountInput.value),
                date: this.dateInput.value,
                comment: this.commentInput ? this.commentInput.value.trim() : '',
                category: selectedCategory ? selectedCategory.title : '',
                category_id: parseInt(this.categorySelect.value)
            };

            const response: OperationResponse = await CustomHttp.request(
                `${config.host}/operations/${this.operationId}`,
                'PUT',
                operationData
            );

            if (response && response.id) {
                if (typeof this.openNewRoute === 'function') {
                    this.openNewRoute('/income-expense-table');
                }
            } else {
                throw new Error(response?.message || 'Не удалось обновить операцию');
            }
        } catch (error) {
            console.error('Ошибка при обновлении операции:', error);
            const errorMessage = error instanceof Error ? error.message : 'Ошибка сервера при обновлении операции';
            this.showError(errorMessage);
        }
    }
}