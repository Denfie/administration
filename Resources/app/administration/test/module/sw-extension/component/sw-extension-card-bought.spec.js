/* eslint-disable max-len */
import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import 'src/module/sw-extension/component/sw-extension-card-base';
import 'src/module/sw-extension/component/sw-extension-card-bought';
import 'src/module/sw-extension/component/sw-extension-removal-modal';
import 'src/app/component/context-menu/sw-context-menu-item/';
import 'src/app/component/base/sw-modal';
import 'src/app/component/base/sw-button';

import ExtensionErrorService from 'src/module/sw-extension/service/extension-error.service';
import ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import ExtensionStoreActionService from 'src/module/sw-extension/service/extension-store-action.service';
import ExtensionErrorMixin from 'src/module/sw-extension/mixin/sw-extension-error.mixin';
import extensionStore from 'src/module/sw-extension/store/extensions.store';

Shopware.Application.addServiceProvider('loginService', () => {
    return {
        getToken: jest.fn(() => Promise.resolve({ access: true, refresh: true }))
    };
});

const httpClient = {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn()
};

Shopware.Application.getContainer('init').httpClient = httpClient;

const extensionStoreActionService = new ExtensionStoreActionService(
    Shopware.Application.getContainer('init').httpClient,
    Shopware.Service('loginService')
);

Shopware.Application.addServiceProvider('extensionStoreActionService', () => {
    return extensionStoreActionService;
});

Shopware.Application.addServiceProvider('shopwareExtensionService', () => {
    return new ShopwareExtensionService(
        Shopware.Service('appModulesService'),
        Shopware.Service('extensionStoreActionService'),
        Shopware.Service('shopwareDiscountCampaignService')
    );
});

// Added service manually because `sw-extension-error` is using it
Shopware.Application.addServiceProvider('extensionErrorService', () => {
    return new ExtensionErrorService({}, {
        title: 'global.default.error',
        message: 'global.notification.unspecifiedSaveErrorMessage'
    });
});

Shopware.Mixin.register('sw-extension-error', ExtensionErrorMixin);
Shopware.State.registerModule('shopwareExtensions', extensionStore);

function createWrapper(extension) {
    return shallowMount(Shopware.Component.build('sw-extension-card-bought'), {
        propsData: {
            extension
        },
        mocks: {
            $tc: (v1, v2, v3) => (v1 || v2 ? v1 : JSON.stringify([v1, v2, v3]))
        },
        mixins: [
            Shopware.Mixin.getByName('sw-extension-error')
        ],
        stubs: {
            'sw-meteor-card': true,
            'sw-switch-field': true,
            'sw-context-button': true,
            'sw-context-menu': true,
            'sw-loader': true,
            'sw-icon': true,
            'router-link': {
                template: '<div class="sw-router-link"><slot></slot></div>',
                props: ['to']
            },
            'sw-context-menu-item': Shopware.Component.build('sw-context-menu-item'),
            'sw-extension-removal-modal': Shopware.Component.build('sw-extension-removal-modal'),
            'sw-modal': Shopware.Component.build('sw-modal'),
            'sw-button': Shopware.Component.build('sw-button')
        },
        provide: {
            extensionStoreActionService: Shopware.Service('extensionStoreActionService'),
            shopwareExtensionService: Shopware.Service('shopwareExtensionService'),
            extensionErrorService: Shopware.Service('extensionErrorService'),
            cacheApiService: {},
            shortcutService: {
                stopEventListener: () => {},
                startEventListener: () => {}
            }
        }
    });
}

