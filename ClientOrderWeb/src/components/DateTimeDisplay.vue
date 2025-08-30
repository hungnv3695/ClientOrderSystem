<template>
    <span :title="tooltip" :class="className">
        {{ formattedValue }}
    </span>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateTime, formatDate, formatTime, getRelativeTime, isToday } from '../utils/dateTime.js'

// Props
const props = defineProps({
    value: {
        type: [String, Date],
        default: null
    },
    format: {
        type: String,
        default: 'datetime', // datetime, date, time, relative
        validator: (value) => ['datetime', 'date', 'time', 'relative'].includes(value)
    },
    showTooltip: {
        type: Boolean,
        default: true
    },
    highlightToday: {
        type: Boolean,
        default: false
    },
    className: {
        type: String,
        default: ''
    }
})

// Computed
const formattedValue = computed(() => {
    if (!props.value) return ''

    switch (props.format) {
        case 'date':
            return formatDate(props.value)
        case 'time':
            return formatTime(props.value)
        case 'relative':
            return getRelativeTime(props.value)
        case 'datetime':
        default:
            return formatDateTime(props.value)
    }
})

const tooltip = computed(() => {
    if (!props.showTooltip || !props.value) return ''

    // Show full datetime in tooltip when format is not datetime
    if (props.format !== 'datetime') {
        return formatDateTime(props.value)
    }

    // Show relative time in tooltip when format is datetime
    return getRelativeTime(props.value)
})

const computedClassName = computed(() => {
    let classes = props.className

    if (props.highlightToday && isToday(props.value)) {
        classes += ' text-primary fw-bold'
    }

    return classes.trim()
})
</script>

<style scoped>
.text-primary {
    color: var(--bs-primary) !important;
}

.fw-bold {
    font-weight: bold !important;
}
</style>
