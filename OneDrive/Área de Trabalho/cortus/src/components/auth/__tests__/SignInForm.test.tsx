import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import SignInForm from '@/components/auth/SignInForm'

describe('SignInForm', () => {
  it('should render email input', () => {
    render(<SignInForm />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    expect(emailInput).toBeInTheDocument()
  })

  it('should render password input', () => {
    render(<SignInForm />)
    const passwordInput = screen.getByPlaceholderText(/senha/i)
    expect(passwordInput).toBeInTheDocument()
  })
})

