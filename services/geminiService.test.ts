import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getChatSession } from './geminiService';
import { GoogleGenAI } from '@google/genai';

// Mock the GoogleGenAI SDK
vi.mock('@google/genai', () => {
  const mockChat = {
    sendMessage: vi.fn().mockResolvedValue({ text: 'Mock AI Response' }),
  };
  
  const mockGenerativeModel = {
    startChat: vi.fn().mockReturnValue(mockChat),
  };

  const mockGoogleGenAI = {
    chats: {
      create: vi.fn().mockReturnValue(mockChat)
    }
  };

  return {
    GoogleGenAI: vi.fn(() => mockGoogleGenAI),
  };
});

describe('Gemini Service', () => {
  // Store original process.env
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize GoogleGenAI with the provided key', async () => {
    process.env.API_KEY = 'test-api-key';
    
    // Trigger session creation
    getChatSession('en');
    
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
  });

  it('should create a chat session even if key is missing (graceful handling)', async () => {
    delete process.env.API_KEY;
    
    const chat = getChatSession('en');
    
    // It should still try to create the instance (the SDK might throw later, but our factory shouldn't crash)
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: '' });
    expect(chat).toBeDefined();
  });
});