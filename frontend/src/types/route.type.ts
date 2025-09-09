export type RouteType = {
    route: string,
    title?: string,
    filePathTemplate?: string,
    useLayout?: string | boolean,
    protected?: boolean,
    load?(): void,
    scripts?: string[],
    styles?: string[],
    unload?: () => void;


}
// Расширяем интерфейс Window для flatpickr
declare global {
    interface Window {
        flatpickr?: any;
    }

    interface HTMLInputElement {
        _flatpickr?: any;
    }
}
