/**
 * Test login and logout
 * Validate core auth paths
 */

describe('Authentication', () => {
  beforeEach(() => {
    cy.waitForApi()
  })

  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login')
    })

    it('should display login form with all required elements', () => {
      // Check page elements
      cy.contains('Log in').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible').contains('Log in')

      // Check links
      cy.contains('Forgot password?').should('be.visible')
      cy.contains('Create an account').should('be.visible')
    })

    it('should show validation errors for empty form submission', () => {
      cy.get('button[type="submit"]').click()

      // Form should show errors (HTML5 validation or custom)
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('should show error for invalid email format', () => {
      // HTML5 email validation will show browser's native invalid state
      // for emails without @ symbol
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()

      // The input should be in invalid state (HTML5 validation)
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('should show error for short password', () => {
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('123')
      cy.get('button[type="submit"]').click()

      // Should show password error
      cy.contains('at least 6 characters').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.get('input[name="email"]').type('nonexistent@example.com')
      cy.get('input[name="password"]').type('wrongpassword123')
      cy.get('button[type="submit"]').click()

      // Should show login error message (wait for API response)
      cy.get('[data-testid="login-error"], .error[role="alert"]', { timeout: 15000 }).should('be.visible')
    })

    it('should toggle password visibility', () => {
      const password = 'testpassword'
      cy.get('input[name="password"]').type(password)

      // Password should be hidden by default
      cy.get('input[name="password"]').should('have.attr', 'type', 'password')

      // Click toggle button
      cy.get('[aria-label*="password"], button[class*="password"]').click()

      // Password should now be visible
      cy.get('input[name="password"]').should('have.attr', 'type', 'text')
    })

    it('should navigate to register page', () => {
      cy.contains('Create an account').click()
      cy.url().should('include', '/register')
    })

    it('should navigate to forgot password page', () => {
      cy.contains('Forgot password?').click()
      cy.url().should('include', '/forgot-password')
    })
  })

  describe('Successful Login Flow', () => {
    before(() => {
      // Ensure test user exists
      cy.registerTestUser()
    })

    it('should login successfully with valid credentials', () => {
      cy.getTestUser().then((user) => {
        cy.visit('/login')
        cy.get('input[name="email"]').type(user.email)
        cy.get('input[name="password"]').type(user.password)
        cy.get('button[type="submit"]').click()

        // Should redirect to dashboard
        cy.url().should('include', '/dashboard')

        // Should show user is logged in (header shows user info or logout)
        cy.contains('Dashboard').should('be.visible')
      })
    })

    it('should persist login across page refresh', () => {
      cy.getTestUser().then((user) => {
        // Login via API for speed
        cy.loginViaApi(user.email, user.password)

        // Visit dashboard
        cy.visit('/dashboard')
        cy.url().should('include', '/dashboard')

        // Refresh page
        cy.reload()

        // Should still be on dashboard
        cy.url().should('include', '/dashboard')
      })
    })
  })

  describe('Logout Flow', () => {
    beforeEach(() => {
      cy.registerTestUser()
      cy.getTestUser().then((user) => {
        cy.loginViaApi(user.email, user.password)
      })
    })

    it('should logout successfully', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')

      // Click logout (in header/nav)
      cy.logout()

      // Should be redirected to login or landing
      cy.url().should('not.include', '/dashboard')
    })

    it('should clear auth token on logout', () => {
      cy.visit('/dashboard')

      // Verify token exists (using the key from AuthContext)
      cy.window().then((win) => {
        expect(win.localStorage.getItem('budget_car_token')).to.not.be.null
      })

      // Logout
      cy.logout()

      // Token should be cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('budget_car_token')).to.be.null
      })
    })

    it('should redirect to login when accessing protected route after logout', () => {
      cy.visit('/dashboard')
      cy.logout()

      // Try to access protected route
      cy.visit('/dashboard')

      // Should redirect to login
      cy.url().should('include', '/login')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from dashboard to login', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should redirect unauthenticated users from track-expense to login', () => {
      cy.visit('/track-expense')
      cy.url().should('include', '/login')
    })

    it('should redirect unauthenticated users from profile to login', () => {
      cy.visit('/profile')
      cy.url().should('include', '/login')
    })

    it('should redirect authenticated users from login to dashboard', () => {
      cy.registerTestUser()
      cy.getTestUser().then((user) => {
        cy.loginViaApi(user.email, user.password)
        cy.visit('/login')
        cy.url().should('include', '/dashboard')
      })
    })
  })

  describe('Registration', () => {
    it('should display registration form', () => {
      cy.visit('/register')

      cy.contains('Create account', { matchCase: false }).should('be.visible')
      cy.get('input[name="firstName"]').should('be.visible')
      cy.get('input[name="lastName"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
    })

    it('should show validation errors for incomplete registration', () => {
      cy.visit('/register')
      cy.get('button[type="submit"]').click()

      // Should show validation errors
      cy.get('input:invalid').should('exist')
    })
  })
})
