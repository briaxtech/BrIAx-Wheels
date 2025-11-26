import React from 'react';

export interface Car {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  passengers: number;
  transmission: 'Automatic' | 'Manual';
  imageUrl: string;
  features: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ViewState {
  HOME = 'HOME',
  FLEET = 'FLEET',
  CONTACT = 'CONTACT'
}

export type Language = 'en' | 'es';

// Add types for Web Speech API and ElevenLabs Widget
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'agent-id': string }, HTMLElement>;
    }
  }
}