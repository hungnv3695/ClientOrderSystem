<template>
    <BModal v-model="isVisible" :title="title" :size="size" :hide-footer="hideFooter" @hidden="handleHidden"
        @show="handleShow">
        <!-- Modal body content -->
        <slot name="body" :form-data="formData" :errors="errors" :loading="loading">
            <!-- Default form layout if no custom body slot provided -->
            <form @submit.prevent="handleSubmit">
                <div class="row g-3">
                    <div v-for="field in fields" :key="field.key" :class="field.colClass || 'col-12'">
                        <BFormGroup :label="field.label + ':'" :label-for="field.key"
                            :invalid-feedback="errors[field.key]" :state="errors[field.key] ? false : null">
                            <!-- Text/Email/Number inputs -->
                            <BFormInput v-if="!field.type || ['text', 'email', 'number', 'tel'].includes(field.type)"
                                :id="field.key" v-model="formData[field.key]" :type="field.type || 'text'"
                                :placeholder="field.placeholder" :disabled="field.disabled || loading"
                                :readonly="field.readonly" :required="field.required" size="sm" />

                            <!-- Date inputs -->
                            <BFormInput v-else-if="field.type === 'date'" :id="field.key" v-model="formData[field.key]"
                                type="date" :disabled="field.disabled || loading" :readonly="field.readonly"
                                :required="field.required" size="sm" />

                            <!-- Textarea -->
                            <BFormTextarea v-else-if="field.type === 'textarea'" :id="field.key"
                                v-model="formData[field.key]" :placeholder="field.placeholder"
                                :disabled="field.disabled || loading" :readonly="field.readonly"
                                :required="field.required" :rows="field.rows || 3" size="sm" />

                            <!-- Select dropdown -->
                            <BFormSelect v-else-if="field.type === 'select'" :id="field.key"
                                v-model="formData[field.key]" :options="field.options"
                                :disabled="field.disabled || loading" :required="field.required" size="sm" />
                        </BFormGroup>
                    </div>
                </div>
            </form>
        </slot>

        <!-- Modal footer -->
        <template #footer v-if="!hideFooter">
            <slot name="footer" :loading="loading" :handle-submit="handleSubmit" :handle-cancel="handleCancel">
                <div class="d-flex gap-2">
                    <BButton variant="primary" @click="handleSubmit" :disabled="loading" size="sm">
                        <BSpinner v-if="loading" small class="me-2" />
                        {{ saveButtonText }}
                    </BButton>
                    <BButton variant="outline-secondary" @click="handleCancel" :disabled="loading" size="sm">
                        {{ cancelButtonText }}
                    </BButton>
                </div>
            </slot>
        </template>
    </BModal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { BModal, BFormGroup, BFormInput, BFormTextarea, BFormSelect, BButton, BSpinner } from 'bootstrap-vue-next'

// Props
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    size: {
        type: String,
        default: 'md' // sm, md, lg, xl
    },
    data: {
        type: Object,
        default: () => ({})
    },
    fields: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    errors: {
        type: Object,
        default: () => ({})
    },
    hideFooter: {
        type: Boolean,
        default: false
    },
    saveButtonText: {
        type: String,
        default: 'Lưu'
    },
    cancelButtonText: {
        type: String,
        default: 'Hủy'
    }
})

// Emits
const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'show', 'hidden'])

// Reactive data
const formData = reactive({})

// Computed
const isVisible = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

// Watch for data changes
watch(() => props.data, (newData) => {
    if (newData) {
        // Clear formData first
        Object.keys(formData).forEach(key => {
            delete formData[key]
        })
        // Copy new data
        Object.assign(formData, { ...newData })
    }
}, { deep: true, immediate: true })

// Methods
const handleSubmit = () => {
    emit('submit', { ...formData })
}

const handleCancel = () => {
    emit('cancel')
    isVisible.value = false
}

const handleShow = () => {
    emit('show')
}

const handleHidden = () => {
    emit('hidden')
    // Clear errors when modal is hidden
    Object.keys(props.errors).forEach(key => {
        delete props.errors[key]
    })
}
</script>

<style scoped>
/* Custom modal styles if needed */
</style>
