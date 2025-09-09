import {Home} from "./components/home";
import {Income} from "./components/income";
import {IncomeCreate} from "./components/income-create";
import {IncomeEdit} from "./components/income-edit";
import {Expenses} from "./components/expenses";
import {ExpensesCreate} from "./components/expenses-create";
import {ExpensesEdit} from "./components/expenses-edit";
import {IncomeExpenseTable} from "./components/income-expense-table";
import {IncomeExpenseCreate} from "./components/income-expense-create";
import {IncomeExpenseEdit} from "./components/income-expense-edit";
import {Login} from "./components/login";
import {SignUp} from "./components/sign-up";
import {Logout} from "./components/logout";
import {AuthUtils} from "./utils/auth-utils";
import config from "../config/config";
import {CustomHttp} from "./utils/custom-http";
import type {RouteType} from "./types/route.type";



export class Router {
    private readonly titlePageElement: HTMLElement | null;
    readonly contentPageElement: HTMLElement | null;
    readonly stylesLinkElement: HTMLElement | null;
    private profileNameElement: HTMLElement | null;
    private userName: string | null;

    private routes: RouteType[];

    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.stylesLinkElement = document.getElementById('styles-link');
        this.profileNameElement = document.getElementById('profile-name');
        this.userName = null;

        this.initEvents();

        this.routes = [
            {
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/pages/home.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new Home();
                },
                scripts: [
                    'chart.umd.min.js', // круги
                    'flatpickr.min.js' // календарь
                ],
                styles: [
                    'flatpickr.min.css', // календарь
                ]
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/404.html',
                protected: false,
                useLayout: false,
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/pages/login.html',
                useLayout: false,
                protected: false,
                load: () => {
                    new Login(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/pages/sign-up.html',
                useLayout: false,
                protected: false,
                load: () => {
                    new SignUp(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/logout',
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/income',
                title: 'Доходы',
                filePathTemplate: '/templates/pages/income.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new Income(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-create',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/pages/income-create.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new IncomeCreate(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-edit',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/pages/income-edit.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new IncomeEdit(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/pages/expenses.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new Expenses(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expenses-create',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/pages/expenses-create.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new ExpensesCreate(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expenses-edit',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/pages/expenses-edit.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new ExpensesEdit(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-expense-table',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/pages/income-expense-table.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new IncomeExpenseTable(this.openNewRoute.bind(this));
                },
                scripts: [
                    'flatpickr.min.js', // календарь
                ],
                styles: [
                    'flatpickr.min.css', // календарь
                ],
            },
            {
                route: '/income-expense-create',
                title: ' Создание дохода/расхода',
                filePathTemplate: '/templates/pages/income-expense-create.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new IncomeExpenseCreate(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-expense-edit',
                title: ' Редактирование дохода/расхода',
                filePathTemplate: '/templates/pages/income-expense-edit.html',
                useLayout: '/templates/layout.html',
                protected: true,
                load: () => {
                    new IncomeExpenseEdit(this.openNewRoute.bind(this));
                },
            },
        ];
    }

    private initEvents(): void {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this));
    }

    // функция, которая обрабатывает клик по ссылке
    public async openNewRoute(url: string): Promise<void> {
        const currentRoute: string = window.location.pathname;
        history.pushState({}, '', url);
        if (currentRoute) {
            await this.activateRoute(null, currentRoute);
        }
    }

    private async clickHandler(e: MouseEvent): Promise<void> {
        let element: HTMLAnchorElement | null = null;
        const target = e.target as HTMLElement;

        if (target.nodeName === 'A') {
            element = target as HTMLAnchorElement;
        } else if (target.parentElement?.nodeName === 'A') {
            element = target.parentElement as HTMLAnchorElement;
        }

        if (element) {
            e.preventDefault();

            const url = element.href.replace(window.location.origin, '');
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) {
                return;
            }

            await this.openNewRoute(url);
        }
    }

    private async loadBalance(): Promise<void> {
        try {
            const result = await CustomHttp.request(config.host + '/balance');
            const balanceElement = document.querySelector('.balance-container span');
            if (balanceElement) {
                balanceElement.textContent = result?.balance?.toString() ?? '';
            }
        } catch (error) {
            console.error('Ошибка при загрузке баланса:', error);
        }
    }

    private toggleSubmenu(button: HTMLElement): void {
        // Находим подменю рядом с кнопкой
        const submenu = button.nextElementSibling as HTMLElement;

        if (submenu) {
            // Переключаем класс 'show' у подменю
            submenu.classList.toggle('show');

            // Обновляем атрибут aria-expanded для доступности
            const isExpanded = submenu.classList.contains('show');
            button.setAttribute('aria-expanded', isExpanded.toString());
        }
    }

