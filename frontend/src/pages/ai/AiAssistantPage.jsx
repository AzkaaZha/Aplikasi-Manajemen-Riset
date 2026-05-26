import React, { useState, useEffect, useRef } from "react";
import AiSuggestionBox from "../../components/ai/AiSuggestionBox";
import { chatWithAi, formatAiContext } from "../../api/aiApi";
import "../../styles/documents/ai-assistant.css";

const AiAssistantPage = ({ isOpen, onClose, context, documentType }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Halo! Saya asisten AI Riset. Ada yang bisa saya bantu terkait dokumen ini?",
      isAi: true,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text = inputMessage) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      text,
      isAi: false,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const summarizedContext = formatAiContext(context, documentType);
      
      // history excludes the latest user message
      const history = messages.slice(1); 

      const response = await chatWithAi(text, summarizedContext, history);

      const aiMsg = {
        id: Date.now() + 1,
        text: response.reply || response.response || response.message || "Maaf, saya tidak mendapatkan jawaban yang jelas.",
        isAi: true,
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Error:", err);
      setError("Gagal mendapatkan respon dari AI. Pastikan layanan AI sudah aktif.");
      
      const errorMsg = {
        id: Date.now() + 2,
        text: "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.",
        isAi: true,
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    // Remove HTML tags for simple copy if needed, but the user might want rich text
    // For now, let's copy the raw text (which might have HTML tags)
    // Actually, it's better to copy without tags for simple clipboard
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    navigator.clipboard.writeText(cleanText);
    alert("Teks berhasil disalin!");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`ai-drawer ${isOpen ? "open" : ""}`}>
      <div className="ai-drawer-header">
        <div className="ai-header-title">
          <i className="bi bi-robot"></i>
          <span>AI Assistant</span>
        </div>
        <button className="ai-close-btn" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="ai-chat-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`ai-message-group ${msg.isAi ? "ai-msg" : "user-msg"}`}>
            {msg.isAi ? (
              <div 
                className={`ai-bubble ai-bubble-ai ${msg.isError ? "ai-bubble-error" : ""}`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            ) : (
              <div className="ai-bubble ai-bubble-user">
                {msg.text}
              </div>
            )}
            
            {msg.isAi && !msg.isError && msg.id !== 1 && (
              <div className="d-flex gap-2">
                <button
                  className="btn-copy"
                  onClick={() => handleCopy(msg.text)}
                >
                  <i className="bi bi-copy me-1"></i> Salin Teks
                </button>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="ai-message-group ai-msg">
            <div className="ai-bubble ai-bubble-ai loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="ai-error-notice text-center p-2 small text-danger">
            {error}
          </div>
        )}

        {messages.length === 1 && !isLoading && (
          <AiSuggestionBox onSelectSuggestion={handleSendMessage} />
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="ai-chat-footer">
        <div className="ai-input-container">
          <textarea
            className="ai-input"
            placeholder={isLoading ? "AI sedang berpikir..." : "Tanya asisten AI... (Shift+Enter untuk baris baru)"}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="ai-send-btn"
            disabled={!inputMessage.trim() || isLoading}
            onClick={() => handleSendMessage()}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-send-fill"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
