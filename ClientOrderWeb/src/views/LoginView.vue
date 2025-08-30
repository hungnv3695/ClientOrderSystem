<template>
    <BContainer fluid class="min-vh-100 d-flex align-items-center justify-content-center nature-bg">
        <BCard class="p-4" style="max-width:420px; width:100%">
            <h3 class="mb-3 text-center">Đăng nhập</h3>
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../services/AuthService.js'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')

async function onSubmit() {
    error.value = ''
    try {
        console.log('Attempting login...')
        const user = await login(username.value, password.value)
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
