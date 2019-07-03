import { Component } from 'src/core/shopware';
import Criteria from 'src/core/data-new/criteria.data';
import template from './sw-promotion-sales-channel-select.html.twig';

Component.register('sw-promotion-sales-channel-select', {
    template,

    inject: ['repositoryFactory', 'context'],

    props: {
        promotion: {
            type: Object,
            required: false,
            default: null
        }
    },

    data() {
        return {
            salesChannels: []
        };
    },

    computed: {
        salesChannelRepository() {
            return this.repositoryFactory.create('sales_channel');
        },

        promotionSalesChannelRepository() {
            if (this.promotion) {
                return this.repositoryFactory.create(
                    this.promotion.salesChannels.entity,
                    this.promotion.salesChannels.source
                );
            }

            return null;
        },

        salesChannelIds: {
            get() {
                if (!this.promotion) {
                    return [];
                }

                return this.promotion.salesChannels.map((promotionSalesChannels) => {
                    return promotionSalesChannels.salesChannelId;
                });
            },

            set(salesChannelsIds) {
                salesChannelsIds = salesChannelsIds || [];
                const { deleted, added } = this.getChangeset(salesChannelsIds);

                if (this.promotion.isNew()) {
                    this.handleLocalMode(deleted, added);
                    return;
                }

                this.handleWithRepository(deleted, added);
            }
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.salesChannelRepository.search(new Criteria(), this.context).then((searchresult) => {
                this.salesChannels = searchresult;
            });
        },

        getChangeset(salesChannelsIds) {
            const deleted = [];
            const added = [];


            salesChannelsIds.forEach((id) => {
                if (!this.promotion.salesChannels.find((salesChannel) => {
                    return salesChannel.salesChannelId === id;
                })) {
                    added.push(id);
                }
            });

            this.promotion.salesChannels.forEach((salesChannel) => {
                if (!salesChannelsIds.includes(salesChannel.salesChannelId)) {
                    deleted.push(salesChannel.salesChannelId);
                }
            });

            return { deleted, added };
        },

        getAssociationBySalesChannelId(salesChannelId) {
            return this.promotion.salesChannels.find((association) => {
                return association.salesChannelId === salesChannelId;
            });
        },

        handleLocalMode(deleted, added) {
            deleted.forEach((deletedId) => {
                const collectionEntry = this.getAssociationBySalesChannelId(deletedId);
                this.promotion.salesChannels.remove(collectionEntry.id);
            });

            added.forEach((newId) => {
                const newAssociation = this.promotionSalesChannelRepository.create(this.promotion.salesChannels.context);

                newAssociation.salesChannelId = newId;
                newAssociation.promotionId = this.promotion.id;
                newAssociation.priority = 1;
                this.promotion.salesChannels.add(newAssociation);
            });
        },

        handleWithRepository(deleted, added) {
            deleted.forEach((deletedId) => {
                const associationEntry = this.getAssociationBySalesChannelId(deletedId);
                this.promotion.salesChannels.remove(associationEntry.id);
            });

            added.forEach((addedId) => {
                const newAssociation = this.promotionSalesChannelRepository.create(this.promotion.salesChannels.context);

                newAssociation.salesChannelId = addedId;
                newAssociation.promotionId = this.promotion.id;
                newAssociation.priority = 1;
                this.promotion.salesChannels.add(newAssociation);
            });
        }
    }
});
