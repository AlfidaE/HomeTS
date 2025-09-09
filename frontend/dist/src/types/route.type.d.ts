export type RouteType = {
    route: string;
    title?: string;
    filePathTemplate?: string;
    useLayout?: string | boolean;
    protected?: boolean;
    load?(): void;
    scripts?: string[];
    styles?: string[];
    unload?: () => void;
};
declare global {
    interface Window {
        flatpickr?: any;
    }
    interface HTMLInputElement {
        _flatpickr?: any;
    }
}
//# sourceMappingURL=route.type.d.ts.map