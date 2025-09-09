import {AuthUtils} from "../utils/auth-utils";
import type {LogoutResponseType} from "../types/logout-response.type";


export class Logout {

    private openNewRoute: (url: string) => void;
    constructor(openNewRoute: (url: string) => void) {
        this.openNewRoute = openNewRoute;

        if (!localStorage.getItem('accessToken') || !localStorage.getItem('refreshToken')) {
             this.openNewRoute('/login');
             return;
        }

       this.logout().then;
    }

    public async logout(): Promise<boolean> {

            const response: Response = await fetch('http://localhost:3000/api/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: localStorage.getItem('refreshToken')
                })
            });

            const result: LogoutResponseType | null = await response.json();
        console.log(result);

        AuthUtils.removeAuthInfo();

            this.openNewRoute('/login');
            return true;
    }

}