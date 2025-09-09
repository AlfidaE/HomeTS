import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import type {CategoryExpensesType} from "../types/category-expenses.type";

export class Expenses {
    private openNewRoute: (url: string) => void;
    private popup: HTMLElement | null;
    private currentCard: HTMLElement | null;
    private categories: CategoryExpensesType[];
    private cardExpensesContainer: HTMLElement;
    private addButton: HTMLElement;

    constructor(openNewRoute: (url: string) => void) {
        this.openNewRoute = openNewRoute;
        this.popup = document.querySelector('.popup-expenses');
        this.currentCard = null;
        this.categories = [];


        const cardExpensesContainer = document.querySelector('.cardExpenses');
        if (!cardExpensesContainer) {
            throw new Error('Element .cardExpenses not found');
        }
        this.cardExpensesContainer = cardExpensesContainer as HTMLElement;

        const addButton = this.cardExpensesContainer.querySelector('.card-add');
        if (!addButton) {
            throw new Error('Element .card-add not found');
        }
        this.addButton = addButton as HTMLElement;

        this.setupEvents();
        this.init();
    }

    private async init(): Promise<void> {
        await this.getCategories();
        this.renderCategories();
    }

    private async getCategories(): Promise<void> {
        try {
            const response = await CustomHttp.request(config.host + '/categories/expense');

            if (response && Array.isArray(response)) {
                this.categories = response;
                console.log('Получены категории расходов:', this.categories);
            } else {
                console.warn('Ответ сервера не содержит массив категорий:', response);
                this.categories = [];
            }
        } catch (error) {
            console.error('Ошибка при получении категорий расходов:', error);
            this.categories = [];
        }
    }

    private renderCategories(): void {
        // Очищаем контейнер, но оставляем кнопку добавления
        this.cardExpensesContainer.innerHTML = '';
        if (this.addButton) {
            this.cardExpensesContainer.appendChild(this.addButton);
        }

        // Создаем карточки для каждой категории
        this.categories.forEach(category => {
            const card: HTMLElement = this.createCategoryCard(category);
            this.cardExpensesContainer.insertBefore(card, this.addButton);
        });
    }

    private createCategoryCard(category: CategoryExpensesType): HTMLElement {
        const card = document.createElement('div');
        card.className = 'card-expenses';
        card.dataset.id = category.id.toString();

        const cardTitle = document.createElement('div');
        cardTitle.className = 'card-title';
        cardTitle.textContent = category.title;

        const cardButtons = document.createElement('div');
        cardButtons.className = 'cardExpenses-btn';

        // Изменено: кнопка вместо ссылки для редактирования
        const editButton = document.createElement('button');
        editButton.className = 'card-btn-edit-expenses';
        editButton.id = `card-${category.title.toLowerCase().replace(/\s+/g, '-')}-btn-edit`;
        editButton.dataset.id = category.id.toString();
        editButton.dataset.name = category.title;
        editButton.textContent = 'Редактировать';

        const removeButton = document.createElement('button');
        removeButton.className = 'card-btn-remove-expenses';
        removeButton.id = `card-${category.title.toLowerCase().replace(/\s+/g, '-')}-btn-remove`;
        removeButton.dataset.id = category.id.toString();
        removeButton.textContent = 'Удалить';

        cardButtons.appendChild(editButton);
        cardButtons.appendChild(removeButton);

        card.appendChild(cardTitle);
        card.appendChild(cardButtons);

        return card;
    }

    private setupEvents(): void {
        // Обработчик для кнопки добавления
        this.addButton.addEventListener('click', () => {
            this.openNewRoute('/expenses-create');
        });

        // Обработчики для динамических элементов
        document.addEventListener('click', async (e: PointerEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('card-btn-remove-expenses')) {
                e.preventDefault();
                const card: HTMLElement | null = target.closest('.card-expenses');
                if (card) {
                    this.showPopup(card);
                }
            }

            if (target.classList.contains('card-btn-edit-expenses')) {
                e.preventDefault();
                this.handleEditClick(target);
            }

            if (target.classList.contains('popup-btn-expenses-yes')) {
                e.preventDefault();
                await this.deleteCategory();
            }

            if (target.classList.contains('popup-btn-expenses-no')) {
                e.preventDefault();
                this.hidePopup();
            }
        });
    }

    private handleEditClick(editButton: HTMLElement): void {
        const card: HTMLElement | null = editButton.closest('.card-expenses');
        if (!card) return;
        const cardTitle = card.querySelector('.card-title');
        if (!cardTitle) return;
        const categoryName = cardTitle.textContent;
        const categoryId = card.dataset.id;
        if (categoryId) {
            this.openNewRoute(`/expenses-edit?name=${encodeURIComponent(categoryName)}&id=${categoryId}`);

        }
    }

    private showPopup(card: HTMLElement): void {
        this.currentCard = card;
        if (this.popup) {
            this.popup.style.display = 'block';
        }
    }

    private hidePopup(): void {
        if (this.popup) {
            this.popup.style.display = 'none';
        }
        this.currentCard = null;
    }

    private async deleteCategory(): Promise<void> {
        if (!this.currentCard) return;

        const categoryId = this.currentCard.dataset.id;

        try {
            const response: Response = await CustomHttp.request(config.host + `/categories/expense/${categoryId}`, 'DELETE');

            if (response && !response.statusText) {
                this.currentCard.remove();
                // Обновляем список категорий после удаления
                await this.getCategories();
                this.renderCategories();
            } else {
                console.error('Ошибка при удалении:', response.statusText);
            }
        } catch (error) {
            console.error('Не удалось удалить категорию:', error);
        } finally {
            this.hidePopup();
        }
    }
}