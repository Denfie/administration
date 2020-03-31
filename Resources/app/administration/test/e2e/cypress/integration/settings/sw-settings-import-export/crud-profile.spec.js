describe('Import/Export - Profiles: Test crud operations', () => {
    beforeEach(() => {
        cy.setToInitialState().then(() => {
            cy.loginViaApi();
        }).then(() => {
            return cy.createDefaultFixture('import-export-profile');
        }).then(() => {
            cy.openInitialPage(`${Cypress.env('admin')}#/sw/import-export/index/profiles`);
        });
    });

    it('@settings: Create and read profile', () => {
        // Request we want to wait for later
        cy.server();
        cy.route({
            url: '/api/v1/import-export-profile',
            method: 'post'
        }).as('saveData');

        cy.get('.sw-import-export-view-profiles__toolbar').should('be.visible');

        // Perform create new profile action
        cy.get('.sw-import-export-view-profiles__create-action').click();

        // Expect modal to be displayed and add mapping button to be disabled first
        cy.get('.sw-import-export-edit-profile-modal').should('be.visible');
        cy.get('.sw-import-export-edit-profile-modal-mapping').should('be.visible');
        cy.get('.sw-import-export-edit-profile-modal-mapping__add-action').should('be.disabled');

        // Fill in name and object type
        cy.get('[name="sw-field--profile-name"]').type('Basic');
        cy.get('.sw-import-export-edit-profile-modal__object-type-select')
            .typeSingleSelectAndCheck('Product', '.sw-import-export-edit-profile-modal__object-type-select');

        // Perform add new mapping
        cy.get('.sw-import-export-edit-profile-modal-mapping__add-action').click();

        // Expect a new grid row to be visible
        cy.get('.sw-data-grid__row--0').should('be.visible');

        // Fill in mapping
        cy.get('.sw-data-grid__row--0 [name="mappedKey-0"]').type('id');
        cy.get('.sw-import-export-entity-path-select')
            .typeSingleSelectAndCheck('id', '.sw-import-export-entity-path-select');

        // Save the profile
        cy.get('.sw-import-export-edit-profile-modal__save-action').click();

        // Save request should be successful
        cy.wait('@saveData').then((xhr) => {
            expect(xhr).to.have.property('status', 204);
        });

        // Verify that created profile is inside profile listing
        cy.get('.sw-import-export-view-profiles__search input[type="text"]').type('Basic');
        cy.get('.sw-data-grid__row--0').should('contain', 'Basic');
    });
});