describe('src/module/sw-extension/component/sw-extension-card-base', () => {
    /** @type Wrapper */
    let wrapper;

    beforeAll(() => {
        Shopware.Context.api.assetsPath = '';
        Shopware.Utils.debug.warn = () => {};
    });

    afterEach(async () => {
        if (wrapper) await wrapper.destroy();
    });

    it('should be a Vue.JS component', async () => {
        wrapper = createWrapper({
            id: 1,
            name: 'Sample Extension',
            label: 'Sample Extension Label',
            shortDescription: 'Sample Extension description',
            languages: [],
            rating: 3,
            numberOfRatings: 10,
            installedAt: {
                date: '2021-02-01T03:30:35+01:00'
            },
            storeLicense: {
                id: 1095324,
                creationDate: '2021-02-08T15:47:59.000+01:00',
                variant: 'rent',
                netPrice: 23.75,
                nextBookingDate: '2021-03-08T15:47:59.000+01:00',
                licensedExtension: null,
                extensions: [],
                expirationDate: null,
                subscription: null,
                trialPhaseIncluded: true,
                discountInformation: null
            },
            permissions: {},
            images: [{
                remoteLink: 'https://example.com',
                raw: null,
                extensions: []
            }],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin'
        });
        expect(wrapper.vm).toBeTruthy();
    });

    it('should display the extension information', () => {
        wrapper = createWrapper({
            id: 1,
            name: 'Sample Extension',
            label: 'Sample Extension Label',
            shortDescription: 'Sample Extension description',
            languages: [],
            rating: 3,
            numberOfRatings: 10,
            installedAt: {
                date: '2021-02-01T03:30:35+01:00'
            },
            storeLicense: {
                id: 1095324,
                creationDate: '2021-02-08T15:47:59.000+01:00',
                variant: 'rent',
                netPrice: 23.75,
                nextBookingDate: '2021-03-08T15:47:59.000+01:00',
                licensedExtension: null,
                extensions: [],
                expirationDate: null,
                subscription: null,
                trialPhaseIncluded: true,
                discountInformation: null
            },
            permissions: {},
            icon: 'https://example.com',
            iconRaw: null,
            active: false,
            type: 'plugin'
        });

        expect(wrapper.find('.sw-extension-card-base__info-name')
            .text()).toBe('Sample Extension Label');
        expect(wrapper.find('.sw-extension-card-base__info-description')
            .text()).toBe('Sample Extension description');
        expect(wrapper.find('.sw-extension-card-base__icon')
            .attributes().src).toBe('https://example.com');
        expect(wrapper.find('.sw-extension-card-base__meta-info')
            .text().replace(/\s/g, ''))
            .toBe('sw-extension-store.component.sw-extension-card-base.installedLabel02/01/2021');
    });

    it('should display a placeholder icon and the rent price', () => {
        wrapper = createWrapper({
            id: 1,
            name: 'Sample Extension',
            label: 'Sample Extension Label',
            shortDescription: 'Sample Extension description',
            languages: [],
            rating: 3,
            numberOfRatings: 10,
            installedAt: {
                date: '2021-02-01T03:30:35+01:00'
            },
            storeLicense: {
                variants: [{}]
            },
            permissions: {},
            images: [],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin'
        }, {
            licensedExtension: {
                id: 1,
                variant: 'rent',
                netPrice: 497,
                permissions: []
            }
        }, true);

        expect(wrapper.find('.sw-extension-card-base__info-name')
            .text()).toBe('Sample Extension Label');
        expect(wrapper.find('.sw-extension-card-base__info-description')
            .text()).toBe('Sample Extension description');
        expect(wrapper.find('.sw-extension-card-base__icon')
            .attributes().src).toBe('administration/static/img/theme/default_theme_preview.jpg');
        expect(wrapper.find('.sw-extension-card-base__meta-info')
            .text().replace(/\s/g, ''))
            .toBe('sw-extension-store.component.sw-extension-card-base.installedLabel02/01/2021');
    });

    it('should link to the detail page', () => {
        wrapper = createWrapper({
            id: 1,
            name: 'Sample Extension',
            label: 'Sample Extension Label',
            shortDescription: 'Sample Extension description',
            languages: [],
            rating: 3,
            numberOfRatings: 10,
            installedAt: {
                date: '2021-02-01T03:30:35+01:00'
            },
            storeLicense: {
                variants: [{}]
            },
            permissions: {},
            images: [],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin'
        });

        expect(wrapper.find('.sw-extension-card-bought__detail-link').props().routerLink)
            .toStrictEqual({ name: 'sw.extension.store.detail', params: { id: '1' } });
    });

    it('should link to the detail page with a store extension', () => {
        wrapper = createWrapper({
            id: 1,
            name: 'Sample Extension',
            label: 'Sample Extension Label',
            shortDescription: 'Sample Extension description',
            languages: [],
            rating: 3,
            numberOfRatings: 10,
            installedAt: {
                date: '2021-02-01T03:30:35+01:00'
            },
            storeLicense: {
                variants: [{}]
            },
            storeExtension: {
                id: 5
            },
            permissions: {},
            images: [],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin'
        });

        expect(wrapper.find('.sw-extension-card-bought__detail-link')
            .text()).toBe('sw-extension-store.component.sw-extension-card-base.contextMenu.seeDetailsLabel');
        expect(wrapper.find('.sw-extension-card-bought__detail-link')
            .props().routerLink).toStrictEqual({ name: 'sw.extension.store.detail', params: { id: '5' } });
    });

    it('should open the rating modal', () => {
        expect(wrapper.vm.showRatingModal).toEqual(false);

        expect(wrapper.find('.sw-extension-card-bought__rate-link')
            .text()).toBe('sw-extension-store.component.sw-extension-card-base.contextMenu.rateLabel');
        wrapper.find('.sw-extension-card-bought__rate-link').trigger('click');

        expect(wrapper.vm.showRatingModal).toEqual(true);
    });

    it('should not display the update to button, if there is not a newer version', () => {
        wrapper = createWrapper({
            id: 1,
            name: 'Sample Extension',
            label: 'Sample Extension Label',
            shortDescription: 'Sample Extension description',
            languages: [],
            rating: 3,
            numberOfRatings: 10,
            installedAt: {
                date: '2021-02-01T03:30:35+01:00'
            },
            storeLicense: {
                variants: [{}]
            },
            storeExtension: {
                id: 5
            },
            permissions: {},
            images: [],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin'
        });
    });

    it('should not try to cancel the extension subscription on remove attempt when it already has an expiry date', async () => {
        httpClient.delete.mockImplementation(() => {
            return Promise.resolve();
        });

        const cancelLicenceSpy = jest.spyOn(extensionStoreActionService, 'cancelLicense');
        const removeExtensionSpy = jest.spyOn(extensionStoreActionService, 'removeExtension');

        wrapper = createWrapper({
            id: 1,
            name: 'Sample Extension',
            label: 'Sample Extension Label',
            shortDescription: 'Sample Extension description',
            languages: [],
            rating: null,
            numberOfRatings: 0,
            installedAt: null,
            storeLicense: {
                variants: [{}],
                variant: 'rent',
                // The expiration date is already given before the remove attempt
                expirationDate: '2025-08-01T03:30:35+01:00'
            },
            storeExtension: {
                id: 5
            },
            permissions: {},
            images: [],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin',
            source: 'local'
        });

        // Click remove to open remove modal
        wrapper.get('.sw-extension-card-base__remove-link').trigger('click');

        // Wait for modal to appear
        await wrapper.vm.$nextTick();

        // Check if modal exists
        expect(wrapper.find('.sw-extension-removal-modal').exists()).toBe(true);

        // Perform remove action
        wrapper.get('.sw-extension-removal-modal .sw-button--danger').trigger('click');

        await flushPromises();

        // Wait for modal to close again
        await wrapper.vm.$nextTick();

        // Modal should be closed again
        expect(wrapper.find('.sw-extension-removal-modal').exists()).toBe(false);

        // Canceling the license should NOT be called, remove extension should always always called
        expect(cancelLicenceSpy).toHaveBeenCalledTimes(0);
        expect(removeExtensionSpy).toHaveBeenCalledTimes(1);
        expect(httpClient.delete).toHaveBeenCalledTimes(1);
    });

    it('should try to cancel the extension subscription on remove attempt when it has no expiry date', async () => {
        httpClient.delete.mockImplementation(() => {
            return Promise.resolve({ data: 'foo' });
        });

        const cancelLicenceSpy = jest.spyOn(extensionStoreActionService, 'cancelLicense');
        const removeExtensionSpy = jest.spyOn(extensionStoreActionService, 'removeExtension');

        wrapper = createWrapper({
            id: 1,
            name: 'Sample Extension',
            label: 'Sample Extension Label',
            shortDescription: 'Sample Extension description',
            languages: [],
            rating: null,
            numberOfRatings: 0,
            installedAt: {
                date: '2021-02-01T03:30:35+01:00'
            },
            storeLicense: {
                variants: [{}],
                variant: 'rent',
                expirationDate: null,
                id: '1337'
            },
            storeExtension: {
                id: 5
            },
            permissions: {},
            images: [],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin'
        });

        // Click remove to open remove modal
        wrapper.get('.sw-extension-card-base__cancel-and-remove-link').trigger('click');

        // Wait for modal to appear
        await wrapper.vm.$nextTick();

        // Check if modal exists
        expect(wrapper.find('.sw-extension-removal-modal').exists()).toBe(true);

        // Perform remove action
        wrapper.get('.sw-extension-removal-modal .sw-button--danger').trigger('click');

        await flushPromises();

        // Wait for modal to close again
        await wrapper.vm.$nextTick();

        // Modal should be closed again
        expect(wrapper.find('.sw-extension-removal-modal').exists()).toBe(false);

        // Canceling the license should be called, remove extension should always always called
        expect(cancelLicenceSpy).toHaveBeenCalledTimes(1);
        expect(removeExtensionSpy).toHaveBeenCalledTimes(1);
        expect(httpClient.delete).toHaveBeenCalledTimes(2);
    });
});
