<template>
    <BCard class="completed-order-tag p-0">
        <!-- Dòng 1: Order ID + nút loa -->
        <div class="fw-bold mb-2 px-3">Order #{{ orderNumber }}</div>

        <!-- Dòng 2: Danh sách món -->
        <div class="order-items mb-3 px-3">
            <BRow v-for="(item, idx) in items" :key="idx" class="py-1 align-items-center justify-content-md-center">
                <BCol cols="6" class="text-truncate">{{ item.name }}</BCol>
                <BCol cols="3" class="text-truncate">x{{ item.quantity }}</BCol>
            </BRow>
            <div v-if="!items || !items.length" class="text-muted small fst-italic">Không có món</div>
        </div>

        <!-- Dòng 3: Nút hành động (ví dụ) -->
        <BRow class="g-2 px-3 pb-3">
            <BCol cols="5">
                <BButton variant="outline-dark" class="w-100" @click="onPrimaryClick">{{ primaryButtonText }}</BButton>
            </BCol>
            <BCol cols="5">
                <BButton variant="outline-success" class="w-100" @click="onSecondaryClick">{{ secondaryButtonText }}
                </BButton>
            </BCol>
            <BCol cols="2">
                <BButton variant="outline-warning" class="d-flex align-items-center gap-1" @click="onAnnounceClick">
                    <i class="bi bi-megaphone-fill"> </i>
                </BButton>
            </BCol>
        </BRow>
    </BCard>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    orderId: { type: [Number, String], required: true },
    orderNumber: { type: [Number, String], required: true },
    items: { type: Array, default: () => [] }, // [{ name, quantity }]
    primaryButtonText: { type: String, default: 'Primary' },
    secondaryButtonText: { type: String, default: 'Secondary' },
})

const emit = defineEmits(['announce', 'primary', 'secondary'])

function onAnnounceClick() {
    emit('announce', props.orderId)
}
function onPrimaryClick() {
    emit('primary', props.orderId)
}
function onSecondaryClick() {
    emit('secondary', props.orderId)
}
</script>

<style scoped>
.completed-order-tag {
    border: 2px solid var(--nature-green-soft);
    border-radius: 10px;
    box-shadow: 0 2px 6px #0001;
}

.order-items {
    max-height: 180px;
}
</style>
