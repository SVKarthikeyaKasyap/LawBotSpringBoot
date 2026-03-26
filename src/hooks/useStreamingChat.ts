import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseStreamingChatProps {
  conversationId?: string;
  caseType: string;
  country?: string;
  role?: 'user' | 'lawyer';
  deepSearch?: boolean;
  onMessagesUpdate: (messages: Message[]) => void;
}

export const useStreamingChat = ({
  conversationId,
  caseType,
  country = 'india',
  role = 'user',
  deepSearch = false,
  onMessagesUpdate
}: UseStreamingChatProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (
    content: string,
    currentMessages: Message[],
    fileContent?: { name: string; text: string; type: string }
  ) => {
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...currentMessages, userMessage];
    onMessagesUpdate(updatedMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      let systemInstruction = `You are an expert legal assistant for ${country}. 
The user is a ${role}. The case type is ${caseType}. 
Provide accurate, professional, and helpful legal information. Do not provide formal legal advice.`;

      if (deepSearch) {
        systemInstruction += `\nPerform a deep search of relevant case laws, statutes, and legal precedents.`;
      }

      if (fileContent) {
        systemInstruction += `\n\nThe user has attached a document named "${fileContent.name}":\n\n${fileContent.text}`;
      }

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction,
        }
      });

      // Send previous history (excluding the very last user message we just added)
      for (const msg of currentMessages) {
        // We can't easily push history into the chat object directly with the SDK in this exact way,
        // so we'll just format the history into the prompt if needed, or send them sequentially.
        // Actually, the easiest way is to send the entire conversation history as a single prompt for this turn,
        // or use the contents array for generateContentStream.
      }
      
      // Let's use generateContentStream with the full history
      const contents = updatedMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
        }
      });

      let assistantContent = '';

      for await (const chunk of responseStream) {
        if (chunk.text) {
          assistantContent += chunk.text;
          
          const messagesWithAssistant = [
            ...updatedMessages,
            {
              role: 'assistant' as const,
              content: assistantContent,
              timestamp: new Date()
            }
          ];
          onMessagesUpdate(messagesWithAssistant);
        }
      }

    } catch (error) {
      console.error('Streaming chat error:', error);
      // Add a fallback error message
      onMessagesUpdate([
        ...updatedMessages,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error while processing your request. Please check your API key configuration.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, caseType, country, role, deepSearch, onMessagesUpdate]);

  return { sendMessage, isLoading };
};