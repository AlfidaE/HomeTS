import {AuthUtils} from "../utils/auth-utils";
import config from "../../config/config";
import {CustomHttp} from "../utils/custom-http";
import type {SignUpResponseType} from "../types/signUp-response.type";
import type {LoginResponseType} from "../types/login-response.type";

export class SignUp {

    private nameElement: HTMLInputElement;
    private lastNameElement: HTMLInputElement;
    private emailElement: HTMLInputElement;
    private passwordElement: HTMLInputElement;
    private passwordRepeatElement: HTMLInputElement;
    private commonErrorElement: HTMLElement;
    private rememberMeElement: HTMLInputElement;
    private readonly nameErrorElement: HTMLElement;
    private readonly lastNameErrorElement: HTMLElement;
    private readonly emailErrorElement: HTMLElement;
    private readonly passwordErrorElement: HTMLElement;
    private readonly passwordRepeatErrorElement: HTMLElement;
    private readonly openNewRoute: (url: string) => void;

    constructor(openNewRoute: (url: string) => void) {


        // Получаем элементы формы
        this.nameElement = document.getElementById('name') as HTMLInputElement;
        this.lastNameElement = document.getElementById('last-name') as HTMLInputElement;
        this.emailElement = document.getElementById('email') as HTMLInputElement;
        this.passwordElement = document.getElementById('password') as HTMLInputElement;
        this.passwordRepeatElement = document.getElementById('password-repeat') as HTMLInputElement;
        this.commonErrorElement = document.getElementById('common-error') as HTMLInputElement;
        this.rememberMeElement = document.getElementById('remember-me') as HTMLInputElement;


        // Получаем элементы для сообщений об ошибках
        this.nameErrorElement = document.getElementById('name-error') as HTMLInputElement;
        this.lastNameErrorElement = document.getElementById('last-name-error') as HTMLInputElement;
        this.emailErrorElement = document.getElementById('email-error') as HTMLInputElement;
        this.passwordErrorElement = document.getElementById('password-error') as HTMLInputElement;
        this.passwordRepeatErrorElement = document.getElementById('password-repeat-error') as HTMLInputElement;

        // Изначально скрываем все сообщения об ошибках
        this.hideAllErrors();

        // Назначаем обработчик на кнопку
        const processButton: HTMLElement | null = document.getElementById('process-button');
        if (processButton) {
            processButton.addEventListener('click', this.signUp.bind(this));
        }
        this.openNewRoute = openNewRoute;

        if (localStorage.getItem('accessToken')) {
            this.openNewRoute('/');
            return;
        }
    }

    // Метод для скрытия всех сообщений об ошибках
    hideAllErrors(): void {
        this.commonErrorElement.style.display = 'none';
        this.nameErrorElement.style.display = 'none';
        this.lastNameErrorElement.style.display = 'none';
        this.emailErrorElement.style.display = 'none';
        this.passwordErrorElement.style.display = 'none';
        this.passwordRepeatErrorElement.style.display = 'none';

        // Убираем класс is-invalid со всех полей
        this.nameElement.classList.remove('is-invalid');
        this.lastNameElement.classList.remove('is-invalid');
        this.emailElement.classList.remove('is-invalid');
        this.passwordElement.classList.remove('is-invalid');
        this.passwordRepeatElement.classList.remove('is-invalid');
    }