    private initSubmenuHandlers(): void {
        // Добавляем обработчики событий для всех кнопок подменю
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.toggleSubmenu(button as HTMLElement);
            });
        });
    }

    public async activateRoute(e?: Event | null, oldRoute?: string | null): Promise<void> {
        const currentPath = window.location.pathname;
        const isAuthRoute = currentPath === '/login' || currentPath === '/sign-up';
        const isProtectedRoute = this.routes.find(item => item.route === currentPath)?.protected === true;
        const userInfo = AuthUtils.getUserInfo(AuthUtils.userInfoTokenKey);
        const accessToken = localStorage.getItem(AuthUtils.accessTokenKey);

        // Если пользователь не авторизован и пытается попасть на защищенный маршрут
        if ((!userInfo || !accessToken) && isProtectedRoute) {
            history.pushState({}, '', '/login');
            return this.activateRoute();
        }

        // Если пользователь авторизован и пытается попасть на страницу входа/регистрации
        if ((userInfo && accessToken) && isAuthRoute) {
            history.pushState({}, '', '/');
            return this.activateRoute();
        }

        // Удаляем все календари flatpickr
        document.querySelectorAll('.flatpickr-calendar').forEach(el => el.remove());
        if (window.flatpickr) {
            document.querySelectorAll('.flatpickr-input').forEach((input: any) => {
                if (input._flatpickr) {
                    input._flatpickr.destroy();
                }
            });
        }

        // Очищаем старые стили и скрипты
        if (oldRoute) {
            const currentRoute: RouteType | undefined = this.routes.find(item => item.route === oldRoute);
            if (currentRoute) {
                if (currentRoute.styles && currentRoute.styles.length > 0) {
                    currentRoute.styles.forEach(style => {
                        const styleElement = document.querySelector(`link[href='/css/${style}']`);
                        if (styleElement) {
                            styleElement.remove();
                        }
                    });
                }
                if (currentRoute.scripts && currentRoute.scripts.length > 0) {
                    currentRoute.scripts.forEach(script => {
                        const scriptElement = document.querySelector(`script[src='/js/${script}']`);
                        if (scriptElement) {
                            scriptElement.remove();
                        }
                    });
                }
                if (currentRoute.unload && typeof currentRoute.unload === 'function') {
                    currentRoute.unload();
                }
            }
        }

        const urlRoute = window.location.pathname;
        const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute);

        if (!newRoute) {
            console.log('No route found');
            history.pushState({}, '', '/404');
            await this.activateRoute();
            return;
        }

        // Добавляем новые стили
        if (newRoute.styles && newRoute.styles.length > 0) {
            newRoute.styles.forEach(style => {
                const existingLink = document.querySelector(`link[href='/css/${style}']`);
                if (!existingLink) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/css/' + style;
                    document.head.insertBefore(link, this.stylesLinkElement);
                }
            });
        }

        // Добавляем новые скрипты
        if (newRoute.scripts && newRoute.scripts.length > 0) {
            newRoute.scripts.forEach(file => {
                const existingScript = document.querySelector(`script[src='/js/${file}']`);
                if (!existingScript) {
                    const script = document.createElement('script');
                    script.src = '/js/' + file;
                    document.body.appendChild(script);
                }
            });
        }

        // Устанавливаем заголовок
        if (newRoute.title && this.titlePageElement) {
            this.titlePageElement.innerText = newRoute.title + ' | L.Finance';
        }

        // Загружаем контент
        if (newRoute.filePathTemplate) {
            document.body.className = '';
            let contentBlock: HTMLElement | null = this.contentPageElement;

            if (newRoute.useLayout && typeof newRoute.useLayout === 'string') {
                if (this.contentPageElement) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                }
                contentBlock = document.getElementById('content-layout');

                // Обновляем информацию о пользователе
                this.profileNameElement = document.getElementById('profile-name');
                this.userName = null;
                const userInfo = AuthUtils.getUserInfo(AuthUtils.userInfoTokenKey);

                if (userInfo) {
                    try {
                        const userData = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
                        if (userData.name && userData.lastName) {
                            this.userName = `${userData.name} ${userData.lastName}`;
                        }
                    } catch (e) {
                        console.error('Error parsing user info:', e);
                    }
                }

                if (this.profileNameElement) {
                    this.profileNameElement.innerText = this.userName || 'Пользователь';
                }

                await this.loadBalance();
            }

            if (contentBlock) {
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
            }
        }

        // Загружаем компонент
        if (newRoute.load && typeof newRoute.load === 'function') {
            newRoute.load();
        }

        // Инициализируем обработчики подменю
        this.initSubmenuHandlers();
    }
}