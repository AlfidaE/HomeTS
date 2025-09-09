import {AuthUtils} from "../utils/auth-utils";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";
import type {LoginResponseType} from "../types/login-response.type";

export class Login {
    private readonly emailElement: HTMLInputElement | null;
    private readonly passwordElement: HTMLInputElement | null;
    private readonly rememberMeElement: HTMLInputElement | null;
    private readonly commonErrorLoginElement: HTMLInputElement | null;
    private readonly emailErrorElement: HTMLInputElement | null;
    private readonly passwordErrorElement: HTMLInputElement | null;

    private readonly openNewRoute: (url: string) => void;

    constructor(openNewRoute: (url: string) => void) {

        this.emailElement = document.getElementById('email') as HTMLInputElement;
        this.passwordElement = document.getElementById('password') as HTMLInputElement;
        this.rememberMeElement = document.getElementById('remember-me') as HTMLInputElement;
        this.commonErrorLoginElement = document.getElementById('common-error-login') as HTMLInputElement;
        this.emailErrorElement = document.getElementById('email-error') as HTMLInputElement;
        this.passwordErrorElement = document.getElementById('password-error') as HTMLInputElement;

        this.hideAllErrors();

        const processButton = document.getElementById('process-button');
        if (processButton) {
            processButton.addEventListener('click', this.login.bind(this));
        }
        this.openNewRoute = openNewRoute;

        if (localStorage.getItem(AuthUtils.accessTokenKey)) {
            this.openNewRoute('/');
            return;
        }

    }

    private hideAllErrors(): void {
        if (this.emailErrorElement) {
            this.emailErrorElement.style.display = 'none';
        }
        if (this.passwordErrorElement) {
            this.passwordErrorElement.style.display = 'none';
        }
        if (this.emailElement) {
            this.emailElement.classList.remove('is-invalid');
        }
        if (this.passwordElement) {
            this.passwordElement.classList.remove('is-invalid');
        }

    }

    private validateForm(): boolean {
        let isValid: boolean = true;
        this.hideAllErrors();

        if (!this.emailElement || !this.passwordElement) {
            return false;
        }
        const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (!emailRegex.test(this.emailElement.value)) {
            if (this.emailErrorElement) {
                this.emailErrorElement.style.display = 'block';
            }
            this.emailElement.classList.add('is-invalid');
            isValid = false;
        }

        // Валидация пароля
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
        if (!passwordRegex.test(this.passwordElement.value)) {
            if (this.passwordErrorElement) {
                this.passwordErrorElement.style.display = 'block';
            }
                this.passwordElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    private async login(): Promise<void> {
        if (!this.commonErrorLoginElement || !this.emailElement || !this.passwordElement || !this.rememberMeElement) {
            return;
        }

        this.commonErrorLoginElement.style.display = 'none';
        this.hideAllErrors();

        if (this.validateForm()) {

            try {
                const result: LoginResponseType = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: this.emailElement.value,
                    password: this.passwordElement.value,
                    rememberMe: this.rememberMeElement.checked
                }) as LoginResponseType;


                if (!result ||
                    result?.error ||
                    !result?.tokens?.accessToken ||
                    !result?.tokens?.refreshToken ||
                    !result?.user?.id ||
                    !result?.user?.name ||
                    !result?.user?.lastName) {
                    if (this.commonErrorLoginElement) {
                        this.commonErrorLoginElement.style.display = 'block';
                    }
                    return;
                }

                AuthUtils.setAuthInfoLogin(result.tokens.accessToken, result.tokens.refreshToken, {
                    name: result.user.name,
                    lastName: result.user.lastName,
                    id: result.user.id
                });

            this.openNewRoute('/');
        } catch (error) {
                console.error('Login error:', error);
                this.commonErrorLoginElement.style.display = 'block';
            }
        }
    }

}