    private validateForm(): boolean {
        let isValid = true;
        this.hideAllErrors(); // Сначала скрываем все ошибки



        // Валидация имени
        if (!this.nameElement.value || !this.nameElement.value.match(/^[А-ЯЁ][а-яё]*(?:[\s-][А-ЯЁ][а-яё]*)*$/)) {
            if (this.nameErrorElement) {
                this.nameErrorElement.style.display = 'block';
            }
            this.nameElement.classList.add('is-invalid');

            const nameInputGroup = this.nameElement.closest('.input-group-text');
            if (nameInputGroup) {
                nameInputGroup.classList.add('invalid');
            }
            isValid = false;


        } else {
            this.nameElement.classList.remove('is-invalid');

            const nameInputGroup = this.nameElement.closest('.input-group-text');
            if (nameInputGroup) {
                nameInputGroup.classList.remove('invalid');
            }
        }

        // Валидация фамилии
        if (!this.lastNameElement.value || !this.lastNameElement.value.match(/^[А-ЯЁ][а-яё]+(?:[-\s][А-ЯЁ][а-яё]+)*$/)) {
            if (this.lastNameErrorElement) {
                this.lastNameErrorElement.style.display = 'block';
            }
            this.lastNameElement.classList.add('is-invalid');

            const lastNameInputGroup = this.lastNameElement.closest('.input-group-text');
            if (lastNameInputGroup) {
                lastNameInputGroup.classList.add('invalid');
            }
            isValid = false;
        } else {
            this.lastNameElement.classList.remove('is-invalid');

            const lastNameInputGroup = this.lastNameElement.closest('.input-group-text');
            if (lastNameInputGroup) {
                lastNameInputGroup.classList.remove('invalid');
            }
        }

        // Валидация email
        const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (!emailRegex.test(this.emailElement.value)) {
            if (this.emailErrorElement) {
                this.emailErrorElement.style.display = 'block';
            }
            this.emailElement.classList.add('is-invalid');

            const emailInputGroup = this.emailElement.closest('.input-group-text');
            if (emailInputGroup) {
                emailInputGroup.classList.add('invalid');
            }
            isValid = false;
        } else {
            this.emailElement.classList.remove('is-invalid');

            const emailInputGroup = this.emailElement.closest('.input-group-text');
            if (emailInputGroup) {
                emailInputGroup.classList.remove('invalid');
            }
        }

// Валидация пароля
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
        if (!passwordRegex.test(this.passwordElement.value)) {
            if (this.passwordErrorElement) {
                this.passwordErrorElement.style.display = 'block';
            }
            this.passwordElement.classList.add('is-invalid');

            const passwordInputGroup = this.passwordElement.closest('.input-group-text');
            if (passwordInputGroup) {
                passwordInputGroup.classList.add('invalid');
            }
            isValid = false;
        } else {
            this.passwordElement.classList.remove('is-invalid');

            const passwordInputGroup = this.passwordElement.closest('.input-group-text');
            if (passwordInputGroup) {
                passwordInputGroup.classList.remove('invalid');
            }
        }

// Валидация подтверждения пароля
        if (this.passwordRepeatElement.value !== this.passwordElement.value) {
            if (this.passwordRepeatErrorElement) {
                this.passwordRepeatErrorElement.style.display = 'block';
            }
            this.passwordRepeatElement.classList.add('is-invalid');

            const passwordRepeatInputGroup = this.passwordRepeatElement.closest('.input-group-text');
            if (passwordRepeatInputGroup) {
                passwordRepeatInputGroup.classList.add('invalid');
            }
            isValid = false;
        } else {
            this.passwordRepeatElement.classList.remove('is-invalid');

            const passwordRepeatInputGroup = this.passwordRepeatElement.closest('.input-group-text');
            if (passwordRepeatInputGroup) {
                passwordRepeatInputGroup.classList.remove('invalid');
            }
        }

        return isValid;
    }

    private async signUp(): Promise<void> {
        this.hideAllErrors();

        if (!this.validateForm()) {
            return;
        }
        try {
            const signupResponse: SignUpResponseType = await CustomHttp.request(config.host + '/signup', 'POST', {
                name: this.nameElement.value.trim(),
                lastName: this.lastNameElement.value.trim(),
                email: this.emailElement.value.trim(),
                password: this.passwordElement.value,
                passwordRepeat: this.passwordRepeatElement.value
            });


            if (!signupResponse || signupResponse.error) {
                throw new Error(signupResponse?.message);
            }

            const loginResponse: LoginResponseType = await CustomHttp.request(config.host + '/login', 'POST', {
                email: this.emailElement.value,
                password: this.passwordElement.value,
                rememberMe: false
            });

            if (!loginResponse || !loginResponse.tokens || !loginResponse.tokens.accessToken) {
                throw new Error(loginResponse?.message);
            }

            AuthUtils.setAuthInfo(
                loginResponse.tokens.accessToken,
                loginResponse.tokens.refreshToken,
                {
                    name: loginResponse.user?.name || this.nameElement.value.trim(),
                    lastName: loginResponse.user?.lastName || this.lastNameElement.value.trim(),
                    id: loginResponse.user?.id || 0,
                    email: this.emailElement.value.trim()
                }
            );
            this.openNewRoute('/');

        } catch (error) {
            this.commonErrorElement.style.display = 'block';
        }
    }
}

