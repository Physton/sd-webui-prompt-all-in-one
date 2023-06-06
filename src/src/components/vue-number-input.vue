<template>
    <div
        class="vue-number-input"
        :class="{
      'vue-number-input--inline': inline,
      'vue-number-input--center': center,
      'vue-number-input--controls': controls,
      [`vue-number-input--${size}`]: size,
    }"
    >
        <button
            v-if="controls"
            class="vue-number-input__button vue-number-input__button--minus"
            type="button"
            tabindex="-1"
            :disabled="disabled || readonly || !decreasable"
            @click.prevent="decrease"
        />
        <input
            ref="input"
            class="vue-number-input__input"
            v-bind="attrs"
            type="number"
            :name="name"
            :value="isNaN(value) ? '' : value"
            :min="min"
            :max="max"
            :step="step"
            :readonly="readonly || !inputtable"
            :disabled="disabled || (!decreasable && !increasable)"
            :placeholder="placeholder"
            autocomplete="off"
            @change="change"
            @paste="paste"
        >
        <button
            v-if="controls"
            class="vue-number-input__button vue-number-input__button--plus"
            type="button"
            tabindex="-1"
            :disabled="disabled || readonly || !increasable"
            @click.prevent="increase"
        />
    </div>
</template>

<script lang="ts">
/**
 * Author: fengyuanchen
 * Url: https://github.com/fengyuanchen/vue-number-input
 */
import {defineComponent} from 'vue';

const isNaN = Number.isNaN || window.isNaN;
const REGEXP_NUMBER = /^-?(?:\d+|\d+\.\d+|\.\d+)(?:[eE][-+]?\d+)?$/;
const REGEXP_DECIMALS = /\.\d*(?:0|9){10}\d*$/;
const normalizeDecimalNumber = (value: number, times = 100000000000) => (
    REGEXP_DECIMALS.test(String(value)) ? (Math.round(value * times) / times) : value
);

export default defineComponent({
    name: 'VueNumberInput',

    props: {
        attrs: {
            type: Object,
            default: undefined,
        },

        center: Boolean,
        controls: Boolean,
        disabled: Boolean,

        inputtable: {
            type: Boolean,
            default: true,
        },

        inline: Boolean,

        max: {
            type: Number,
            default: Infinity,
        },

        min: {
            type: Number,
            default: -Infinity,
        },

        name: {
            type: String,
            default: undefined,
        },

        placeholder: {
            type: String,
            default: undefined,
        },

        readonly: Boolean,
        rounded: Boolean,

        size: {
            type: String,
            default: undefined,
        },

        step: {
            type: Number,
            default: 1,
        },

        modelValue: {
            type: Number,
            default: NaN,
        },
    },

    emits: [
        'update:modelValue',
    ],

    data() {
        return {
            value: NaN,
        };
    },

    computed: {
        /**
         * Indicate if the value is increasable.
         * @returns {boolean} Return `true` if it is decreasable, else `false`.
         */
        increasable(): boolean {
            return isNaN(this.value) || this.value < this.max;
        },

        /**
         * Indicate if the value is decreasable.
         * @returns {boolean} Return `true` if it is decreasable, else `false`.
         */
        decreasable(): boolean {
            return isNaN(this.value) || this.value > this.min;
        },
    },

    watch: {
        modelValue: {
            immediate: true,
            handler(newValue, oldValue) {
                if (
                    // Avoid triggering change event when created
                    !(isNaN(newValue) && typeof oldValue === 'undefined')

                    // Avoid infinite loop
                    && newValue !== this.value
                ) {
                    this.setValue(newValue);
                }
            },
        },
    },

    methods: {
        isNaN,

        /**
         * Change event handler.
         * @param {string} value - The new value.
         */
        change(event: any) {
            this.setValue(event.target.value);
        },

        /**
         * Paste event handler.
         * @param {Event} event - Event object.
         */
        paste(event: ClipboardEvent) {
            const clipboardData = event.clipboardData || (window as any).clipboardData;

            if (clipboardData && !REGEXP_NUMBER.test(clipboardData.getData('text'))) {
                event.preventDefault();
            }
        },

        /**
         * Decrease the value.
         */
        decrease() {
            if (this.decreasable) {
                let {value} = this;

                if (isNaN(value)) {
                    value = 0;
                }

                this.setValue(normalizeDecimalNumber(value - this.step));
            }
        },

        /**
         * Increase the value.
         */
        increase() {
            if (this.increasable) {
                let {value} = this;

                if (isNaN(value)) {
                    value = 0;
                }

                this.setValue(normalizeDecimalNumber(value + this.step));
            }
        },

        /**
         * Set new value and dispatch change event.
         * @param {number} value - The new value to set.
         */
        setValue(value: number) {
            const oldValue = this.value;
            let newValue = typeof value !== 'number' ? parseFloat(value) : value;

            if (!isNaN(newValue)) {
                if (this.min <= this.max) {
                    newValue = Math.min(this.max, Math.max(this.min, newValue));
                }

                if (this.rounded) {
                    newValue = Math.round(newValue);
                }
            }

            this.value = newValue;

            if (newValue === oldValue) {
                // Force to override the number in the input box (#13).
                (this.$refs.input as HTMLInputElement).value = String(newValue);
            }

            this.$emit('update:modelValue', newValue, oldValue);
        },
    },
});
</script>