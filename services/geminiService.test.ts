import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getChatSession } from './geminiService';
import { GoogleGenAI } from '@google/genai';

// Mock the GoogleGenAI SDK class structure
vi.mock('@google/genai', () => {
  const mockChat = {
    sendMessage: vi.fn().mockResolvedValue({ text: 'Mock AI Response' }),
  };
  
  // Helper to simulate GoogleGenAI instance
  const MockGoogleGenAI = vi.fn().mockImplementation(() => ({
     chats: {
       create: vi.fn().mockReturnValue(mockChat)
     }
  }));

  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

describe('Gemini Service', () => {
  // Spy on console to prevent noise in test output
  const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    // Use stubEnv for safe environment variable mocking in Vitest
    vi.stubEnv('API_KEY', 'test-key-123');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should initialize GoogleGenAI with the provided key', () => {
    // We trigger a new session by requesting 'en' language
    // logic in geminiService will read process.env.API_KEY
    getChatSession('en');
    
    // Verify the SDK was initialized with the stubbed key
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-key-123' });
  });

  it('should create a chat session successfully', () => {
     const chat = getChatSession('en');
     expect(chat).toBeDefined();
  });

  it('should warn if API key is missing (defensive coding)', () => {
    // Remove the key for this specific test
    vi.stubEnv('API_KEY', '');
    
    // Force session recreation by switching language
    getChatSession('es'); 
    
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('API Key is missing'));
  });
});