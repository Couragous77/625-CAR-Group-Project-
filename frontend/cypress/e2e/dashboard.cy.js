/**
 * Dashboard E2E Tests
 * Validate dashboard functionality
 */

describe('Dashboard', () => {
  beforeEach(() => {
    cy.waitForApi()
    cy.registerTestUser()
    cy.getTestUser().then((user) => {
      cy.loginViaApi(user.email, user.password)
    })
  })

  describe('Dashboard Page', () => {
    beforeEach(() => {
      cy.visit('/dashboard')
    })

    it('should display dashboard with all main sections', () => {
      // Monthly Financial Summary section
      cy.contains('Monthly Financial Summary').should('be.visible')
      
      // Income section
      cy.contains('Income (This Month)').should('be.visible')
      
      // Budget Envelopes section
      cy.contains('Budget Envelopes').should('be.visible')
      
      // Savings Goals section
      cy.contains('Savings Goals').should('be.visible')
      
      // Quick Add Expense section
      cy.contains('Quick Add Expense').should('be.visible')
      
      // Recent Transactions section
      cy.contains('Recent Transactions').should('be.visible')
    })

    it('should display navigation links in header', () => {
      // Check navigation links exist in header
      cy.get('header').within(() => {
        cy.contains('Track Expense').should('exist')
        cy.contains('Track Income').should('exist')
        cy.contains('Dashboard').should('exist')
      })
    })

    it('should navigate to track expense page', () => {
      cy.get('header').contains('Track Expense').click()
      cy.url().should('include', '/track-expense')
    })

    it('should navigate to track income page', () => {
      cy.get('header').contains('Track Income').click()
      cy.url().should('include', '/track-income')
    })

    it('should navigate to profile page from dropdown', () => {
      // Open profile dropdown
      cy.get('.profile-button').first().click()
      // Click Profile link in dropdown
      cy.get('.dropdown-menu').contains('Profile').click()
      cy.url().should('include', '/profile')
    })
  })

  describe('Quick Add Expense Form', () => {
    beforeEach(() => {
      cy.visit('/dashboard')
    })

    it('should have quick add expense form', () => {
      // Quick add form exists with required fields
      cy.contains('Quick Add Expense').should('be.visible')
      cy.get('input#quick-amount').should('be.visible')
      cy.get('select#quick-category').should('be.visible')
      cy.get('input#quick-description').should('be.visible')
      cy.get('button[type="submit"]').contains('Add Expense').should('be.visible')
    })
  })

  describe('Financial Summary', () => {
    beforeEach(() => {
      cy.visit('/dashboard')
    })

    it('should display financial metrics', () => {
      // Should show income, expenses, and net savings
      cy.contains('Total Income').should('be.visible')
      cy.contains('Total Expenses').should('be.visible')
      cy.contains('Net Savings').should('be.visible')
    })

    it('should show currency amounts', () => {
      // Should display dollar amounts
      cy.get('.card').first().should('contain', '$')
    })
  })

  describe('Budget Insights', () => {
    beforeEach(() => {
      cy.visit('/dashboard')
    })

    it('should display budget insights section', () => {
      cy.contains('Budget Insights').should('be.visible')
    })

    it('should display spending chart', () => {
      cy.contains('Spending by Category').should('be.visible')
    })

    it('should display trends chart', () => {
      cy.contains('Spending & Savings Trends').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/dashboard')
    })

    it('should have proper heading hierarchy', () => {
      // h2 headings for main sections
      cy.get('h2').should('have.length.at.least', 1)
    })

    it('should have accessible navigation', () => {
      // Navigation should have proper role or semantic element
      cy.get('nav, [role="navigation"], header').should('exist')
    })

    it('should have aria labels on interactive sections', () => {
      // Dashboard sections should have aria-label
      cy.get('[aria-label="Dashboard overview"]').should('exist')
    })
  })
})
