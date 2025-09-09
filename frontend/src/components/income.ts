import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import type {DeleteResponse, IncomeCategoryType} from "../types/income-category.type";

export class Income {
    private openNewRoute: (url: string) => void;
    private popup: HTMLElement | null;
    private currentCard: HTMLElement | null;
    private categories: IncomeCategoryType[];
    private cardIncomeContainer: HTMLElement;
    private addButton: HTMLElement;

    constructor(openNewRoute: (url: string) => void) {
        this.openNewRoute = openNewRoute;
        this.popup = document.querySelector('.popup-income');
        this.currentCard = null;
        this.categories = [];

        const container = document.querySelector('.cardIncome');
        if (!container) throw new Error('Container .cardIncome not found');
        this.cardIncomeContainer = container as HTMLElement;

        const addBtn = this.cardIncomeContainer.querySelector('.card-add');
        if (!addBtn) throw new Error('Add button .card-add not found');
        this.addButton = addBtn as HTMLElement;

        this.setupEvents();
        this.init();
    }

    private async init(): Promise<void> {
        await this.getCategories();
        this.renderCategories();
    }

    private async getCategories(): Promise<void> {
        try {
            const response: Response = await CustomHttp.request(config.host + '/categories/income');

            if (response && Array.isArray(response)) {
                this.categories = response;
                console.log('Получены категории:', this.categories);
            } else {
                console.warn('Ответ сервера не содержит массив категорий:', response);
                this.categories = [];
            }
        } catch (error) {
            console.error('Ошибка при получении категорий:', error);
            this.categories = [];
        }
    }

    private renderCategories(): void {
        // Очищаем контейнер, но оставляем кнопку добавления
        this.cardIncomeContainer.innerHTML = '';
        if (this.addButton) {
            this.cardIncomeContainer.appendChild(this.addButton);
        }

        // Создаем карточки для каждой категории
        this.categories.forEach(category => {
            const card = this.createCategoryCard(category);
            this.cardIncomeContainer.insertBefore(card, this.addButton);
        });
    }

    private createCategoryCard(category: IncomeCategoryType): HTMLElement {
        const card = document.createElement('div');
        card.className = `card-${category.title.toLowerCase().replace(/\s+/g, '-')} card-income`;
        card.dataset.id = category.id.toString();

        const cardTitle = document.createElement('div');
        cardTitle.className = 'card-title card-income-title';
        cardTitle.textContent = category.title;

        const cardButtons = document.createElement('div');
        cardButtons.className = 'cardIncome-btn';

        // Изменено: кнопка вместо ссылки для редактирования
        const editButton = document.createElement('button');
        editButton.className = 'card-btn-edit-income';
        editButton.id = `card-${category.title.toLowerCase().replace(/\s+/g, '-')}-btn-edit`;
        editButton.dataset.id = category.id.toString();
        editButton.dataset.name = category.title;
        editButton.textContent = 'Редактировать';

        const removeButton = document.createElement('button');
        removeButton.className = 'card-btn-remove-income';
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
            this.openNewRoute('/income-create');
        });

        // Обработчики для динамических элементов
        document.addEventListener('click', async (e: PointerEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('card-btn-remove-income')) {
                e.preventDefault();
                const card: HTMLElement | null = target.closest('.card-income');
                if (card) {
                    this.showPopup(card);
                }
            }

            if (target.classList.contains('card-btn-edit-income')) {
                e.preventDefault();
                this.handleEditClick(target);
            }

            if (target.classList.contains('popup-btn-income-yes')) {
                e.preventDefault();
                await this.deleteCategory();
            }

            if (target.classList.contains('popup-btn-income-no')) {
                e.preventDefault();
                this.hidePopup();
            }
        });
    }

    private handleEditClick(editButton: HTMLElement): void {
        const card: HTMLElement | null = editButton.closest('.card-income');
        if (!card) return;
        const cardTitle = card.querySelector('.card-income-title');
        if (!cardTitle) return;

        const categoryName = cardTitle.textContent;
        const categoryId = card.dataset.id;

        if (categoryId) {
            this.openNewRoute(`/income-edit?name=${encodeURIComponent(categoryName || '')}&id=${categoryId}`);
        }
    }

    private showPopup(card: HTMLElement) {
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
            const response: DeleteResponse = await CustomHttp.request(config.host + `/categories/income/${categoryId}`, 'DELETE');

            if (response && !response.error) {
                this.currentCard.remove();
                // Обновляем список категорий после удаления
                await this.getCategories();
                this.renderCategories();
            } else {
                console.error('Ошибка при удалении:', response.error);
            }
        } catch (error) {
            console.error('Не удалось удалить категорию:', error);
        } finally {
            this.hidePopup();
        }
    }
}