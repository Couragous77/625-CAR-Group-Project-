/**
 * Test expense create and edit
 * Validate expense create/update functionality
 */

// Helper function to fill expense form
function fillExpenseForm(amount, description = '') {
  // Wait for categories to be loaded (options exist beyond the placeholder)
  cy.get('select#category_id option', { timeout: 10000 }).should('have.length.greaterThan', 1)
  
  // Wait for form to be enabled (not loading)
  cy.get('[data-testid="submit-transaction"]').should('not.be.disabled')
  cy.get('select#category_id').should('not.be.disabled')

  // Fill amount
  cy.get('input#amount').should('not.be.disabled').clear()
  cy.get('input#amount').type(amount)

  // Select first available category using invoke('val') for more reliable selection
  cy.get('select#category_id option').not('[value=""]').first().invoke('val').then((categoryVal) => {
    cy.get('select#category_id').select(categoryVal, { force: true })
  })

  // Fill description if provided
  if (description) {
    cy.get('input#description').should('not.be.disabled').clear()
    cy.get('input#description').type(description)
  }
}

describe('Expense Management', () => {
  beforeEach(() => {
    cy.waitForApi()
    cy.registerTestUser()
    cy.getTestUser().then((user) => {
      cy.loginViaApi(user.email, user.password)
      cy.seedTestData()
    })
  })

  describe('Track Expense Page', () => {
    beforeEach(() => {
      cy.visit('/track-expense')
      // Wait for form to be fully loaded (categories loaded, no spinner)
      cy.get('[data-testid="transaction-form"]', { timeout: 10000 }).should('be.visible')
      cy.get('select#category_id', { timeout: 10000 }).should('be.visible')
    })

    it('should display expense tracking page with form and list', () => {
      // Page title
      cy.contains('Expense Tracker').should('be.visible')

      // Form elements
      cy.contains('Add New Expense').should('be.visible')
      cy.get('input#amount').should('be.visible')
      cy.get('select#category_id').should('be.visible')
      cy.get('input#occurred_at').should('be.visible')

      // Expense list section
      cy.contains('Your Expenses').should('be.visible')
    })

    it('should show validation error for empty amount', () => {
      // Try to submit without amount
      cy.get('[data-testid="submit-transaction"]').click()

      // Should show error
      cy.contains('Amount is required').should('be.visible')
    })

    it('should show validation error when no category selected', () => {
      // Clear amount and type new value
      cy.get('input#amount').clear()
      cy.get('input#amount').type('25.00')
      cy.get('[data-testid="submit-transaction"]').click()

      // Should show category required error
      cy.contains('Category is required').should('be.visible')
    })
  })

  describe('Create Expense', () => {
    beforeEach(() => {
      cy.visit('/track-expense')
      // Wait for form to be fully loaded
      cy.get('[data-testid="transaction-form"]', { timeout: 10000 }).should('be.visible')
      cy.get('select#category_id', { timeout: 10000 }).should('be.visible')
    })

    it('should create a new expense successfully', () => {
      const expenseAmount = '42.50'
      const description = 'Cypress test expense'

      // Intercept API call to track success
      cy.intercept('POST', '**/api/transactions').as('createTransaction')

      // Wait for categories to load
      cy.get('select#category_id option', { timeout: 10000 }).should('have.length.greaterThan', 1)

      // Fill out form
      cy.get('input#amount').clear()
      cy.get('input#amount').type(expenseAmount)

      // Select first available category - ensure we get the value and select it
      cy.get('select#category_id option').not('[value=""]').first().invoke('val').then((categoryVal) => {
        cy.get('select#category_id').select(categoryVal, { force: true })
      })

      // Add description
      cy.get('input#description').type(description)

      // Submit
      cy.get('[data-testid="submit-transaction"]').click()

      // Wait for API response
      cy.wait('@createTransaction').its('response.statusCode').should('be.oneOf', [200, 201])

      // Should show success message
      cy.contains('successfully', { matchCase: false, timeout: 10000 }).should('be.visible')
    })

    it('should clear form after successful creation', () => {
      // Intercept API call
      cy.intercept('POST', '**/api/transactions').as('createTransaction')

      // Wait for categories to load
      cy.get('select#category_id option', { timeout: 10000 }).should('have.length.greaterThan', 1)

      // Fill out form
      cy.get('input#amount').clear()
      cy.get('input#amount').type('15.00')

      // Select first available category
      cy.get('select#category_id option').not('[value=""]').first().invoke('val').then((categoryVal) => {
        cy.get('select#category_id').select(categoryVal, { force: true })
      })

      cy.get('input#description').type('Test description')

      // Submit
      cy.get('[data-testid="submit-transaction"]').click()

      // Wait for API and success message
      cy.wait('@createTransaction').its('response.statusCode').should('be.oneOf', [200, 201])
      cy.contains('successfully', { matchCase: false, timeout: 10000 }).should('be.visible')

      // Form should be cleared
      cy.get('input#amount').should('have.value', '')
      cy.get('input#description').should('have.value', '')
    })

    it('should have max date constraint on date input', () => {
      // The date input has max={getTodayString()} which prevents future dates
      // Verify the max attribute is set to today
      const today = new Date().toISOString().split('T')[0]

      cy.get('input#occurred_at').should('have.attr', 'max', today)
    })

    it('should not allow zero amount', () => {
      // Wait for categories to load
      cy.get('select#category_id option', { timeout: 10000 }).should('have.length.greaterThan', 1)

      // HTML5 min="0" prevents negative, so test zero instead
      cy.get('input#amount').clear()
      cy.get('input#amount').type('0')
      
      // Select first available category
      cy.get('select#category_id option').not('[value=""]').first().invoke('val').then((categoryVal) => {
        cy.get('select#category_id').select(categoryVal, { force: true })
      })

      cy.get('[data-testid="submit-transaction"]').click()

      // Should show amount error
      cy.contains('greater than 0', { matchCase: false }).should('be.visible')
    })
  })

  describe('Create Category', () => {
    beforeEach(() => {
      cy.visit('/track-expense')
      // Wait for form to be fully loaded
      cy.get('[data-testid="transaction-form"]', { timeout: 10000 }).should('be.visible')
      cy.get('select#category_id', { timeout: 10000 }).should('be.visible')
    })

    it('should allow creating a new category', () => {
      const newCategoryName = 'CypressCat' + Date.now()

      // Wait for categories to load first
      cy.get('select#category_id option', { timeout: 10000 }).should('have.length.greaterThan', 1)

      // Click new category button
      cy.contains('+ New Category').click()

      // Wait for the new category input to appear
      cy.get('.new-category-input', { timeout: 5000 }).should('be.visible')

      // Enter category name
      cy.get('input[placeholder="Category name"]').type(newCategoryName)

      // Click add button in the new category input area
      cy.get('.new-category-input').contains('button', 'Add').click()

      // Success message
      cy.contains('Category created', { matchCase: false }).should('be.visible')

      // New category should be selected
      cy.get('select#category_id').should('contain', newCategoryName)
    })
  })

  describe('Edit Expense', () => {
    beforeEach(() => {
      cy.visit('/track-expense')
      // Wait for form to be fully loaded
      cy.get('[data-testid="transaction-form"]', { timeout: 10000 }).should('be.visible')
      cy.get('select#category_id', { timeout: 10000 }).should('be.visible')

      // Use helper to create an expense
      fillExpenseForm('99.99', 'Expense to edit')
      cy.get('[data-testid="submit-transaction"]').click()
      cy.contains('successfully', { matchCase: false, timeout: 10000 }).should('be.visible')

      // Wait for form to reset and be enabled again
      cy.get('[data-testid="submit-transaction"]', { timeout: 10000 }).should('not.be.disabled')

      // Wait for expense to appear in table
      cy.get('button[aria-label="Edit transaction"]', { timeout: 10000 }).should('exist')
    })

    it('should open edit modal when clicking edit button', () => {
      // Click edit button (aria-label="Edit transaction")
      cy.get('button[aria-label="Edit transaction"]').first().click()

      // Modal should open
      cy.get('.modal-overlay').should('be.visible')
      cy.contains('Edit Expense').should('be.visible')

      // Form should be visible in modal
      cy.get('.modal-overlay input#amount').should('exist')
    })

    it('should update expense successfully', () => {
      const updatedAmount = '150.00'
      const updatedDescription = 'Updated expense description'

      // Click edit button
      cy.get('button[aria-label="Edit transaction"]').first().click()

      // Wait for modal
      cy.get('.modal-overlay').should('be.visible')

      // Update amount (in modal)
      cy.get('.modal-overlay input#amount').clear()
      cy.get('.modal-overlay input#amount').type(updatedAmount)

      // Update description (in modal)
      cy.get('.modal-overlay input#description').clear()
      cy.get('.modal-overlay input#description').type(updatedDescription)

      // Submit
      cy.get('.modal-overlay [data-testid="submit-transaction"]').click()

      // Modal should close after success
      cy.get('.modal-overlay', { timeout: 15000 }).should('not.exist')
    })

    it('should close modal on cancel', () => {
      // Click edit
      cy.get('button[aria-label="Edit transaction"]').first().click()

      // Wait for modal
      cy.get('.modal-overlay').should('be.visible')

      // Click cancel
      cy.get('.modal-overlay').contains('button', 'Cancel').click()

      // Modal should close
      cy.get('.modal-overlay').should('not.exist')
    })
  })

  describe('Delete Expense', () => {
    // Each test will create its own expense with a unique description

    it('should show delete confirmation modal', () => {
      cy.visit('/track-expense')
      // Wait for form to be fully loaded
      cy.get('[data-testid="transaction-form"]', { timeout: 10000 }).should('be.visible')
      cy.get('select#category_id', { timeout: 10000 }).should('be.visible')

      // Create an expense first using helper
      fillExpenseForm('55.55')
      cy.get('[data-testid="submit-transaction"]').click()
      cy.contains('successfully', { matchCase: false }).should('be.visible')

      // Wait for a delete button to be available
      cy.get('button[aria-label="Delete transaction"]', { timeout: 10000 }).should('exist')

      // Click delete button
      cy.get('button[aria-label="Delete transaction"]').first().click()

      // Confirmation modal should appear
      cy.contains('Delete Expense').should('be.visible')
      cy.contains('Are you sure').should('be.visible')
    })

    it('should delete expense when confirmed', () => {
      cy.visit('/track-expense')
      // Wait for form to be fully loaded
      cy.get('[data-testid="transaction-form"]', { timeout: 10000 }).should('be.visible')
      cy.get('select#category_id', { timeout: 10000 }).should('be.visible')

      // Intercept the API calls
      cy.intercept('DELETE', '**/api/transactions/**').as('deleteTransaction')
      cy.intercept('GET', '**/api/transactions**').as('getTransactions')

      // Create a new expense to delete using helper
      const uniqueDesc = 'ToDelete' + Date.now()
      fillExpenseForm('11.11', uniqueDesc)
      cy.get('[data-testid="submit-transaction"]').click()
      cy.contains('successfully', { matchCase: false }).should('be.visible')

      // Wait for the transaction list to refresh
      cy.wait('@getTransactions')

      // Wait for expense to appear in the table
      cy.get('.transaction-table').contains(uniqueDesc, { timeout: 10000 }).should('be.visible')

      // Click delete on this specific expense
      cy.get('.transaction-table').contains(uniqueDesc)
        .parents('tr')
        .find('button[aria-label="Delete transaction"]')
        .click()

      // Wait for modal
      cy.get('.modal-overlay').should('be.visible')

      // Click delete
      cy.get('.delete-actions .btn.danger').click()

      // Wait for API to complete
      cy.wait('@deleteTransaction').its('response.statusCode').should('eq', 204)

      // Modal should close automatically now
      cy.get('.modal-overlay', { timeout: 10000 }).should('not.exist')

      // Expense should be gone from the table
      cy.get('.transaction-table').should('not.contain', uniqueDesc)
    })

    it('should not delete expense when cancelled', () => {
      cy.visit('/track-expense')
      // Wait for form to be fully loaded
      cy.get('[data-testid="transaction-form"]', { timeout: 10000 }).should('be.visible')
      cy.get('select#category_id', { timeout: 10000 }).should('be.visible')

      // Create an expense using helper
      const uniqueDesc = 'KeepMe' + Date.now()
      fillExpenseForm('22.22', uniqueDesc)
      cy.get('[data-testid="submit-transaction"]').click()
      cy.contains('successfully', { matchCase: false }).should('be.visible')

      // Wait for expense to appear
      cy.get('.transaction-table').contains(uniqueDesc, { timeout: 10000 }).should('be.visible')

      // Click delete button
      cy.get('.transaction-table').contains(uniqueDesc)
        .parents('tr')
        .find('button[aria-label="Delete transaction"]')
        .click()

      // Wait for modal
      cy.get('.modal-overlay').should('be.visible')

      // Click cancel
      cy.get('.delete-actions .btn.secondary').click()

      // Modal should close
      cy.get('.modal-overlay', { timeout: 5000 }).should('not.exist')

      // Expense should still be there
      cy.get('.transaction-table').contains(uniqueDesc).should('be.visible')
    })
  })

  describe('Expense List Features', () => {
    beforeEach(() => {
      cy.visit('/track-expense')
      // Wait for form and table to load
      cy.get('[data-testid="transaction-form"]', { timeout: 10000 }).should('be.visible')
      cy.get('select#category_id', { timeout: 10000 }).should('be.visible')
      cy.get('.transaction-table').should('exist')
    })

    it('should display transaction table', () => {
      // Table should exist with headers
      cy.get('.transaction-table').should('exist')
      cy.get('th').contains('Date').should('be.visible')
      cy.get('th').contains('Amount').should('be.visible')
      cy.get('th').contains('Category').should('be.visible')
    })

    it('should have a search input for filtering', () => {
      // Create a unique expense first using helper
      const uniqueDesc = 'SearchTest' + Date.now()
      fillExpenseForm('5.55', uniqueDesc)
      cy.get('[data-testid="submit-transaction"]').click()
      cy.contains('successfully', { matchCase: false }).should('be.visible')

      // Wait for expense to appear in table
      cy.get('.transaction-table').contains(uniqueDesc, { timeout: 10000 }).should('be.visible')

      // Search for it
      cy.get('input[type="search"]').should('not.be.disabled')
      cy.get('input[type="search"]').clear()
      cy.get('input[type="search"]').type(uniqueDesc)

      // Should still show the expense
      cy.get('.transaction-table').contains(uniqueDesc, { timeout: 10000 }).should('be.visible')

      // Search for something that doesn't exist
      cy.get('input[type="search"]').clear()
      cy.get('input[type="search"]').type('ZZZZNONEXISTENT')

      // Wait for filter to apply - table should show no results or not contain the unique desc
      cy.wait(500)
      cy.get('.transaction-table').should('not.contain', uniqueDesc)
    })

    it('should filter expenses by category', () => {
      // Verify category filter exists
      cy.get('select[aria-label="Filter by category"]').should('exist')

      // Should have "All Categories" option
      cy.get('select[aria-label="Filter by category"]').find('option').first().should('contain', 'All Categories')
    })

    it('should sort expenses by clicking column headers', () => {
      // Wait for table to be fully loaded
      cy.get('.transaction-table').should('be.visible')
      
      // Click on Amount header to sort by amount
      cy.get('th').contains('Amount').click()

      // Wait for URL to update with sort params
      cy.url().should('include', 'sort_by=amount_cents')
      
      // Amount should now be sorted descending (new column defaults to desc)
      cy.get('th').contains('Amount').should('contain', '▼')

      // Click again to toggle to ascending
      cy.get('th').contains('Amount').click()

      // Wait for URL to update
      cy.url().should('include', 'sort_order=asc')
      
      // Should show ascending indicator
      cy.get('th').contains('Amount').should('contain', '▲')
      
      // Click Date to sort by date
      cy.get('th').contains('Date').click()
      
      // Wait for URL to update
      cy.url().should('include', 'sort_by=occurred_at')
      
      // Date should now be sorted descending
      cy.get('th').contains('Date').should('contain', '▼')
    })
  })
})
