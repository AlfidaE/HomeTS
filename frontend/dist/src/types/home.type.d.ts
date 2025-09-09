export type HomeType = {
    id: number;
    type: string;
    amount: number;
    date: string;
    comment: string;
    category: string;
    category_id: number;
};
export type FlatpickrInstance = {
    open: () => void;
    destroy: () => void;
};
export type ChartData = {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string[];
        borderWidth: number;
        borderColor: string;
    }>;
};
//# sourceMappingURL=home.type.d.ts.map