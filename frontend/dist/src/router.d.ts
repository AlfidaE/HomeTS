export declare class Router {
    private readonly titlePageElement;
    readonly contentPageElement: HTMLElement | null;
    readonly stylesLinkElement: HTMLElement | null;
    private profileNameElement;
    private userName;
    private routes;
    constructor();
    private initEvents;
    openNewRoute(url: string): Promise<void>;
    private clickHandler;
    private loadBalance;
    private toggleSubmenu;
    private initSubmenuHandlers;
    activateRoute(e?: Event | null, oldRoute?: string | null): Promise<void>;
}
//# sourceMappingURL=router.d.ts.map