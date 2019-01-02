import { Component, State } from 'src/core/shopware';
import template from './sw-condition-sales-channel.html.twig';

/**
 * @public
 * @description TODO: Add description
 * @status prototype
 * @example-type code-only
 * @component-example
 * <sw-condition-sales-channel :condition="condition"></sw-condition-sales-channel>
 */
Component.extend('sw-condition-sales-channel', 'sw-condition-placeholder', {
    template,

    computed: {
        operators() {
            return this.ruleConditionService.operatorSets.multiStore;
        }
    },

    methods: {
        getSalesChannelStore() {
            return State.getStore('sales_channel');
        }
    }
});
