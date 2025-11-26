import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage } from '../api/messages';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const Chat = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data.results || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage({ text: newMessage });
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div data-easytag="id1-react/src/pages/Chat.jsx" className="chat-container">
      <div className="chat-header">
        <h1>Групповой чат</h1>
        <div className="user-info">
          <span>Привет, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Загрузка сообщений...</div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">Нет сообщений. Начните общение!</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.author.id === user?.id ? 'own-message' : ''}`}
            >
              <div className="message-author">{message.author.username}</div>
              <div className="message-text">{message.text}</div>
              <div className="message-time">
                {new Date(message.created_at).toLocaleString('ru-RU')}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="message-input"
          maxLength={5000}
        />
        <button type="submit" className="send-button" disabled={sending || !newMessage.trim()}>
          {sending ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  );
};

export default Chat;
