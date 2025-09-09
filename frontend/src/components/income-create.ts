import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import type {IncomeCreateCategoryType} from "../types/income-create-category.type";

export class IncomeCreate {
    private readonly openNewRoute: (url: string) => void;
    private inputElement!: HTMLInputElement;
    private createButton!: HTMLElement;
    private cancelButton!: HTMLElement;
    private errorElement!: HTMLElement;

    constructor(openNewRoute: (url: string) => void) {
        this.openNewRoute = openNewRoute;
        this.initElements();
        this.initEvents();
    }
    private initElements(): void {
        const inputElement = document.querySelector('.input-income-create .form-control');
        const createButton = document.getElementById('income-create-btn-edit');
        const cancelButton = document.getElementById('income-create-btn-remove');

        if (!(inputElement instanceof HTMLInputElement) || !createButton || !cancelButton) {
            throw new Error('Required elements not found');
        }

        this.inputElement = inputElement;
        this.createButton = createButton;
        this.cancelButton = cancelButton;

        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error-message';
        this.errorElement.style.display = 'none';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';
        this.errorElement.style.marginBottom = '10px';
        this.errorElement.style.fontSize = '14px';
        this.errorElement.style.textAlign = 'left';

        this.inputElement.parentNode?.appendChild(this.errorElement);
    }

    private initEvents(): void {
        // кнопка создать
        this.createButton.addEventListener('click', () => this.createCategory());
        // кнопка отмена
        this.cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.openNewRoute('/income');

        });
        // валидация при вводе
        this.inputElement.addEventListener('input', () => {
            if (this.inputElement.value.trim()) {
                this.hideError();
            }
        });
    }
    private showError(message: string): void {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.inputElement.style.borderColor = '#dc3545';
        this.errorElement.style.textAlign = 'left';
    }
    hideError() {
        this.errorElement.style.display = 'none';
        this.inputElement.style.borderColor = '#ced4da';
    }
    validateInput() {
        const value = this.inputElement.value.trim();

        if (!value) {
            this.showError('Название категории не может быть пустым');
            return false;
        }
        return true;
    }
    async createCategory() {
        // валидация
        if (!this.validateInput()) return;

        try {
            const response: IncomeCreateCategoryType = await CustomHttp.request(`${config.host}/categories/income`,'POST',
                {
                    title: this.inputElement.value.trim()
                }
            );
            if (response && typeof response.id === 'number' && response.title) {
                this.openNewRoute('/income');
            } else {
                throw new Error('Ошибка при создании категории');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка сервера при создании категории';
            this.showError(errorMessage);
        }
    }

}