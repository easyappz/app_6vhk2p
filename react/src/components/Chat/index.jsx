import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMessages, sendMessage } from '../../api/messages';
import './styles.css';

const Chat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Load messages from API
   */
  const loadMessages = async () => {
    try {
      const data = await getMessages({ limit: 100, offset: 0 });
      setMessages(data.results || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Не удалось загрузить сообщения');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send new message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const newMessage = await sendMessage({ text: messageText });
      setMessages((prev) => [...prev, newMessage]);
      setMessageText('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /**
   * Format date to readable time
   */
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  /**
   * Load messages on component mount
   */
  useEffect(() => {
    loadMessages();
    
    // Setup polling every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      loadMessages();
    }, 5000);

    // Cleanup interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  /**
   * Scroll to bottom when messages change
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-container" data-easytag="id3-src/components/Chat/index.jsx">
      <header className="chat-header">
        <h1 className="chat-title">Групповой чат</h1>
        <nav className="chat-nav">
          <Link to="/profile" className="chat-nav-link">Профиль</Link>
          <button onClick={handleLogout} className="chat-logout-btn">Выход</button>
        </nav>
      </header>

      <main className="chat-main">
        {loading ? (
          <div className="chat-loading">Загрузка сообщений...</div>
        ) : error ? (
          <div className="chat-error">{error}</div>
        ) : (
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">Пока нет сообщений. Начните общение!</div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = user && message.author.id === user.id;
                return (
                  <div
                    key={message.id}
                    className={`chat-message ${isOwnMessage ? 'chat-message-own' : 'chat-message-other'}`}
                  >
                    <div className="chat-message-header">
                      <span className="chat-message-author">
                        {message.author.username}
                      </span>
                      <span className="chat-message-time">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <div className="chat-message-text">{message.text}</div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="chat-footer">
        <form onSubmit={handleSendMessage} className="chat-form">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Введите сообщение..."
            className="chat-input"
            disabled={sending}
            maxLength={5000}
          />
          <button 
            type="submit" 
            className="chat-submit-btn"
            disabled={sending || !messageText.trim()}
          >
            {sending ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;