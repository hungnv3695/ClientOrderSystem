<template>
    <div class="container-fluid min-vh-100">
        <div class="row g-0 h-100">
            <!-- Left: Sidebar -->
            <aside class="col-12 col-md-3 col-lg-2 sidebar">
                <div class="sidebar-header">
                    <h6 class="mb-0 text-white">
                        <i class="bi bi-gear-fill me-2"></i>
                        Quản Lý Hệ Thống
                    </h6>
                </div>
                <nav class="sidebar-nav">
                    <!-- Quản lý đơn hàng -->
                    <div class="nav-section">
                        <div class="nav-section-title">Đơn hàng</div>
                        <RouterLink to="/OrderList" class="nav-link" :class="{ active: isActive('/OrderList') }">
                            <i class="bi bi-receipt me-2"></i>
                            Danh sách đơn hàng
                        </RouterLink>
                    </div>

                    <!-- Quản lý doanh nghiệp -->
                    <div class="nav-section">
                        <div class="nav-section-title">Doanh nghiệp</div>
                        <RouterLink to="/CompanyManagement" class="nav-link"
                            :class="{ active: isActive('/CompanyManagement') }">
                            <i class="bi bi-building me-2"></i>
                            Quản lý công ty
                        </RouterLink>
                        <RouterLink to="/ShopManagement" class="nav-link"
                            :class="{ active: isActive('/ShopManagement') }">
                            <i class="bi bi-shop me-2"></i>
                            Quản lý cửa hàng
                        </RouterLink>
                    </div>

                    <!-- Quản lý khác (disabled for now) -->
                    <div class="nav-section">
                        <div class="nav-section-title">Khác</div>
                        <div class="nav-link disabled">
                            <i class="bi bi-menu-button-wide me-2"></i>
                            Quản lý menu
                        </div>
                        <div class="nav-link disabled">
                            <i class="bi bi-egg-fried me-2"></i>
                            Quản lý món ăn
                        </div>
                        <div class="nav-link disabled">
                            <i class="bi bi-people me-2"></i>
                            Quản lý người dùng
                        </div>
                    </div>
                </nav>
            </aside>

            <!-- Right: Main content -->
            <main class="col-12 col-md-9 col-lg-10 main-content">
                <!-- Header -->
                <header class="content-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h4 class="mb-0 text-primary fw-bold">
                            <slot name="title">Quản lý</slot>
                        </h4>
                    </div>
                </header>

                <!-- Content -->
                <div class="content-body">
                    <slot />
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

// Helper function to check if route is active
const isActive = (path) => {
    return route.path === path
}
</script>

<style scoped>
/* Sidebar Styling */
.sidebar {
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    min-height: 100vh;
    position: sticky;
    top: 0;
    border-right: 3px solid #3498db;
}

.sidebar-header {
    padding: 1.5rem 1rem;
    background: rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
    padding: 1rem 0;
}

.nav-section {
    margin-bottom: 1.5rem;
}

.nav-section-title {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #bdc3c7;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.5rem;
}

.nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: #ecf0f1;
    text-decoration: none;
    transition: all 0.3s ease;
    border-left: 3px solid transparent;
    position: relative;
}

.nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #3498db;
    transform: translateX(2px);
}

.nav-link.active {
    background: rgba(52, 152, 219, 0.2);
    color: #3498db;
    border-left-color: #3498db;
    font-weight: 600;
}

.nav-link.disabled {
    color: #7f8c8d;
    cursor: not-allowed;
}

.nav-link.disabled:hover {
    background: none;
    transform: none;
}

.nav-link i {
    width: 20px;
    text-align: center;
}

/* Main Content */
.main-content {
    background: #f8f9fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.content-header {
    background: white;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
}

.content-body {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
}

.header-actions .badge {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
}

/* Responsive Design */
@media (max-width: 767.98px) {
    .sidebar {
        min-height: auto;
        position: relative;
    }

    .sidebar-header {
        text-align: center;
    }

    .nav-section {
        margin-bottom: 1rem;
    }

    .content-header {
        padding: 1rem;
    }

    .content-body {
        padding: 1rem;
    }
}

/* Icons from Bootstrap Icons */
.bi {
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: -0.125em;
    fill: currentcolor;
}

/* Animation for active state */
.nav-link.active::before {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 30px;
    background: #3498db;
    border-radius: 2px 0 0 2px;
}

/* Badge styling */
.badge {
    font-size: 0.65rem;
    border-radius: 10px;
}
</style>
