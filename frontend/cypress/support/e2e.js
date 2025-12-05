// ***********************************************************
// E2E Support File
// This file runs before every test file
// ***********************************************************

import './commands'

// Suppress ResizeObserver loop errors (common in React apps)
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  // Allow other errors to fail the test
  return true
})

// Clear localStorage before each test
beforeEach(() => {
  cy.clearLocalStorage()
})
