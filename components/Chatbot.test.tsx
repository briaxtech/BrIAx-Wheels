import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chatbot } from './Chatbot';

describe('Chatbot Component', () => {
  it('renders the ElevenLabs widget element', () => {
    // Render the component
    const { container } = render(<Chatbot language="en" />);
    
    // Check if the custom element <elevenlabs-convai> is present in the DOM
    // Since it's a custom element, we query by tag name
    const widgetElement = container.querySelector('elevenlabs-convai');
    
    expect(widgetElement).toBeInTheDocument();
    expect(widgetElement).toHaveAttribute('agent-id', 'agent_2701kb02tqnbeyjrxp3rz99z330g');
  });
});