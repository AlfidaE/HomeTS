import {Chart, PieController, ArcElement, Tooltip, Legend} from 'chart.js';
import flatpickr from "flatpickr";
import {Russian} from "flatpickr/dist/l10n/ru";
import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";

// Регистрация компонентов
Chart.register(PieController, ArcElement, Tooltip, Legend);

interface Operation {
    id: number;
    type: string;
    amount: number;
    date: string;
    comment: string;
    category: string;
    category_id: number;
}

interface FlatpickrInstance {
    open: () => void;
    destroy: () => void;
}

interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string[];
        borderWidth: number;
        borderColor: string;
    }>;
}

export class Home {
    private incomeChart: Chart<'pie'> | null;
    private expenseChart: Chart<'pie'> | null;
    private operations: Operation[];
    private activeFilter: string;
    private startDate: string | null;
    private endDate: string | null;
    private startDatePicker: FlatpickrInstance | null;
    private endDatePicker: FlatpickrInstance | null;

    private readonly incomeColors: string[];
    private readonly expenseColors: string[];

    constructor() {
        this.incomeChart = null;
        this.expenseChart = null;
        this.operations = [];
        this.activeFilter = 'today';
        this.startDate = null;
        this.endDate = null;
        this.startDatePicker = null;
        this.endDatePicker = null;

        this.incomeColors = [
            '#198754', '#20C997', '#0DCAF0', '#0D6EFD', '#6610F2',
            '#6F42C1', '#D63384', '#FD7E14', '#FFC107', '#DC3545',
            '#28a745', '#17a2b8', '#6c757d', '#343a40', '#007bff'
        ];

        this.expenseColors = [
            '#DC3545', '#FD7E14', '#FFC107', '#6F42C1', '#D63384',
            '#6610F2', '#6c757d', '#343a40', '#28a745', '#17a2b8',
            '#0D6EFD', '#0DCAF0', '#20C997', '#198754', '#007bff'
        ];

        this.initDate();
        this.setupEvents();
        this.applyFilter('today');
    }

    private async loadOperations(period: string = 'today', dateFrom: string | null = null, dateTo: string | null = null): Promise<void> {
        try {
            let url = config.host + '/operations';
            const params = new URLSearchParams();

            if (period) {
                params.append('period', period);
            }

            if (dateFrom) {
                params.append('dateFrom', dateFrom);
            }

            if (dateTo) {
                params.append('dateTo', dateTo);
            }

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response: any = await CustomHttp.request(url);

            if (response && Array.isArray(response)) {
                this.operations = response as Operation[];
                this.updateCharts();
            }
        } catch (error) {
            console.error('Ошибка при загрузке операций:', error);
        }
    }

    private groupOperationsByCategory(): { incomeData: { [key: string]: number }; expenseData: { [key: string]: number } } {
        const incomeData: { [key: string]: number } = {};
        const expenseData: { [key: string]: number } = {};

        this.operations.forEach(operation => {
            const categoryName = operation.category || 'Без категории';

            if (operation.type === 'income') {
                if (!incomeData[categoryName]) {
                    incomeData[categoryName] = 0;
                }
                incomeData[categoryName] += operation.amount;
            } else if (operation.type === 'expense') {
                if (!expenseData[categoryName]) {
                    expenseData[categoryName] = 0;
                }
                expenseData[categoryName] += operation.amount;
            }
        });

        return { incomeData, expenseData };
    }

    private updateCharts(): void {
        const { incomeData, expenseData } = this.groupOperationsByCategory();

        // Обновляем диаграмму доходов
        if (this.incomeChart?.data?.datasets?.[0]) {
            this.incomeChart.data.labels = Object.keys(incomeData);
            this.incomeChart.data.datasets[0].data = Object.values(incomeData);
            this.incomeChart.data.datasets[0].backgroundColor = this.getColorsForCategories(Object.keys(incomeData), 'income');
            this.incomeChart.update();
        } else {
            this.initChartIncome(incomeData);
        }

        // Обновляем диаграмму расходов
        if (this.expenseChart?.data?.datasets?.[0]) {
            this.expenseChart.data.labels = Object.keys(expenseData);
            this.expenseChart.data.datasets[0].data = Object.values(expenseData);
            this.expenseChart.data.datasets[0].backgroundColor = this.getColorsForCategories(Object.keys(expenseData), 'expense');
            this.expenseChart.update();
        } else {
            this.initChartExpenses(expenseData);
        }
    }

