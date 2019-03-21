import { Component } from 'src/core/shopware';
import Criteria from 'src/core/data-new/criteria.data';
import utils from 'src/core/service/util.service';

Component.extend('sw-entity-single-select', 'sw-single-select', {
    inject: ['repositoryFactory', 'context'],

    props: {
        options: {
            required: false,
            type: [Array, Object],
            default() {
                return [];
            }
        },
        entity: {
            required: true,
            type: String
        },

        keyProperty: {
            type: String,
            required: false,
            default: 'id'
        },

        valueProperty: {
            type: String,
            required: false,
            default: 'name'
        }
    },

    data() {
        return {
            silent: false,
            page: 1,
            limit: 10
        };
    },

    methods: {
        createdComponent() {
            this.repository = this.repositoryFactory.create(this.entity);

            this.repository.on('loaded', (result) => {
                if (this.silent) {
                    return;
                }

                this.applyResult(result);
            });

            this.$super.createdComponent();
        },

        resolveKey(key) {
            this.silent = true;

            return this.repository.get(key, this.context).then((item) => {
                this.silent = false;
                return item;
            });
        },

        paginate() {
            this.page += 1;
            this.load();
        },

        applyResult(result) {
            result.forEach((item) => {
                this.currentOptions.push(item);
            });

            this.total = result.total;
            this.page = result.criteria.page;
            this.limit = result.criteria.limit;
        },

        openResultList(event) {
            if (this.isExpanded === false) {
                this.currentOptions = [];
                this.page = 1;

                this.$super.openResultList(event);

                return this.load();
            }

            return this.$super.openResultList(event);
        },

        load() {
            const criteria = new Criteria(this.page, this.limit);
            criteria.setTotalCountMode(0);
            criteria.setTerm(this.searchTerm);

            return this.repository.search(criteria, this.context);
        },

        search: utils.debounce(function debouncedSearch() {
            this.currentOptions = [];
            this.page = 1;
            this.load();
        }, 400)
    }
});
