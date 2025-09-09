import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import type {ExpensesEditType} from "../types/expenses-edit.type";

export class ExpensesEdit {
    private readonly openNewRoute: (url: string) => void;
    private urlParams: URLSearchParams;
    private readonly categoryId: string | null;
    private readonly categoryName: string | null;
    private errorElement: HTMLElement | null;


    constructor(openNewRoute: (url: string) => void) {
        this.openNewRoute = openNewRoute;
        this.urlParams = new URLSearchParams(window.location.search);
        this.categoryId = this.urlParams.get('id');
        this.categoryName = this.urlParams.get('name');
        this.errorElement = document.getElementById('error-message-expenses-edit');

        // Проверяем существование элемента ошибки
        if (!this.errorElement) {
            console.error('Error element not found, creating one...');
            this.createErrorElement();
        }

        this.init();
    }

   private createErrorElement(): void {
        // Создаем элемент ошибки, если он не существует
        this.errorElement = document.createElement('div');
        this.errorElement.id = 'error-message-expenses-edit';
        this.errorElement.style.display = 'none';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';

        // Добавляем элемент в DOM (например, после кнопок)
        const buttonsContainer: HTMLElement | null = document.querySelector('.btn-expenses-edit');
        if (buttonsContainer) {
            buttonsContainer.parentNode?.insertBefore(this.errorElement, buttonsContainer.nextSibling);
        } else {
            // Если контейнер кнопок не найден, добавляем в конец body
            document.body.appendChild(this.errorElement);
        }
    }

    private init(): void {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }

        // Устанавливаем текущее название категории в поле ввода
        const inputElement: HTMLInputElement | null = document.querySelector('.input-expenses-edit .form-control');
        if (inputElement && this.categoryName) {
            inputElement.value = decodeURIComponent(this.categoryName);
        }

        this.setupEvents();
    }

   private setupEvents(): void {
        // Кнопка "Сохранить"
        const saveButton = document.getElementById('expenses-edit-btn-keep');
        // Кнопка "Отмена"
        const cancelButton = document.getElementById('expenses-edit-btn-remove');

        // Проверяем существование кнопок
        if (!saveButton || !cancelButton) {
            console.error('Buttons not found');
            return;
        }

        saveButton.addEventListener('click', () => {
            this.saveCategory();
        });

        cancelButton.addEventListener('click', () => {
            this.openNewRoute('/expenses');
        });
    }

    private async saveCategory(): Promise<void> {
        const inputElement = document.querySelector('.input-expenses-edit .form-control');
        if (!(inputElement instanceof HTMLInputElement)) {
            console.error('Не найден');
            return;
        }

        const newName = inputElement.value.trim();

        // Валидация
        if (!newName) {
            this.showError('Название категории не может быть пустым');
            return;
        }

        try {
            const response: ExpensesEditType = await CustomHttp.request(
                `${config.host}/categories/expense/${this.categoryId}`,
                'PUT',
                {
                    title: newName
                }
            );

            if (response && response.id) {
                this.openNewRoute('/expenses');
            } else {
                throw new Error(response?.message || 'Не удалось сохранить изменения');
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            this.showError(error instanceof Error ? error.message : 'Ошибка сервера при сохранении');
        }
    }

    private showError(message: string) {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
            this.errorElement.style.color = '#dc3545';
            this.errorElement.style.textAlign = 'left';
            this.errorElement.style.marginBottom = '10px';
        } else {
            console.error('Ошибка:', message);
        }
    }
}