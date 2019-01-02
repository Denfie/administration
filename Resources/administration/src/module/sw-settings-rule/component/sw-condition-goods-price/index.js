import { Component } from 'src/core/shopware';
import template from './sw-condition-goods-price.html.twig';

/**
 * @public
 * @description TODO: Add description
 * @status prototype
 * @example-type code-only
 * @component-example
 * <sw-condition-goods-price :condition="condition"></sw-condition-goods-price>
 */
Component.extend('sw-condition-goods-price', 'sw-condition-placeholder', {
    template,

    computed: {
        operators() {
            return this.ruleConditionService.operatorSets.number;
        },
        fieldNames() {
            return ['operator', 'amount'];
        }
    }
});
