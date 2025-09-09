export type LoginResponseType = {
    error?: boolean;
    message?: string;
    tokens?: {
        accessToken: string;
        refreshToken: string;
    };
    user?: {
        id: number;
        name: string;
        lastName: string;
        email: string;
    };
}