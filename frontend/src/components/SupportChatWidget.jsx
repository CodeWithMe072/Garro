import React, { useState, useEffect, useRef } from 'react';
import { LuMessageCircle, LuX, LuSend } from 'react-icons/lu';
import { getSocket } from '../utils/socket';
import { useAuth } from '../context/AuthContext';

const SupportChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch or create conversation
  const initConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/support/conversations/mine`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.conversation) {
        setConversation(data.conversation);
        setUnreadCount(data.conversation.unreadByCustomer || 0);
        return data.conversation;
      }
    } catch (err) {
      console.error('Failed to init support conversation:', err);
    }
    return null;
  };

  // Load message history
  const loadMessages = async (convoId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      const res = await fetch(`${API_BASE}/api/support/conversations/mine/messages?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load support messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark conversation as read
  const markAsRead = async (convoId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !convoId) return;

      const res = await fetch(`${API_BASE}/api/support/conversations/${convoId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark support read:', err);
    }
  };

  // Set up socket listeners
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      return;
    }

    let activeConvo = null;

    const setup = async () => {
      const convo = await initConversation();
      if (convo) {
        activeConvo = convo;
        await loadMessages(convo._id);

        // Connect/get socket
        const socket = getSocket();
        socketRef.current = socket;

        // Join room
        socket.emit('support:join', convo._id);

        // Listen for new messages
        socket.on('support:message:new', (data) => {
          if (data.conversationId === convo._id) {
            setMessages((prev) => {
              // Avoid duplicate messages if they somehow happen
              if (prev.some(m => m._id === data.message._id)) return prev;
              return [...prev, data.message];
            });

            // If widget is open, mark as read immediately
            // If closed, increment unread count
            if (isOpen) {
              markAsRead(convo._id);
            } else {
              setUnreadCount((prev) => prev + 1);
            }
          }
        });
      }
    };

    setup();

    // Cleanup
    return () => {
      if (socketRef.current && activeConvo) {
        socketRef.current.emit('support:leave', activeConvo._id);
        socketRef.current.off('support:message:new');
      }
    };
  }, [isAuthenticated, user?.role]);

  // Handle panel open/close
  useEffect(() => {
    if (isOpen && conversation) {
      markAsRead(conversation._id);
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, conversation]);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/support/conversations/mine/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: textToSend })
      });

      const data = await res.json();
      if (res.ok && data.success && data.message) {
        // Appending will be handled by the Socket event or locally if needed.
        // The socket listener 'support:message:new' receives the message,
        // but just in case, we can verify if it's already in the list.
        setMessages((prev) => {
          if (prev.some(m => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
        
        // Ensure conversation state is updated
        if (!conversation) {
          await initConversation();
        }
      }
    } catch (err) {
      console.error('Failed to send support message:', err);
    }
  };

  if (!isAuthenticated || user?.role !== 'customer') {
    return null;
  }

  return (
    <div style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 1000, fontFamily: "'Poppins', sans-serif" }}>
      {/* Floating launcher button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="support-widget-launcher"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
          border: 'none',
          boxShadow: '0 4px 16px rgba(255, 92, 26, 0.35)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          outline: 'none'
        }}
      >
        {isOpen ? <LuX /> : <LuMessageCircle />}
        
        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              minWidth: '20px',
              height: '20px',
              padding: '0 6px',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Expanded Support Chat Panel */}
      {isOpen && (
        <div
          className="support-widget-panel"
          style={{
            position: 'absolute',
            bottom: '76px',
            right: '0',
            width: '360px',
            height: '480px',
            background: 'white',
            borderRadius: 'var(--radius, 14px)',
            boxShadow: 'var(--shadow, 0 8px 32px rgba(0,0,0,0.12))',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--border, #e2e8f0)',
            animation: 'supportFadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div
            className="support-widget-header"
            style={{
              background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
              color: 'white',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Garro Support</h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.9 }}>Typically replies in a few minutes</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >
              <LuX size={16} />
            </button>
          </div>

          {/* Message Thread */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b', fontSize: '13px' }}>
                Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', padding: '0 20px', color: '#64748b' }}>
                <LuMessageCircle size={36} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
                <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px', color: '#1e293b' }}>Start a Conversation</h4>
                <p style={{ fontSize: '12px', margin: 0, color: '#64748b' }}>Send a message to our support agents. We are here to help!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCustomer = msg.senderRole === 'customer';
                return (
                  <div
                    key={msg._id}
                    className={`support-msg ${isCustomer ? 'customer' : 'agent'}`}
                    style={{
                      alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end'
                    }}
                  >
                    <div
                      style={{
                        background: isCustomer ? 'linear-gradient(135deg, #ff5c1a, #ff8c42)' : '#ffffff',
                        color: isCustomer ? 'white' : '#1e293b',
                        padding: '10px 14px',
                        borderRadius: isCustomer ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        boxShadow: isCustomer ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                        border: isCustomer ? 'none' : '1px solid #e2e8f0',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.text}
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        marginTop: '4px',
                        alignSelf: isCustomer ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Send Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              background: 'white'
            }}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid #cbd5e1',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '13px',
                outline: 'none',
                color: '#1e293b',
                background: '#f8fafc',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff5c1a'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: inputText.trim() ? 'linear-gradient(135deg, #ff5c1a, #ff8c42)' : '#e2e8f0',
                color: inputText.trim() ? 'white' : '#94a3b8',
                border: 'none',
                cursor: inputText.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <LuSend size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportChatWidget;
