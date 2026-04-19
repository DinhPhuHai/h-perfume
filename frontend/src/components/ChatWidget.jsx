import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import './ChatWidget.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Mình là trợ lý AI của H PERFUME. Mình có thể giúp bạn tìm hoặc chọn mùi hương gì hôm nay?' }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Gọi API lên backend thay vì call model ở client, bảo vệ API Key
      const aiResponse = await api.chat(newMessages);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Đã có lỗi xảy ra hoặc mạng yếu. Vui lòng thử lại sau một lát nha! 🥺' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="cw-box fade-in-up">
          <div className="cw-header">
            <div className="cw-title">
              <Sparkles size={18} />
              <span>AI Tư Vấn Nước Hoa</span>
            </div>
            <button className="cw-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="cw-messages">
            {messages.map((m, i) => (
              <div key={i} className={`cw-msg-row ${m.role}`}>
                <div className="cw-msg">
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="cw-msg-row assistant">
                <div className="cw-msg typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="cw-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Hỏi về mùi hương, hãng..." 
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="shimmer-btn">
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <button className="cw-toggle pulse-btn" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}