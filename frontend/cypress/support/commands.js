// ***********************************************
// Custom Cypress Commands
// ***********************************************

const API_URL = Cypress.env('apiUrl') || 'http://localhost:8000'

// LocalStorage keys - MUST match AuthContext.jsx
const TOKEN_KEY = 'budget_car_token'
const USER_KEY = 'budget_car_user'

// Test user credentials
const TEST_USER = {
  email: 'cypress-test@example.com',
  password: 'CypressTest123!',
  name: 'Cypress Test User',
}

/**
 * Register a new test user via API
 */
Cypress.Commands.add('registerTestUser', () => {
  return cy.request({
    method: 'POST',
    url: `${API_URL}/api/register`,
    body: {
      email: TEST_USER.email,
      password: TEST_USER.password,
      first_name: 'Cypress',
      last_name: 'Test',
    },
    failOnStatusCode: false,
  }).then((response) => {
    // User may already exist (409), that's fine
    if (response.status === 200 || response.status === 201 || response.status === 409) {
      return response
    }
    throw new Error(`Failed to register test user: ${response.status}`)
  })
})

/**
 * Login via API and store token in localStorage
 */
Cypress.Commands.add('loginViaApi', (email = TEST_USER.email, password = TEST_USER.password) => {
  return cy.request({
    method: 'POST',
    url: `${API_URL}/api/login`,
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200)
    const { access_token } = response.body
    
    // Store auth data in localStorage (matching AuthContext format)
    window.localStorage.setItem(TOKEN_KEY, access_token)
    // Store basic user info
    window.localStorage.setItem(USER_KEY, JSON.stringify({ email }))
    
    return response.body
  })
})

/**
 * Login via UI
 */
Cypress.Commands.add('loginViaUI', (email = TEST_USER.email, password = TEST_USER.password) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

/**
 * Logout via UI
 */
Cypress.Commands.add('logout', () => {
  // First open the profile dropdown (use first() to handle desktop/mobile duplicates)
  cy.get('.profile-button').first().click()
  // Then click the logout button in the dropdown
  cy.get('[data-testid="logout-btn"]').first().click()
  cy.url().should('not.include', '/dashboard')
})

/**
 * Create a test expense via API
 */
Cypress.Commands.add('createExpense', (expense) => {
  return cy.window().then((win) => {
    const token = win.localStorage.getItem(TOKEN_KEY)
    
    return cy.request({
      method: 'POST',
      url: `${API_URL}/api/transactions`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        type: 'expense',
        amount_cents: expense.amount_cents || 1000,
        category_id: expense.category_id,
        occurred_at: expense.occurred_at || new Date().toISOString(),
        description: expense.description || 'Test expense',
      },
    })
  })
})

/**
 * Get categories via API
 */
Cypress.Commands.add('getCategories', (type = 'expense') => {
  return cy.window().then((win) => {
    const token = win.localStorage.getItem(TOKEN_KEY)
    
    return cy.request({
      method: 'GET',
      url: `${API_URL}/api/categories`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      qs: { type },
    }).then((response) => response.body)
  })
})

/**
 * Seed test data (categories)
 */
Cypress.Commands.add('seedTestData', () => {
  return cy.window().then((win) => {
    const token = win.localStorage.getItem(TOKEN_KEY)
    
    // Create a test category if needed
    return cy.request({
      method: 'POST',
      url: `${API_URL}/api/categories`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        name: 'Cypress Test Category',
        type: 'expense',
      },
      failOnStatusCode: false,
    })
  })
})

/**
 * Get test user credentials
 */
Cypress.Commands.add('getTestUser', () => {
  return cy.wrap(TEST_USER)
})

/**
 * Wait for API to be ready
 */
Cypress.Commands.add('waitForApi', () => {
  cy.request({
    method: 'GET',
    url: `${API_URL}/health`,
    retryOnStatusCodeFailure: true,
    timeout: 30000,
  }).its('status').should('eq', 200)
})
