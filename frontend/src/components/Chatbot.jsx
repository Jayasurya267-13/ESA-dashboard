import { useState, useRef, useEffect } from "react";
import { Bot, ArrowRight, Sparkles, Send } from "lucide-react";

function Chatbot({
    messages,
    onSendMessage,
    isLoading = false,
    activeMachineId = "MTR-001"
}) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = (textToSend = null) => {
        const query = textToSend !== null ? textToSend : input;
        if (!query || !query.trim()) return;
        onSendMessage(query.trim());
        if (textToSend === null) {
            setInput("");
        }
    };

    const quickQuestions = [
        "What is the current machine status?",
        "Why is vibration high?",
        "What should I do for maintenance?",
        "Is the machine safe to operate?",
        "What is the AI prediction and RUL?"
    ];

    return (
        <section id="assistant" className="dashboard-section">
            <div className="section-header">
                <div>
                    <div className="section-kicker">
                        <Bot size={13} /> AI COPILOT
                    </div>
                    <h2>Maintenance Assistant Copilot</h2>
                    <p>Conversational assistant analyzing live telemetry for machine diagnostics, root causes, and safety advice.</p>
                </div>
            </div>

            <div className="chatbot-container">
                {/* CHAT HEADER */}
                <div className="chatbot-header">
                    <div className="chatbot-title">
                        <div className="chatbot-icon">
                            <Bot size={22} color="#00E5BF" />
                        </div>
                        <div>
                            <h3>AI Maintenance Assistant</h3>
                            <span>Active Asset Telemetry: {activeMachineId}</span>
                        </div>
                    </div>

                    <div className="assistant-online">
                        <span className="status-dot online"></span>
                        Online
                    </div>
                </div>

                {/* CHAT BODY */}
                <div className="chatbot-body">
                    <div className="chatbot-messages">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`chat-message ${message.sender}`}
                            >
                                <div className="chat-message-label">
                                    {message.sender === "bot" ? "AI Maintenance Assistant" : "Operator"}
                                </div>
                                <div
                                    className="chat-message-text"
                                    style={{ whiteSpace: "pre-line" }}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chat-message bot">
                                <div className="chat-message-label">AI Maintenance Assistant</div>
                                <div className="chat-message-text" style={{ fontStyle: "italic", color: "#94A3B8" }}>
                                    Analyzing live sensor telemetry and formulating diagnostic advisory...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* QUICK QUESTIONS */}
                    <div className="quick-questions">
                        <div className="quick-title">
                            <Sparkles size={13} style={{ display: "inline", marginRight: "4px" }} />
                            Quick Queries
                        </div>

                        {quickQuestions.map((q, index) => (
                            <button
                                key={index}
                                className="quick-question"
                                onClick={() => handleSend(q)}
                                disabled={isLoading}
                            >
                                <span>{q}</span>
                                <ArrowRight size={13} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* INPUT */}
                <div className="chatbot-input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSend();
                            }
                        }}
                        placeholder={`Ask anything about ${activeMachineId} (e.g., 'Why is vibration high?')...`}
                        disabled={isLoading}
                    />

                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        aria-label="Send message"
                    >
                        <span>Send</span>
                        <Send size={15} />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Chatbot;
