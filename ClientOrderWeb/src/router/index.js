import { createRouter, createWebHistory } from 'vue-router';

// Import các view cần thiết
// import HomeView from '../views/HomeView.vue';
import ClientOrderView from '../views/ClientOrderView.vue';
import OrderDashboardView from '../views/OrderDashboardView.vue';
import OrderCallerView from '../views/OrderCallerView.vue';

const routes = [
    {
        path: '/ClientOrder',
        name: 'ClientOrder',
        component: ClientOrderView
    },
    {
        path: '/OrderDashboard',
        name: 'OrderDashboard',
        component: OrderDashboardView
    },
    {
        path: '/OrderCaller',
        name: 'OrderCaller',
        component: OrderCallerView
    }
    // Thêm các route khác tại đây
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
