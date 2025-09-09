import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import type {ExpensesCreateCategoryType} from "../types/expenses-create-category.type";

export class ExpensesCreate {
    private readonly openNewRoute: (url: string) => void;
    private inputElement: HTMLInputElement | null;
    private createButton: HTMLElement | null;
    private cancelButton: HTMLElement | null;
    private errorElement: HTMLElement | null;

    constructor(openNewRoute: (url: string) => void) {
        this.openNewRoute = openNewRoute;
        this.inputElement = null;
        this.createButton = null;
        this.cancelButton = null;
        this.errorElement = null;

        this.initElements();
        this.initEvents();
    }


    private initElements(): void {
        this.inputElement = document.querySelector('.input-expenses-create .form-control') as HTMLInputElement;
        this.createButton = document.getElementById('expenses-create-btn-edit');
        this.cancelButton = document.getElementById('expenses-create-btn-remove');

        // Проверка существования элементов
        if (!this.inputElement || !this.createButton || !this.cancelButton) {
            console.error('Required elements not found');
            return;
        }

        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error-message';
        this.errorElement.style.display = 'none';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';
        this.errorElement.style.marginBottom = '10px';
        this.errorElement.style.fontSize = '14px';
        this.errorElement.style.textAlign = 'left';

        if (this.inputElement.parentNode) {
            this.inputElement.parentNode.appendChild(this.errorElement);
        }
    }

    private initEvents(): void {
        // кнопка создать
        if (!this.createButton || !this.cancelButton || !this.inputElement) return;

        this.createButton.addEventListener('click', () => this.createCategory());

        // кнопка отмена
        this.cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.openNewRoute('/expenses');
        });

        // валидация при вводе
        this.inputElement.addEventListener('input', () => {
            if (this.inputElement && this.inputElement.value.trim()) {
                this.hideError();
            }
        });
    }

    private showError(message: string): void {
        if (!this.errorElement || !this.inputElement) return;
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.inputElement.style.borderColor = '#dc3545';
    }

    private hideError(): void {
        if (!this.errorElement || !this.inputElement) return;
        this.errorElement.style.display = 'none';
        this.inputElement.style.borderColor = '#ced4da';
    }

    private validateInput(): boolean {
        if (!this.inputElement) return false;
        const value = this.inputElement.value.trim();

        if (!value) {
            this.showError('Название категории не может быть пустым');
            return false;
        }

        return true;
    }

    private async createCategory(): Promise<void> {
        // валидация
        if (!this.validateInput() || !this.inputElement) return;
        try {
            const response: ExpensesCreateCategoryType = await CustomHttp.request(
                `${config.host}/categories/expense`,
                'POST',
                {
                    title: this.inputElement.value.trim()
                }
            );

            if (response && typeof response.id === 'number' && response.title) {
                this.openNewRoute('/expenses');
            } else {
                throw new Error('Ошибка при создании категории');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка сервера при создании категории';
            this.showError(errorMessage);
        }
    }

}