export type RefreshResponseType = {
    error?: boolean;
    message?: string;
    tokens?: {
        accessToken: string;
        refreshToken: string;
    };
}