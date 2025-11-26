import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from './App';

// Mock the Chatbot and Fleet to simplify integration test
vi.mock('./components/Chatbot', () => ({
  Chatbot: () => <div data-testid="chatbot-mock">Chatbot</div>
}));

// Mock scroll behavior - Cast to any to avoid TS overload mismatch errors during build
window.scrollTo = vi.fn() as any;

describe('App Integration', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders default to English when navigator language is English', () => {
    // Mock navigator.language
    Object.defineProperty(window, 'navigator', {
      value: { language: 'en-US' },
      writable: true
    });

    render(<App />);
    
    // Check for English content
    expect(screen.getByText(/Explore the/i)).toBeInTheDocument();
    expect(screen.getByText(/Costa Blanca/i)).toBeInTheDocument();
    
    // Check Navbar branding
    expect(screen.getByText('BrIAx')).toBeInTheDocument();
    expect(screen.getByText('Wheels')).toBeInTheDocument();
  });

  it('automatically detects Spanish browser language', () => {
     // Mock navigator.language to Spanish
     Object.defineProperty(window, 'navigator', {
      value: { language: 'es-ES' },
      writable: true
    });

    render(<App />);
    
    // Check for Spanish content (auto-detected)
    expect(screen.getByText('Nuestra Flota')).toBeInTheDocument();
    expect(screen.getByText('Explora la')).toBeInTheDocument();
  });

  it('navigates between views', () => {
    // Ensure English for this test
    Object.defineProperty(window, 'navigator', {
      value: { language: 'en-US' },
      writable: true
    });

    render(<App />);
    
    // Ensure we are on Home
    expect(screen.getByText(/Why Choose BrIAx Wheels/i)).toBeInTheDocument();
    
    // Click Contact. 
    // Since we removed language toggle, "Contact & Location" should be unique in the desktop menu (mobile menu hidden)
    const contactLinks = screen.getAllByText('Contact & Location');
    fireEvent.click(contactLinks[0]);
    
    // Check Contact view content
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    
    // Home content should be gone
    expect(screen.queryByText(/Why Choose BrIAx Wheels/i)).not.toBeInTheDocument();
  });
});