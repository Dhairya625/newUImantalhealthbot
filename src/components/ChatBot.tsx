import { useState, useEffect } from "react";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { useWellness } from "@/hooks/wellness-context";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const botResponses = [
  "That sounds like you're going through a lot. Remember, it's okay to feel this way.",
  "I hear you. Taking time for yourself is so important. Have you tried any breathing exercises today?",
  "It's wonderful that you're sharing this with me. What usually helps you feel better?",
  "Thank you for being open about your feelings. Would you like to try a quick mindfulness exercise?",
  "I understand. Sometimes just talking about it can help. Is there anything specific on your mind?",
  "That's a great insight. How can we work together to support your wellbeing today?",
  "I'm glad you're taking care of yourself. What's one small thing you could do for yourself right now?",
];

const SYSTEM_PROMPT = `You are PeacePulse, a supportive, trauma-informed mental health companion.

Your purpose: provide empathetic, evidence-informed support for mental wellbeing (stress, anxiety, mood, sleep, habits, self-care), encourage healthy coping, and empower users. You are NOT a clinician and do not give medical, diagnostic, legal, or crisis instructions.

Guidelines:
- Stay strictly on mental health and wellbeing topics. If asked about unrelated topics (e.g., coding, news, politics, finance, sports, adult content), gently decline and steer the conversation back to mental wellbeing.
- Be brief, warm, and practical. Offer 1-3 actionable suggestions tailored to the user's feelings and situation.
- Encourage reflection using gentle, non-judgmental questions.
- Avoid pathologizing language or definitive labels. Do not mention diagnoses.
- Safety: If user expresses intent to harm self or others, or appears in crisis, say you may be limited and encourage immediate help from trusted people or local emergency services. Provide crisis resources appropriate in tone (avoid region-specific numbers unless asked). Do not provide instructions that could increase risk.
- Always include a gentle disclaimer when giving potentially sensitive guidance: you are not a substitute for professional care.

Tone: compassionate, validating, hopeful, non-prescriptive.`;

