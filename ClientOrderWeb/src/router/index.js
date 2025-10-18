// Router cấu hình cho ứng dụng ClientOrder: định nghĩa các route, vai trò truy cập (meta.roles)
// và guard toàn cục để kiểm tra đăng nhập + phân quyền.
import { createRouter, createWebHistory } from 'vue-router';

// Import các view cần thiết cho 3 màn hình chính
// (các view này được import trực tiếp vì thường dùng trong ứng dụng)
import ClientOrderView from '../views/ClientOrderView.vue';
import OrderDashboardView from '../views/OrderDashboardView.vue';
import OrderCallerView from '../views/OrderCallerView.vue';
import StaffScreenView from '../views/StaffScreenView.vue';
import StaffOrderView from '../views/StaffOrderView.vue';
import StaffOrderManageView from '../views/StaffOrderManageView.vue';
import OrderListView from '../views/manager/OrderListView.vue';
import CompanyManagementView from '../views/manager/CompanyManagementView.vue';
import ShopManagementView from '../views/manager/ShopManagementView.vue';

// Lazy-load LoginView để tối ưu kích thước bundle ban đầu
// -> chỉ tải khi người dùng truy cập /login
const LoginView = () => import('../views/LoginView.vue')

// Khai báo danh sách route của ứng dụng
// - Với các route cần phân quyền, sử dụng meta.roles để liệt kê các vai trò được phép
// - Vai trò hiện có: 'staff' (nhân viên), 'manager' (quản lý)
const routes = [
    // Trang đăng nhập (public, không yêu cầu token)
    { path: '/login', name: 'Login', component: LoginView },

    // Màn hình nhân viên: hiển thị danh sách chức năng cho staff
    {
        path: '/StaffScreen',
        name: 'StaffScreen',
        component: StaffScreenView,
        meta: { roles: ['staff'] }
    },

    // Màn hình gọi món tại quầy: yêu cầu nhân viên/ quản lý
    {
        path: '/ClientOrder',
        name: 'ClientOrder',
        component: ClientOrderView,
        // meta.roles: mảng các vai trò được phép truy cập route này
        meta: { roles: ['staff', 'manager', 'device'] }
    },
    // Bảng điều khiển đơn hàng: yêu cầu nhân viên/ quản lý
    {
        path: '/OrderDashboard',
        name: 'OrderDashboard',
        component: OrderDashboardView,
        meta: { roles: ['staff', 'manager'] }
    },
    // Màn hình gọi số/ thông báo đơn đã xong: yêu cầu nhân viên/ quản lý
    {
        path: '/OrderCaller',
        name: 'OrderCaller',
        component: OrderCallerView,
        meta: { roles: ['staff', 'manager'] }
    },
    // Màn hình đặt món cho nhân viên: yêu cầu nhân viên/ quản lý
    {
        path: '/StaffOrder',
        name: 'StaffOrder',
        component: StaffOrderView,
        meta: { roles: ['staff', 'manager'] }
    },
    // Màn hình quản lý đơn hàng cho nhân viên: yêu cầu nhân viên/ quản lý
    {
        path: '/StaffOrderManage',
        name: 'StaffOrderManage',
        component: StaffOrderManageView,
        meta: { roles: ['staff', 'manager'] }
    },
    // Danh sách đơn hàng (quản lý): chỉ cho phép quản lý truy cập
    {
        path: '/OrderList',
        name: 'OrderList',
        component: OrderListView,
        meta: { roles: ['manager'] }
    },
    // Quản lý công ty: chỉ cho phép quản lý truy cập
    {
        path: '/CompanyManagement',
        name: 'CompanyManagement',
        component: CompanyManagementView,
        meta: { roles: ['manager'] }
    },
    // Quản lý cửa hàng: chỉ cho phép quản lý truy cập
    {
        path: '/ShopManagement',
        name: 'ShopManagement',
        component: ShopManagementView,
        meta: { roles: ['manager'] }
    },

    // Đường dẫn mặc định: chuyển về trang đăng nhập
    { path: '/', redirect: '/login' }
];

// Khởi tạo router sử dụng HTML5 history mode
const router = createRouter({
    history: createWebHistory(),
    routes
});

// Guard toàn cục: chạy trước mỗi lần điều hướng
// Mục tiêu:
// 1) Cho phép vào các trang công khai (ví dụ: /login) mà không cần đăng nhập
// 2) Với các trang cần bảo vệ, yêu cầu có token + thông tin user trong localStorage
// 3) Kiểm tra quyền truy cập theo meta.roles của route đích
//    - Nếu meta.roles có cấu hình và user.role không thuộc danh sách => chuyển về /login
router.beforeEach((to, from, next) => {
    // Danh sách các đường dẫn công khai
    const publicPages = ['/login']

    // Lấy token JWT và thông tin user do AuthService lưu sau khi đăng nhập
    const token = localStorage.getItem('token')
    // Đọc 'user' an toàn, tránh lỗi khi JSON không hợp lệ/không tồn tại
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })()

    // 1) Nếu là trang công khai -> cho phép đi thẳng
    if (publicPages.includes(to.path)) return next()

    // 2) Chưa đăng nhập -> chuyển đến /login và ghi lại đích để quay lại sau khi đăng nhập thành công
    if (!token || !user) return next({ path: '/login', query: { redirect: to.fullPath } })

    // 3) Kiểm tra quyền theo meta.roles (nếu có cấu hình trên route)
    const roles = (to.meta && to.meta.roles) // có thể không có, tránh lỗi khi meta không tồn tại
    if (Array.isArray(roles) && !roles.includes(user.role)) {
        // Không có quyền truy cập route này -> điều hướng về trang đăng nhập
        return next('/login')
    }

    // Thỏa điều kiện -> cho phép điều hướng
    next()
})

export default router;
