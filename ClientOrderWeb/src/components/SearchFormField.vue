<template>
    <div class="col-md-6 col-lg-4">
        <BFormGroup :label="label + ':'" label-cols="4" label-align="start" :label-for="fieldId">
            <!-- Select dropdown -->
            <BFormSelect v-if="type === 'select'" :id="fieldId" :model-value="modelValue"
                @update:model-value="$emit('update:modelValue', $event)" :options="options" size="sm" 
                :placeholder="placeholder" />

            <!-- Regular input fields -->
            <BFormInput v-else-if="type !== 'checkbox'" :id="fieldId" :model-value="modelValue"
                @update:model-value="$emit('update:modelValue', $event)" :placeholder="placeholder" :type="type"
                size="sm" />

            <!-- Checkbox group for multiple selections -->
            <div v-else class="d-flex flex-wrap gap-2 checkbox-group">
                <BFormCheckbox v-for="option in options" :key="option.value" :model-value="isChecked(option.value)"
                    @update:model-value="handleCheckboxChange(option.value, $event)" size="sm" class="larger-checkbox">
                    {{ option.text }}
                </BFormCheckbox>
            </div>
        </BFormGroup>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { BFormGroup, BFormInput, BFormSelect, BFormCheckbox } from 'bootstrap-vue-next'

// Props
const props = defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Array],
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    fieldName: {
        type: String,
        required: true
    },
    options: {
        type: Array,
        default: () => []
    }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Computed
const fieldId = computed(() => `search-field-${props.fieldName}`)

// Methods for checkbox handling
const isChecked = (value) => {
    if (Array.isArray(props.modelValue)) {
        return props.modelValue.includes(value)
    }
    return false
}

const handleCheckboxChange = (value, checked) => {
    let newValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []

    if (checked) {
        if (!newValue.includes(value)) {
            newValue.push(value)
        }
    } else {
        newValue = newValue.filter(v => v !== value)
    }

    emit('update:modelValue', newValue)
}
</script>

<style scoped>
/* Làm checkbox và label to hơn */
.checkbox-group :deep(.form-check) {
    margin-bottom: 0;
}

.checkbox-group :deep(.form-check-input) {
    width: 1.2em;
    height: 1.2em;
    margin-right: 0.5rem;
}

.checkbox-group :deep(.form-check-label) {
    font-size: 1rem;
    font-weight: 500;
    color: #495057;
    cursor: pointer;
}

.larger-checkbox :deep(.form-check-input:checked) {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

.larger-checkbox :deep(.form-check-input:focus) {
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>