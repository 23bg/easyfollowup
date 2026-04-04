"use client";

import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

type Message = {
    id: string;
    role: "assistant" | "user";
    text: string;
};

export default function ImraboChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            text: "Hi, I’m Imrabo. Ask me about leads, students, fees, or team workflows.",
        },
    ]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        const text = input.trim();
        if (!text) return;

        setMessages((prev) => [
            ...prev,
            { id: `${Date.now()}`, role: "user", text },
            {
                id: `${Date.now()}-reply`,
                role: "assistant",
                text: "Imrabo chat is connected. AI backend wiring can be added next.",
            },
        ]);
        setInput("");
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Ask Imrabo</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0">
                <SheetHeader className="px-4 py-3 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Bot className="h-4 w-4" /> Ask Imrabo
                    </SheetTitle>
                </SheetHeader>

                <div className="h-[calc(100%-128px)] overflow-y-auto px-4 py-3 space-y-3">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`rounded-lg px-3 py-2 text-sm ${message.role === "assistant"
                                    ? "bg-muted text-foreground"
                                    : "bg-primary text-primary-foreground ml-8"
                                }`}
                        >
                            {message.text}
                        </div>
                    ))}
                </div>

                <div className="border-t p-3 flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Ask anything..."
                        onKeyDown={(event) => {
                            if (event.key === "Enter") sendMessage();
                        }}
                    />
                    <Button size="icon" onClick={sendMessage} aria-label="Send message">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
