import { Component, Mixin } from 'src/core/shopware';
import template from './sw-media-grid-media-item.html.twig';
import './sw-media-grid-media-item.less';
import domUtils from '../../../../core/service/utils/dom.utils';

Component.register('sw-media-grid-media-item', {
    template,

    mixins: [Mixin.getByName('notification')],

    props: {
        item: {
            required: true,
            type: Object,
            validator(value) {
                return value.type === 'media';
            }
        },

        showSelectionIndicator: {
            required: true,
            type: Boolean
        },

        selected: {
            type: Boolean,
            required: true
        },

        isList: {
            type: Boolean,
            required: false,
            default: false
        },

        showContextMenuButton: {
            type: Boolean,
            required: false,
            default: true
        }
    },

    data() {
        return {
            showModalReplace: false,
            showModalDelete: false,
            isInlineEdit: false
        };
    },

    computed: {
        mediaPreviewClasses() {
            return {
                'is--highlighted': this.selected && this.showSelectionIndicator
            };
        },

        selectedIndicatorClasses() {
            return {
                'selected-indicator--visible': this.showSelectionIndicator
            };
        }
    },

    methods: {
        handleGridItemClick({ originalDomEvent }) {
            if (this.isSelectedIndicatorClicked(originalDomEvent.composedPath())) {
                return;
            }

            this.$emit('sw-media-grid-item-clicked', {
                originalDomEvent,
                item: this.item
            });
        },

        isSelectedIndicatorClicked(path) {
            return path.some((parent) => {
                return parent.classList && parent.classList.contains('sw-media-grid-media-item__selected-indicator');
            });
        },

        doSelectItem(originalDomEvent) {
            if (!this.selected) {
                this.selectItem(originalDomEvent);
                return;
            }

            this.removeFromSelection(originalDomEvent);
        },

        selectItem(originalDomEvent) {
            this.$emit('sw-media-grid-item-selection-add', {
                originalDomEvent,
                item: this.item
            });
        },

        removeFromSelection(originalDomEvent) {
            this.$emit('sw-media-grid-item-selection-remove', {
                originalDomEvent,
                item: this.item
            });
        },

        emitPlayEvent(originalDomEvent) {
            if (!this.selected) {
                this.$emit('sw-media-grid-item-play', {
                    originalDomEvent,
                    item: this.item
                });
                return;
            }

            this.removeFromSelection(originalDomEvent);
        },

        showItemDetails(originalDomEvent) {
            this.$emit('sw-media-grid-media-item-show-details', {
                originalDomEvent,
                item: this.item
            });
        },

        copyItemLink() {
            domUtils.copyToClipboard(this.item.url);
        },

        openModalDelete() {
            this.showModalDelete = true;
        },

        closeModalDelete() {
            this.showModalDelete = false;
        },

        emitItemDeleted(deletePromise) {
            this.closeModalDelete();
            deletePromise.then(() => {
                this.$emit('sw-media-grid-media-item-delete');
            });
        },

        openModalReplace() {
            this.showModalReplace = true;
        },

        closeModalReplace() {
            this.showModalReplace = false;
        },

        startInlineEdit() {
            this.isInlineEdit = true;
        },

        endInlineEdit() {
            this.isInlineEdit = false;
        },

        updateName() {
            const inputField = this.$refs.inputItemName;

            if (inputField.currentValue === null || inputField.currentValue === '') {
                this.createNotificationError({
                    message: this.$tc('global.sw-media-grid-media-item.notificationErrorBlankItemName')
                });
                return;
            }

            this.item.isLoading = true;
            this.item.name = inputField.currentValue;

            this.item.save().then(() => {
                this.item.isLoading = false;
                this.createNotificationSuccess({
                    message: this.$tc('global.sw-media-grid-media-item.notificationRenamingSuccess')
                });
                this.endInlineEdit();
            }).catch(() => {
                this.item.isLoading = false;
                this.createNotificationError({
                    message: this.$tc('global.sw-media-grid-media-item.notificationRenamingError')
                });
            });
        }
    }
});
