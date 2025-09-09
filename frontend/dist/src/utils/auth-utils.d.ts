import type { UserInfoType } from "../types/user-info.type";
export declare class AuthUtils {
    static accessTokenKey: string;
    private static refreshTokenKey;
    static userInfoTokenKey: string;
    static processUnauthorizedResponse(): Promise<boolean>;
    static setTokens(accessToken: string, refreshToken: string): void;
    static setAuthInfo(accessToken: string, refreshToken: string, userInfo: {
        name: string;
        lastName: string;
        id: number | string;
        email: string;
    }): void;
    static setAuthInfoLogin(accessToken: string, refreshToken: string, userInfo: {
        name: string;
        lastName: string;
        id: number | string;
    }): void;
    static removeAuthInfo(): void;
    static getUserInfo(key?: string | null): UserInfoType;
}
//# sourceMappingURL=auth-utils.d.ts.map