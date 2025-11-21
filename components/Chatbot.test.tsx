import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Chatbot } from './Chatbot';
import * as geminiService from '../services/geminiService';

// Mock the service to prevent actual API calls during component testing
vi.mock('../services/geminiService', () => ({
  sendMessageToGemini: vi.fn(),
}));

// Mock scrollIntoView as it's not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Chatbot Component', () => {
  it('renders correctly but starts closed', () => {
    render(<Chatbot language="en" />);
    
    // The new design uses a launcher card with specific text
    // We search for the button text "Chat with Sol"
    const launcherButtonText = screen.getByText(/Chat with Sol/i);
    expect(launcherButtonText).toBeInTheDocument();
    
    // The chat window content should not be visible yet
    const welcomeMsg = screen.queryByText(/I'm Sol/i);
    expect(welcomeMsg).not.toBeVisible();
  });

  it('opens when the launcher is clicked', async () => {
    render(<Chatbot language="en" />);
    
    // Find the launcher text/button and click it
    const launcherText = screen.getByText(/Chat with Sol/i);
    fireEvent.click(launcherText);
    
    // Welcome message should appear in the chat window
    await waitFor(() => {
      expect(screen.getByText(/I'm Sol/i)).toBeVisible();
    });
  });

  it('sends a message and displays the response', async () => {
    // Mock the service response
    const mockResponse = "I can help you with that.";
    vi.spyOn(geminiService, 'sendMessageToGemini').mockResolvedValue(mockResponse);

    render(<Chatbot language="en" />);
    
    // Open chat by clicking the launcher text
    fireEvent.click(screen.getByText(/Chat with Sol/i));
    
    // Find input and type
    const input = screen.getByPlaceholderText(/Ask about cars/i);
    fireEvent.change(input, { target: { value: 'Do you have SUVs?' } });
    
    // Click send (the submit button inside form is the only button in the open chat view with an svg usually, or we target form submit)
    const inputElement = screen.getByDisplayValue('Do you have SUVs?');
    const form = inputElement.closest('form');
    if (form) fireEvent.submit(form);
    
    // Check if user message is displayed
    expect(screen.getByText('Do you have SUVs?')).toBeInTheDocument();
    
    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(mockResponse)).toBeInTheDocument();
    });
  });

  it('updates launcher text when language changes', () => {
    const { rerender } = render(<Chatbot language="en" />);
    expect(screen.getByText(/Chat with Sol/i)).toBeInTheDocument();

    // Change prop to Spanish
    rerender(<Chatbot language="es" />);
    // Should now see Spanish text
    expect(screen.getByText(/Hablar con Sol/i)).toBeInTheDocument();
  });
});