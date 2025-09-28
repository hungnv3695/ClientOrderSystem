<template>
    <BContainer fluid class="min-vh-100 d-flex align-items-center justify-content-center nature-bg">
        <BCard class="p-4" style="max-width:420px; width:100%">
            <h3 class="mb-3 text-center">Đăng nhập</h3>
                        
            <!-- Hiển thị thông tin nếu URL hợp lệ -->
            <div v-if="shopCode && deviceCode && targetScreen">
                <div class="alert alert-info mb-3">
                    <small>
                        <strong>Cửa hàng:</strong> {{ shopCode }}<br>
                        <strong>Thiết bị:</strong> {{ deviceCode }}<br>
                        <strong>Màn hình đích:</strong> {{ targetScreen }}
                    </small>
                </div>
            </div>
            
            <!-- Cảnh báo URL không hợp lệ -->
            <div v-if="!shopCode || !deviceCode || !targetScreen" class="alert alert-warning mb-3">
                <small><strong>Chú ý:</strong> URL không hợp lệ. Vui lòng sử dụng URL đúng định dạng.</small>
            </div>
            
            <BForm @submit.prevent="onSubmit">
                <BFormGroup label="Tài khoản" label-for="username">
                    <BFormInput 
                        id="username" 
                        v-model.trim="username" 
                        required 
                        autofocus 
                        :disabled="!shopCode || !deviceCode || !targetScreen"
                    />
                </BFormGroup>
                <BFormGroup label="Mật khẩu" label-for="password" class="mt-2">
                    <BFormInput 
                        id="password" 
                        type="password" 
                        v-model="password" 
                        required 
                        :disabled="!shopCode || !deviceCode || !targetScreen"
                    />
                </BFormGroup>
                <BAlert v-if="error" variant="danger" class="mt-3" show>{{ error }}</BAlert>
                <BButton 
                    type="submit" 
                    class="w-100 mt-3 btn-nature" 
                    :disabled="!shopCode || !deviceCode || !targetScreen"
                >
                    {{ (!shopCode || !deviceCode || !targetScreen) ? 'URL không hợp lệ' : 'Đăng nhập' }}
                </BButton>
            </BForm>
        </BCard>
    </BContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login, logout } from '../services/AuthService.js'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const deviceCode = ref('')
const shopCode = ref('')
const targetScreen = ref('')

// Định nghĩa cấu hình cho từng màn hình
const screenConfig = {
    'ClientOrder': {
        path: '/ClientOrder',
        allowedRoles: ['device'],
        name: 'Đặt món'
    },
    'StaffScreen': {
        path: '/StaffScreen',
        allowedRoles: ['staff'], 
        name: 'Màn hình chức năng nhân viên'
    },
}

// Lấy deviceCode, shopCode từ URL param và lưu vào localStorage; target chỉ lấy từ URL
onMounted(() => {
    const urlDeviceCode = route.query.deviceCode
    const urlShopCode = route.query.shopCode
    const urlTarget = route.query.target
    
    if (urlDeviceCode) {
        deviceCode.value = urlDeviceCode
        console.log('Device code from URL:', urlDeviceCode)
    } 
    
    if (urlShopCode) {
        shopCode.value = urlShopCode
        console.log('Shop code from URL:', urlShopCode)
    } 
    
    if (urlTarget) {
        targetScreen.value = urlTarget
        console.log('Target screen from URL:', urlTarget)
    }
    
    // Log trạng thái để debug
    console.log('URL validation status:', {
        shopCode: !!shopCode.value,
        deviceCode: !!deviceCode.value, 
        targetScreen: !!targetScreen.value
    })
})

async function onSubmit() {
    error.value = ''
    
    // Kiểm tra URL hợp lệ
    if (!shopCode.value || !deviceCode.value || !targetScreen.value) {
        error.value = 'URL không hợp lệ. Vui lòng sử dụng URL đúng định dạng.'
        console.error('Invalid URL - missing required parameters')
        return
    }
    
    // Kiểm tra target có hợp lệ không
    if (!screenConfig[targetScreen.value]) {
        error.value = `Target "${targetScreen.value}" không hợp lệ.`
        console.error('Invalid target screen:', targetScreen.value)
        return
    }
    
    try {
        console.log('Attempting login with device code:', deviceCode.value, 'and shop code:', shopCode.value)
        const user = await login(username.value, password.value, deviceCode.value, shopCode.value)
        console.log('Login successful, user:', user)

        // Xác định đường dẫn dựa trên target và role
        const config = screenConfig[targetScreen.value]
        const userRole = user.role
        
        console.log('User role:', userRole, 'Target screen:', targetScreen.value)
        
        // Kiểm tra quyền truy cập
        if (config.allowedRoles.includes(userRole)) {
            const redirectPath = config.path
            console.log('Access granted. Redirecting to:', redirectPath)
            await router.push(redirectPath)
            console.log('Navigation completed to:', redirectPath)
        } else {
            // Không có quyền truy cập -> đăng xuất và xóa session
            logout()
            console.log('Access denied - user logged out automatically')
            
            error.value = `Bạn không có quyền truy cập màn hình "${config.name}".`
            console.error('Access denied for role:', userRole)
            return
        }
    } catch (e) {
        console.error('Login error:', e)
        error.value = e.message || 'Đăng nhập thất bại'
    }
}
</script>

<style scoped>
/* Optional styling */
</style>
