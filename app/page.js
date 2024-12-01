"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import { supabase } from "./utils/supabase";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Send } from "lucide-react";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState(null);

  const messagesEndRef = useRef(null); // Reference to the bottom of the chat

  useEffect(() => {
    fetchNamespaces();
  }, []);

  useEffect(() => {
    if (selectedNamespace) {
      fetchChatHistory(selectedNamespace);
    }
  }, [selectedNamespace]);

  useEffect(() => {
    scrollToBottom(); // Scroll to the bottom whenever messages change
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchNamespaces = async () => {
    try {
      const response = await fetch("/api/getNamespaces");
      const data = await response.json();
      setNamespaces(data.namespaces);

      if (data.namespaces.length > 0) {
        setSelectedNamespace(data.namespaces[0]);
      }
    } catch (error) {
      console.error("Error fetching namespaces: ", error);
    }
  };

  const fetchChatHistory = async (namespace) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("namespace", namespace)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages((prev) => ({
        ...prev,
        [namespace]: data,
      }));
    } catch (error) {
      console.error("Error fetching chat history: ", error);
    }
  };

  const handleNamespaceSelect = (namespace) => {
    setSelectedNamespace(namespace);
  };

  const formatMessage = (text) => {
    if (!text) return "";

    if (typeof window !== "undefined") {
      Prism.highlightAll();
    }

    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        const language = lang || "javascript";
        const highlightedCode = Prism.highlight(
          code.trim(),
          Prism.languages[language] || Prism.languages.javascript,
          language
        );
        return `<pre class="language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>`;
      })
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\~\~(.*?)\~\~/g, "<del>$1</del>");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedNamespace) return;

    const copyInput = input;
    setInput("");

    const userMessage = {
      sender: "user",
      text: copyInput,
      namespace: selectedNamespace,
    };

    try {
      const { error: userError } = await supabase
        .from("messages")
        .insert(userMessage);

      if (userError) throw userError;

      setMessages((prev) => ({
        ...prev,
        [selectedNamespace]: [...(prev[selectedNamespace] || []), userMessage],
      }));

      const response = await fetch("/api/getDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: copyInput,
          namespace: selectedNamespace,
        }),
      });

      console.log("after getDetails");
      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.response,
        formatted: formatMessage(data.response),
        namespace: selectedNamespace,
      };

      const { error: botError } = await supabase
        .from("messages")
        .insert(botMessage);

      if (botError) throw botError;

      setMessages((prev) => ({
        ...prev,
        [selectedNamespace]: [...(prev[selectedNamespace] || []), botMessage],
      }));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        namespaces={namespaces}
        selectedNamespace={selectedNamespace}
        onSelect={handleNamespaceSelect}
      />
      <div className="chat-container">
        <div className="messages">
          {(messages[selectedNamespace] || []).map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.sender === "bot" ? (
                <div
                  className="formatted-content"
                  dangerouslySetInnerHTML={{ __html: message.formatted }}
                />
              ) : (
                <p>{message.text}</p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Reference to the end of the chat */}
        </div>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the codebase..."
            className="chat-input rounded-full"
          />
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="submit" className="submit-btn rounded-full">
                  <Send className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Send</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </form>
      </div>
    </div>
  );
}
