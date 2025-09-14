<template>
    <BContainer fluid class="min-vh-100 d-flex align-items-center justify-content-center nature-bg">
        <BCard class="p-4" style="max-width:420px; width:100%">
            <h3 class="mb-3 text-center">Đăng nhập</h3>
            
            <!-- Hiển thị device code nếu có -->
            <div v-if="deviceCode" class="alert alert-info mb-3">
                <small><strong>Thiết bị:</strong> {{ deviceCode }}</small>
            </div>
            
            <BForm @submit.prevent="onSubmit">
                <BFormGroup label="Tài khoản" label-for="username">
                    <BFormInput id="username" v-model.trim="username" required autofocus />
                </BFormGroup>
                <BFormGroup label="Mật khẩu" label-for="password" class="mt-2">
                    <BFormInput id="password" type="password" v-model="password" required />
                </BFormGroup>
                <BAlert v-if="error" variant="danger" class="mt-3" show>{{ error }}</BAlert>
                <BButton type="submit" class="w-100 mt-3 btn-nature">Đăng nhập</BButton>
            </BForm>
        </BCard>
    </BContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../services/AuthService.js'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const deviceCode = ref('')

// Lấy deviceCode từ URL param và lưu vào localStorage
onMounted(() => {
    const urlDeviceCode = route.query.deviceCode
    if (urlDeviceCode) {
        deviceCode.value = urlDeviceCode
        localStorage.setItem('deviceCode', urlDeviceCode)
        console.log('Device code from URL:', urlDeviceCode)
    } else {
        // Nếu không có từ URL, thử lấy từ localStorage
        const storedDeviceCode = localStorage.getItem('deviceCode')
        if (storedDeviceCode) {
            deviceCode.value = storedDeviceCode
            console.log('Device code from localStorage:', storedDeviceCode)
        }
    }
})

async function onSubmit() {
    error.value = ''
    try {
        console.log('Attempting login with device code:', deviceCode.value)
        const user = await login(username.value, password.value, deviceCode.value)
        console.log('Login successful, user:', user)

        const redirect = route.query.redirect || '/ClientOrder'
        console.log('Redirecting to:', redirect)

        await router.push(redirect)
        console.log('Navigation completed')
    } catch (e) {
        console.error('Login error:', e)
        error.value = e.message || 'Đăng nhập thất bại'
    }
}
</script>

<style scoped>
/* Optional styling */
</style>
