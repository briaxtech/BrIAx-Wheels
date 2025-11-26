import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { translations } from '../translations';

interface ChatbotProps {
  language: Language;
}

export const Chatbot: React.FC<ChatbotProps> = ({ language }) => {
  const t = translations[language].chatbot;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Reset messages when language changes
  useEffect(() => {
      setMessages([
        { role: 'model', text: t.welcome, timestamp: new Date() }
      ]);
  }, [language, t.welcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Voice Recognition Logic
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      // Auto-send after voice
      setTimeout(() => handleSend(undefined, transcript, true), 500);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Text to Speech Logic (Female Voice Priority)
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    
    // Logic to find a female voice ("Sol")
    const targetLang = language === 'es' ? 'es' : 'en';
    
    const preferredVoice = voices.find(v => 
      v.lang.includes(targetLang) && 
      (
        v.name.includes('Google') ||   
        v.name.includes('Samantha') || 
        v.name.includes('Monica') ||   
        v.name.includes('Paulina') ||  
        v.name.includes('Helena') ||   
        v.name.includes('Zira')        
      )
    );

    const fallbackVoice = voices.find(v => v.lang.includes(targetLang));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    } else if (fallbackVoice) {
      utterance.voice = fallbackVoice;
    }

    utterance.pitch = 1.1;
    utterance.rate = 1.05; 

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent, overrideText?: string, wasVoice: boolean = false) => {
    e?.preventDefault();
    const textToSend = overrideText || inputText;
    
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const responseText = await sendMessageToGemini(userMsg.text, language);

    const modelMsg: ChatMessage = {
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);

    if (wasVoice) {
      speakResponse(responseText);
    }
  };

  return (
    <>
      {/* Launcher Card (Visible when Closed) */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
          <div 
            onClick={() => setIsOpen(true)}
            role="button"
            aria-label={t.launcherButton}
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setIsOpen(true)}
            className="bg-white p-4 md:p-5 rounded-[24px] md:rounded-[32px] shadow-2xl border border-slate-100 flex items-center cursor-pointer hover:scale-105 transition-transform duration-300 group"
          >
             {/* Greeting & CTA */}
             <div className="flex flex-col items-start space-y-2">
               <span className="font-medium text-slate-800 text-xs md:text-sm ml-1">{t.launcherGreeting}</span>
               <div className="bg-black text-white px-5 py-2 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center transition-colors group-hover:bg-slate-800 shadow-lg pointer-events-none">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {t.launcherButton}
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Chat Window (Visible when Open) */}
      <div 
        className={`fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-50 md:w-96 bg-white rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div>
               <h3 className="font-bold text-slate-900">{t.headerTitle}</h3>
               <div className="flex items-center">
                 <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                 <p className="text-slate-500 text-xs">{t.headerSubtitle}</p>
               </div>
             </div>
          </div>
          {/* Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-[400px] md:h-[450px] overflow-y-auto p-4 bg-slate-50 space-y-4 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-black text-white rounded-br-none' 
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex space-x-2">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={(e) => handleSend(e)} className="p-3 bg-white border-t border-slate-100">
          <div className="flex items-center bg-slate-100 rounded-full px-2 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-slate-200 transition-all">
            
            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              aria-label="Speak message"
              className={`p-2 rounded-full transition-colors m-1 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:text-slate-900'}`}
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
               </svg>
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening..." : t.placeholder}
              className="flex-1 bg-transparent p-2.5 pl-2 outline-none text-sm text-slate-800 placeholder:text-slate-400"
              disabled={isListening}
            />
            
            <button 
              type="submit"
              aria-label="Send message"
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-black text-white rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed m-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};