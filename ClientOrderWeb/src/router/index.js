import { createRouter, createWebHistory } from 'vue-router';

// Import các view cần thiết
// import HomeView from '../views/HomeView.vue';
import ClientOrderView from '../views/ClientOrderView.vue';
import OrderDashboard from '../views/OrderDashboard.vue';

const routes = [
    {
        path: '/ClientOrder',
        name: 'ClientOrder',
        component: ClientOrderView
    },
    {
        path: '/OrderDashboard',
        name: 'OrderDashboard',
        component: OrderDashboard
    }
    // Thêm các route khác tại đây
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