const apiKey: string | undefined = (import.meta as any).env?.VITE_GEMINI_API_KEY;

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { addMoodEntry, addTodos, chatMessages, addChatMessage } = useWellness();

  // Sync from context on mount and whenever context updates
  useEffect(() => {
    const mapped: Message[] = chatMessages.map((m) => ({
      id: m.id,
      text: m.text,
      sender: m.sender,
      timestamp: new Date(m.timestamp),
    }));
    setMessages(mapped);
  }, [chatMessages]);

  const generateBotReply = async (history: Message[], userText: string): Promise<string> => {
    try {
      if (!apiKey) {
        throw new Error("Missing API key");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT
      });

      const firstUserIndex = history.findIndex((m) => m.sender === "user");
      const chatHistory = firstUserIndex >= 0 ? history.slice(firstUserIndex) : [];

      const chat = model.startChat({
        history: chatHistory.map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }]
        })),
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          // Intentionally allow supportive talk about self-harm while blocking harmful instructions
          // If available in your SDK version:
          // { category: HarmCategory.HARM_CATEGORY_SELF_HARM, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: 512
        }
      });

      const result = await chat.sendMessage(userText);
      const response = await result.response;
      const text = response.text();

      // Gentle crisis interjection if user text indicates urgent risk
      const crisisRegex = /(suicide|kill myself|end it|can't go on|self[- ]?harm|hurt myself)/i;
      if (crisisRegex.test(userText)) {
        return "I'm really sorry you're feeling this way. You deserve immediate support. If you might be in danger or thinking about hurting yourself, please contact local emergency services, a trusted person, or a crisis line in your area right now. If you'd like, I can share grounding or breathing steps while you reach out. " + text;
      }

      return text;
    } catch (error) {
      console.error(error);
      // Propagate error so caller can display banner and choose fallback
      throw error;
    }
  };

  type Analyzed = {
    mood: "excellent" | "good" | "okay" | "poor" | "awful";
    todos: { title: string; category: "mindfulness" | "health" | "reflection" | "exercise" | "learning" }[];
  };

  const analyzeUserText = async (userText: string): Promise<Analyzed> => {
    const fallback = fallbackAnalyze(userText);
    try {
      if (!apiKey) return fallback;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Classify the user's message for a wellness app.
Rules:
- mood must be exactly one of: excellent, good, okay, poor, awful.
- Create 3-5 actionable, small todos spanning the day. Each todo must include a category, exactly one of: mindfulness, health, reflection, exercise, learning.
Respond ONLY in JSON with keys mood and todos.
Example: {"mood":"okay","todos":[{"title":"5-minute breathing","category":"mindfulness"},{"title":"10-minute walk","category":"exercise"}]}
User message: "${userText.replace(/"/g, '\\"')}"`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const json = jsonStart >= 0 && jsonEnd >= 0 ? text.slice(jsonStart, jsonEnd + 1) : "";
      const parsed = JSON.parse(json) as Analyzed;
      // Basic validation
      if (!parsed.mood || !Array.isArray(parsed.todos)) throw new Error("Invalid parse");
      // Trim and cap todos
      parsed.todos = parsed.todos.slice(0, 5).map(t => ({
        title: String(t.title).trim(),
        category: (t.category as Analyzed["todos"][number]["category"]) || "health",
      })).filter(t => t.title.length > 0);
      if (parsed.todos.length === 0) parsed.todos = fallback.todos;
      return parsed;
    } catch (err) {
      return fallback;
    }
  };

  const fallbackAnalyze = (text: string): Analyzed => {
    const t = text.toLowerCase();
    let mood: Analyzed["mood"] = "okay";
    if (/(great|awesome|fantastic|amazing|grateful|happy|joyful)/.test(t)) mood = "excellent";
    else if (/(good|fine|better|optimistic|calm)/.test(t)) mood = "good";
    else if (/(stressed|anxious|sad|tired|overwhelmed|down|lonely|angry)/.test(t)) mood = "poor";
    else if (/(awful|terrible|horrible|depressed|can't cope|can\'t cope)/.test(t)) mood = "awful";

    const todos: Analyzed["todos"] = [];
    if (/(anxious|stressed|overwhelmed)/.test(t)) todos.push({ title: "5-minute breathing", category: "mindfulness" });
    if (/(tired|sleep|insomnia)/.test(t)) todos.push({ title: "Wind-down routine before bed", category: "health" });
    if (/(sad|down|lonely)/.test(t)) todos.push({ title: "Journal for 5 minutes", category: "reflection" });
    if (/(angry|tense)/.test(t)) todos.push({ title: "10-minute walk", category: "exercise" });
    // General healthy defaults
    const defaults: Analyzed["todos"] = [
      { title: "Hydrate: 8 glasses of water", category: "health" },
      { title: "10-minute walk", category: "exercise" },
      { title: "Journal for 5 minutes", category: "reflection" },
      { title: "5-minute breathing", category: "mindfulness" },
      { title: "Read 10 pages", category: "learning" },
    ];
    const titles = new Set(todos.map(x => x.title));
    defaults.forEach(d => { if (todos.length < 5 && !titles.has(d.title)) todos.push(d); });
    return { mood, todos: todos.slice(0, 5) };
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage.trim(),
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    addChatMessage({ ...userMessage, timestamp: userMessage.timestamp.toISOString() });
    setCurrentMessage("");
    setIsTyping(true);

    try {
      // Analyze user's message for mood and todos (runs regardless of bot reply status)
      const analysis = await analyzeUserText(userMessage.text);
      addMoodEntry(analysis.mood, "Auto-detected from chat");
      if (analysis.todos.length > 0) {
        addTodos(analysis.todos.map(t => ({ title: t.title, category: t.category })));
      }

      const reply = await generateBotReply([...messages, userMessage], userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      addChatMessage({ ...botMessage, timestamp: botMessage.timestamp.toISOString() });
      setLastError(null);
    } catch (err: any) {
      setLastError(err?.message ? String(err.message) : "Connection error");
      const fallback = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallback,
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      addChatMessage({ ...botMessage, timestamp: botMessage.timestamp.toISOString() });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6 wellness-enter max-h-screen flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Wellness Chat</h1>
        <p className="text-muted-foreground">Your supportive companion for mental wellness</p>
      </div>

      <Card className="flex-1 flex flex-col p-6 min-h-[600px]">
        {(lastError || !apiKey) && (
          <div className="mb-4 text-sm p-3 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
            {(!apiKey) ? (
              <span>Live AI is disabled because the API key is missing. Add <code>VITE_GEMINI_API_KEY</code> to your env and restart the dev server.</span>
            ) : (
              <span>Using supportive fallback responses due to a connection issue. Retrying on your next message.</span>
            )}
          </div>
        )}
        {/* Chat Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Wellness Assistant</h3>
            <p className="text-sm text-muted-foreground">Online • Always here for you</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-1 opacity-70`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-border pt-4">
          <div className="flex space-x-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isTyping}
              size="sm"
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This is a supportive space. Remember to reach out to a professional if you need additional help.
          </p>
        </div>
      </Card>

      {/* Quick Suggestions */}
      <Card className="p-4">
        <h3 className="font-medium mb-3 flex items-center">
          <MessageCircle className="h-4 w-4 mr-2 text-primary" />
          Quick Topics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            "I'm feeling anxious",
            "Help with sleep",
            "Stress management",
            "Daily motivation"
          ].map((topic, index) => (
            <Button
              key={index}
              onClick={() => setCurrentMessage(topic)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {topic}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}