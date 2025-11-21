import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the Chatbot and Fleet to simplify integration test
vi.mock('./components/Chatbot', () => ({
  Chatbot: () => <div data-testid="chatbot-mock">Chatbot</div>
}));

// Mock scroll behavior
window.scrollTo = vi.fn();

describe('App Integration', () => {
  it('renders the default view (Home) in English', () => {
    render(<App />);
    
    // Check for Hero title part
    expect(screen.getByText(/Explore the/i)).toBeInTheDocument();
    expect(screen.getByText(/Costa Blanca/i)).toBeInTheDocument();
    
    // Check Navbar branding
    expect(screen.getByText('BrIAx')).toBeInTheDocument();
    expect(screen.getByText('Wheels')).toBeInTheDocument();
  });

  it('switches language to Spanish when toggle is clicked', () => {
    render(<App />);
    
    // Initial state check (English)
    expect(screen.getByText('Our Fleet')).toBeInTheDocument();
    
    // FIX: Use getAllByText because 'ES' appears in both Desktop and Mobile menus
    // We select the first one [0] to simulate a user click
    const esButtons = screen.getAllByText('ES');
    fireEvent.click(esButtons[0]);
    
    // Check if text changed to Spanish
    expect(screen.getByText('Nuestra Flota')).toBeInTheDocument();
    expect(screen.getByText('Explora la')).toBeInTheDocument();
  });

  it('navigates between views', () => {
    render(<App />);
    
    // Ensure we are on Home
    expect(screen.getByText(/Why Choose BrIAx Wheels/i)).toBeInTheDocument();
    
    // Click Contact. Using getAllByText to be safe against duplicate links in mobile menu
    const contactLinks = screen.getAllByText('Contact & Location');
    fireEvent.click(contactLinks[0]);
    
    // Check Contact view content
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    
    // Home content should be gone
    expect(screen.queryByText(/Why Choose BrIAx Wheels/i)).not.toBeInTheDocument();
  });
});