import { Mixin } from 'src/core/shopware';
import SwBaseField from '../field-base/sw-base-field/index';
import template from './sw-checkbox-field.html.twig';
import './sw-checkbox-field.scss';

/**
 * @public
 * @description Boolean input field based on checkbox.
 * @status ready
 * @example-type static
 * @component-example
 * <sw-checkbox-field label="Name" v-model="aBooleanProperty"></sw-checkbox-field>
 */
export default {
    name: 'sw-checkbox-field',
    template,
    extends: SwBaseField,
    inheritAttrs: false,

    model: {
        prop: 'value',
        event: 'change'
    },

    mixins: [
        Mixin.getByName('sw-form-field')
    ],

    props: {
        value: {
            type: Boolean,
            required: false,
            default: null
        }
    },

    data() {
        return {
            currentValue: this.value
        };
    },

    computed: {
        swCheckboxFieldClasses() {
            return {
                ...this.swFieldClasses
            };
        },

        inputState() {
            if (this.isInherited) {
                return this.inheritedValue;
            }

            return this.currentValue || false;
        }
    },

    watch: {
        value() { this.currentValue = this.value; }
    },

    methods: {
        onChange(changeEvent) {
            this.$emit('change', changeEvent.target.checked);
        },

        onClickRestoreInheritance() {
            this.$emit('change', null);
        }
    }
};