    private getColorsForCategories(categories: string[], type: 'income' | 'expense'): string[] {
        const colors = type === 'income' ? this.incomeColors : this.expenseColors;
        return categories.map((category, index) => {
            return colors[index % colors.length]!; // ! гарантирует что значение не undefined
        });
    }

    private initChartIncome(incomeData: { [key: string]: number } = {}): void {
        const ctx = document.getElementById('myChart') as HTMLCanvasElement | null;
        if (!ctx) return;

        const labels = Object.keys(incomeData);
        const data = Object.values(incomeData);
        const backgroundColors = this.getColorsForCategories(labels, 'income');

        const chartData: ChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Доходы по категориям',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }
            ]
        };

        this.incomeChart = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context: any) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                return `${label}: $${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            },
        });
    }

    private initChartExpenses(expenseData: { [key: string]: number } = {}): void {
        const ctx = document.getElementById('myChart2') as HTMLCanvasElement | null;
        if (!ctx) return;

        const labels = Object.keys(expenseData);
        const data = Object.values(expenseData);
        const backgroundColors = this.getColorsForCategories(labels, 'expense');

        const chartData: ChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Расходы по категориям',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }
            ]
        };

        this.expenseChart = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context: any) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                return `${label}: $${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            },
        });
    }

    private initDate(): void {
        const startDateElem = document.getElementById("startDate") as HTMLInputElement | null;
        const endDateElem = document.getElementById("endDate") as HTMLInputElement | null;
        const dateRangeSelector = document.querySelector('.date-range-selector');

        if (!startDateElem || !endDateElem || !dateRangeSelector) return;

        this.startDatePicker = flatpickr(startDateElem, {
            locale: Russian,
            dateFormat: "Y-m-d",
            onChange: (selectedDates: Date[], dateStr: string) => {
                const startDateLink = document.getElementById("startDateLink");
                if (startDateLink) {
                    startDateLink.textContent = this.formatDisplayDate(dateStr);
                }
                this.startDate = dateStr;
                if (this.activeFilter === 'interval' && this.startDate && this.endDate) {
                    this.loadOperations('interval', this.startDate, this.endDate);
                }
            }
        }) as unknown as FlatpickrInstance;

        this.endDatePicker = flatpickr(endDateElem, {
            locale: Russian,
            dateFormat: "Y-m-d",
            onChange: (selectedDates: Date[], dateStr: string) => {
                const endDateLink = document.getElementById("endDateLink");
                if (endDateLink) {
                    endDateLink.textContent = this.formatDisplayDate(dateStr);
                }
                this.endDate = dateStr;
                if (this.activeFilter === 'interval' && this.startDate && this.endDate) {
                    this.loadOperations('interval', this.startDate, this.endDate);
                }
            }
        }) as unknown as FlatpickrInstance;

        const startDateLink = document.getElementById("startDateLink");
        const endDateLink = document.getElementById("endDateLink");

        if (startDateLink) {
            startDateLink.addEventListener("click", (e: MouseEvent) => {
                e.preventDefault();
                this.startDatePicker?.open();
            });
        }

        if (endDateLink) {
            endDateLink.addEventListener("click", (e: MouseEvent) => {
                e.preventDefault();
                this.endDatePicker?.open();
            });
        }

        (dateRangeSelector as HTMLElement).style.display = 'none';
    }

    private setupEvents(): void {
        const filterButtons = ['today', 'week', 'month', 'year', 'all', 'interval'];
        filterButtons.forEach(filterId => {
            const button = document.getElementById(filterId);
            if (button) {
                button.addEventListener('click', () => {
                    this.applyFilter(filterId);
                });
            }
        });
    }

    private applyFilter(filterId: string): void {
        this.setActiveFilter(filterId);

        let period = filterId;
        let dateFrom: string | null = null;
        let dateTo: string | null = null;

        if (filterId !== 'interval') {
            const today = new Date();

            switch (filterId) {
                case 'today':
                    dateFrom = today.toISOString().split('T')[0] || '';
                    dateTo = dateFrom;
                    break;
                case 'week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    dateFrom = weekStart.toISOString().split('T')[0] || '';

                    const weekEnd = new Date(today);
                    weekEnd.setDate(today.getDate() + (6 - today.getDay()));
                    dateTo = weekEnd.toISOString().split('T')[0] || '';
                    break;
                case 'month':
                    dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0] || '';
                    dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0] || '';
                    break;
                case 'year':
                    dateFrom = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0] || '';
                    dateTo = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0] || '';
                    break;
                case 'all':
                    dateFrom = null;
                    dateTo = null;
                    break;
            }
        }

        this.loadOperations(period, dateFrom, dateTo);
    }

    private setActiveFilter(filterId: string): void {
        const buttons = document.querySelectorAll('.btn-choice-date');
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });

        const activeButton = document.getElementById(filterId);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        this.activeFilter = filterId;

        const dateRangeSelector = document.querySelector('.date-range-selector');
        if (dateRangeSelector) {
            (dateRangeSelector as HTMLElement).style.display = filterId === 'interval' ? 'block' : 'none';
        }
    }

    private formatDisplayDate(dateString: string): string {
        if (!dateString) return 'Дата';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
}
// import {Chart, PieController, ArcElement, Tooltip, Legend} from 'chart.js';
// import flatpickr from "flatpickr";
// import {Russian} from "flatpickr/dist/l10n/ru";
// import {CustomHttp} from "../utils/custom-http";
// import config from "../../config/config";
// import type {FlatpickrInstance, HomeType} from "../types/home.type";
//
// // Регистрация компонентов
// Chart.register(PieController, ArcElement, Tooltip, Legend);
//
// export class Home {
//     private incomeChart: Chart<'pie'> | null;
//     private expenseChart: Chart<'pie'> | null;
//     private operations: HomeType[];
//     private activeFilter: string;
//     private startDate: string | null;
//     private endDate: string | null;
//     private startDatePicker: FlatpickrInstance | null;
//     private endDatePicker: FlatpickrInstance | null;
//
//     private readonly incomeColors: string[];
//     private readonly expenseColors: string[];
//
//     constructor() {
//         this.incomeChart = null;
//         this.expenseChart = null;
//         this.operations = [];
//         this.activeFilter = 'today';
//         this.startDate = null;
//         this.endDate = null;
//         this.startDatePicker = null;
//         this.endDatePicker = null;
//
//         // Палитры цветов для доходов и расходов
//         this.incomeColors = [
//             '#198754', '#20C997', '#0DCAF0', '#0D6EFD', '#6610F2',
//             '#6F42C1', '#D63384', '#FD7E14', '#FFC107', '#DC3545',
//             '#28a745', '#17a2b8', '#6c757d', '#343a40', '#007bff'
//         ];
//
//         this.expenseColors = [
//             '#DC3545', '#FD7E14', '#FFC107', '#6F42C1', '#D63384',
//             '#6610F2', '#6c757d', '#343a40', '#28a745', '#17a2b8',
//             '#0D6EFD', '#0DCAF0', '#20C997', '#198754', '#007bff'
//         ];
//
//         this.initDate();
//         this.setupEvents();
//         this.applyFilter('today');
//     }
//
//     private async loadOperations(period = null, dateFrom = null, dateTo = null): Promise<void> {
//         try {
//             let url = config.host + '/operations';
//             const params = new URLSearchParams();
//
//             if (period) {
//                 params.append('period', period);
//             }
//
//             if (dateFrom) {
//                 params.append('dateFrom', dateFrom);
//             }
//
//             if (dateTo) {
//                 params.append('dateTo', dateTo);
//             }
//
//             if (params.toString()) {
//                 url += '?' + params.toString();
//             }
//
//             const response = await CustomHttp.request(url);
//
//             if (response && Array.isArray(response)) {
//                 this.operations = response;
//                 this.updateCharts();
//             }
//         } catch (error) {
//             console.error('Ошибка при загрузке операций:', error);
//         }
//     }
//
//     private groupOperationsByCategory(): { incomeData: { [key: string]: number }; expenseData: { [key: string]: number } } {
//         const incomeData: { [key: string]: number } = {};
//         const expenseData: { [key: string]: number } = {};
//
//         this.operations.forEach(operation => {
//             const categoryName = operation.category || 'Без категории';
//
//             if (operation.type === 'income') {
//                 if (!incomeData[categoryName]) {
//                     incomeData[categoryName] = 0;
//                 }
//                 incomeData[categoryName] += operation.amount;
//             } else if (operation.type === 'expense') {
//                 if (!expenseData[categoryName]) {
//                     expenseData[categoryName] = 0;
//                 }
//                 expenseData[categoryName] += operation.amount;
//             }
//         });
//
//         return { incomeData, expenseData };
//     }
//
//     private updateCharts(): void {
//         const { incomeData, expenseData } = this.groupOperationsByCategory();
//
//         // Обновляем диаграмму доходов
//         if (this.incomeChart) {
//             this.incomeChart.data.labels = Object.keys(incomeData);
//             this.incomeChart.data.datasets[0].data = Object.values(incomeData);
//             this.incomeChart.data.datasets[0].backgroundColor = this.getColorsForCategories(Object.keys(incomeData), 'income');
//             this.incomeChart.update();
//         } else {
//             this.initChartIncome(incomeData);
//         }
//
//         // Обновляем диаграмму расходов
//         if (this.expenseChart) {
//             this.expenseChart.data.labels = Object.keys(expenseData);
//             this.expenseChart.data.datasets[0].data = Object.values(expenseData);
//             this.expenseChart.data.datasets[0].backgroundColor = this.getColorsForCategories(Object.keys(expenseData), 'expense');
//             this.expenseChart.update();
//         } else {
//             this.initChartExpenses(expenseData);
//         }
//     }
//
//     // Генерация цветов для категорий
//     private getColorsForCategories(categories: string[], type: 'income' | 'expense'): string[] {
//         const colors = type === 'income' ? this.incomeColors : this.expenseColors;
//         return categories.map((category, index) => {
//             return colors[index % colors.length];
//         });
//     }
//
//     private initChartIncome(incomeData: { [key: string]: number } = {}): void {
//         const ctx = document.getElementById('myChart') as HTMLCanvasElement | null;
//         if (!ctx) return;
//
//         const labels = Object.keys(incomeData);
//         const data = Object.values(incomeData);
//         const backgroundColors = this.getColorsForCategories(labels, 'income');
//
//         const chartData = {
//             labels: labels,
//             datasets: [
//                 {
//                     label: 'Доходы по категориям',
//                     data: data,
//                     backgroundColor: backgroundColors,
//                     borderWidth: 1,
//                     borderColor: '#ffffff'
//                 }
//             ]
//         };
//
//         const config = {
//             type: 'pie',
//             data: chartData,
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: true,
//                 plugins: {
//                     legend: {
//                         position: 'top',
//                     },
//                     tooltip: {
//                         callbacks: {
//                             label: function(context: any) {
//                                 const label = context.label || '';
//                                 const value = context.raw || 0;
//                                 const total = context.dataset.data.reduce((a, b) => a + b, 0);
//                                 const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
//                                 return `${label}: $${value} (${percentage}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//         };
//
//         this.incomeChart = new Chart(ctx, config);
//     }
//
//     initChartExpenses(expenseData = {}) {
//         const ctx = document.getElementById('myChart2');
//         if (!ctx) return;
//
//         const labels = Object.keys(expenseData);
//         const data = Object.values(expenseData);
//         const backgroundColors = this.getColorsForCategories(labels, 'expense');
//
//         const chartData = {
//             labels: labels,
//             datasets: [
//                 {
//                     label: 'Расходы по категориям',
//                     data: data,
//                     backgroundColor: backgroundColors,
//                     borderWidth: 1,
//                     borderColor: '#ffffff'
//                 }
//             ]
//         };
//
//         const config = {
//             type: 'pie',
//             data: chartData,
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: true,
//                 plugins: {
//                     legend: {
//                         position: 'top',
//                     },
//                     tooltip: {
//                         callbacks: {
//                             label: function(context) {
//                                 const label = context.label || '';
//                                 const value = context.raw || 0;
//                                 const total = context.dataset.data.reduce((a, b) => a + b, 0);
//                                 const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
//                                 return `${label}: $${value} (${percentage}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//         };
//
//         this.expenseChart = new Chart(ctx, config);
//     }
//
//     initDate() {
//         const startDateElem = document.getElementById("startDate");
//         const endDateElem = document.getElementById("endDate");
//         const dateRangeSelector = document.querySelector('.date-range-selector');
//
//         if (!startDateElem || !endDateElem || !dateRangeSelector) return;
//
//         this.startDatePicker = flatpickr(startDateElem, {
//             locale: Russian,
//             dateFormat: "Y-m-d",
//             onChange: (selectedDates, dateStr) => {
//                 const startDateLink = document.getElementById("startDateLink");
//                 if (startDateLink) {
//                     startDateLink.textContent = this.formatDisplayDate(dateStr);
//                 }
//                 this.startDate = dateStr;
//                 if (this.activeFilter === 'interval' && this.startDate && this.endDate) {
//                     this.loadOperations('interval', this.startDate, this.endDate);
//                 }
//             }
//         });
//
//         this.endDatePicker = flatpickr(endDateElem, {
//             locale: Russian,
//             dateFormat: "Y-m-d",
//             onChange: (selectedDates, dateStr) => {
//                 const endDateLink = document.getElementById("endDateLink");
//                 if (endDateLink) {
//                     endDateLink.textContent = this.formatDisplayDate(dateStr);
//                 }
//                 this.endDate = dateStr;
//                 if (this.activeFilter === 'interval' && this.startDate && this.endDate) {
//                     this.loadOperations('interval', this.startDate, this.endDate);
//                 }
//             }
//         });
//
//         const startDateLink = document.getElementById("startDateLink");
//         const endDateLink = document.getElementById("endDateLink");
//
//         if (startDateLink) {
//             startDateLink.addEventListener("click", (e) => {
//                 e.preventDefault();
//                 this.startDatePicker.open();
//             });
//         }
//
//         if (endDateLink) {
//             endDateLink.addEventListener("click", (e) => {
//                 e.preventDefault();
//                 this.endDatePicker.open();
//             });
//         }
//
//         dateRangeSelector.style.display = 'none';
//     }
//
//     setupEvents() {
//         const filterButtons = ['today', 'week', 'month', 'year', 'all', 'interval'];
//         filterButtons.forEach(filterId => {
//             const button = document.getElementById(filterId);
//             if (button) {
//                 button.addEventListener('click', () => {
//                     this.applyFilter(filterId);
//                 });
//             }
//         });
//     }
//
//     applyFilter(filterId) {
//         this.setActiveFilter(filterId);
//
//         let period = filterId;
//         let dateFrom = null;
//         let dateTo = null;
//
//         if (filterId !== 'interval') {
//             const today = new Date();
//
//             switch (filterId) {
//                 case 'today':
//                     dateFrom = today.toISOString().split('T')[0];
//                     dateTo = dateFrom;
//                     break;
//                 case 'week':
//                     const weekStart = new Date(today);
//                     weekStart.setDate(today.getDate() - today.getDay());
//                     dateFrom = weekStart.toISOString().split('T')[0];
//
//                     const weekEnd = new Date(today);
//                     weekEnd.setDate(today.getDate() + (6 - today.getDay()));
//                     dateTo = weekEnd.toISOString().split('T')[0];
//                     break;
//                 case 'month':
//                     dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
//                     dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
//                     break;
//                 case 'year':
//                     dateFrom = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
//                     dateTo = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
//                     break;
//                 case 'all':
//                     dateFrom = null;
//                     dateTo = null;
//                     break;
//             }
//         }
//
//         this.loadOperations(period, dateFrom, dateTo);
//     }
//
//     setActiveFilter(filterId) {
//         const buttons = document.querySelectorAll('.btn-choice-date');
//         buttons.forEach(btn => {
//             btn.classList.remove('active');
//         });
//
//         const activeButton = document.getElementById(filterId);
//         if (activeButton) {
//             activeButton.classList.add('active');
//         }
//
//         this.activeFilter = filterId;
//
//         const dateRangeSelector = document.querySelector('.date-range-selector');
//         if (dateRangeSelector) {
//             dateRangeSelector.style.display = filterId === 'interval' ? 'block' : 'none';
//         }
//     }
//
//     formatDisplayDate(dateString) {
//         if (!dateString) return 'Дата';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('ru-RU');
//     }
// }