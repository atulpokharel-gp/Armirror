"use client";
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import { getStylistResponse, StylistMessage } from "@/lib/ai/stylist-agent";

const INITIAL_MESSAGES: StylistMessage[] = [
  {
    role: "assistant",
    content: "Hi! I'm your AI personal stylist. I know your body shape, color profile, and style preferences. Ask me anything – outfit ideas, what to wear for an occasion, or how to style a specific piece! 👗✨\n\n*AI Estimated recommendations based on your style profile.*",
    timestamp: new Date(),
  },
];

const QUICK_PROMPTS = [
  "What should I wear for a dinner date?",
  "What colors suit my skin tone?",
  "Build me a minimalist capsule wardrobe",
  "What's trending this season?",
];

export default function StylistPage() {
  const [messages, setMessages] = useState<StylistMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: StylistMessage = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getStylistResponse([...messages, userMsg], {
        profileName: "Sarah",
        bodyShape: "hourglass",
        colorSeason: "autumn",
        stylePreferences: ["Minimalist", "Classic"],
      });

      const assistantMsg: StylistMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: StylistMessage = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">AI Stylist</h1>
              <span className="ai-badge"><Sparkles size={10} /> AI Estimated</span>
            </div>
            <p className="text-white/50 text-sm">Personalized to your style profile · Sarah</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/50">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-purple-600 to-pink-600"
                  : "bg-white/10"
              }`}>
                {msg.role === "assistant" ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-purple-600/30 border border-purple-500/30 text-white rounded-tr-sm"
                  : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                <p className="text-[10px] text-white/30 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 size={16} className="animate-spin text-purple-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 flex-wrap mb-3">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/60 hover:border-purple-500/50 hover:text-purple-300 transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <Input
            placeholder="Ask your AI stylist..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} className="gap-1">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
