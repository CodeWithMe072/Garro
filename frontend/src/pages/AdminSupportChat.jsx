import { API_BASE } from '../config/api';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { getSocket } from '../utils/socket';
import AdminSidebar from '../components/AdminSidebar';
import { 
  LuLayoutDashboard, 
  LuStore, 
  LuSearch, 
  LuSettings, 
  LuUser, 
  LuBriefcase, 
  LuUsers, 
  LuGlobe,
  LuChevronLeft,
  LuChevronRight,
  LuClipboardList,
  LuTriangleAlert,
  LuDollarSign,
  LuMessageCircle,
  LuMail,
  LuPhone,
  LuSend,
  LuCheckCheck
} from 'react-icons/lu';

const AdminSupportChat = () => {
  const { user } = useAuth();
  const { toast } = useNotification();
  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);


  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputText, setInputText] = useState('');

  const messageFeedRef = useRef(null);
  const socketRef = useRef(null);

  


  const isActive = (path) => {
    return window.location.pathname.includes(path) ? 'active' : '';
  };

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/support/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      toast.error('Failed to load conversations list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load message history for selected conversation
  const fetchMessages = async (convoId) => {
    try {
      setMessagesLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/support/conversations/${convoId}/messages?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      toast.error('Failed to load chat history');
      console.error(err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Mark selected conversation as read
  const markAsRead = async (convoId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/support/conversations/${convoId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Close conversation
  const closeConversation = async (convoId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/support/conversations/${convoId}/close`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Conversation closed successfully');
        if (selectedConvo?._id === convoId) {
          setSelectedConvo((prev) => ({ ...prev, status: 'closed' }));
        }
      }
    } catch (err) {
      toast.error('Failed to close conversation');
      console.error(err);
    }
  };

  // Set up socket listeners
  useEffect(() => {
    fetchConversations();

    const socket = getSocket();
    socketRef.current = socket;

    // Join global agents room
    socket.emit('support:join:agent');

    // Listener for new messages
    socket.on('support:message:new', (data) => {
      // Append if it's the open thread
      setSelectedConvo((currentConvo) => {
        if (currentConvo && currentConvo._id === data.conversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === data.message._id)) return prev;
            return [...prev, data.message];
          });
          // Reset read locally
          markAsRead(currentConvo._id);
        }
        return currentConvo;
      });
    });

    // Listener for conversation updates (sorting/badges)
    socket.on('support:conversation:updated', (data) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c._id !== data.conversation._id);
        return [data.conversation, ...filtered];
      });
    });

    return () => {
      socket.emit('support:leave:agent');
      socket.off('support:message:new');
      socket.off('support:conversation:updated');
    };
  }, []);

  // Handle switching conversations
  const handleSelectConvo = (convo) => {
    if (selectedConvo) {
      socketRef.current?.emit('support:leave', selectedConvo._id);
    }
    
    setSelectedConvo(convo);
    fetchMessages(convo._id);
    markAsRead(convo._id);

    // Join room
    socketRef.current?.emit('support:join', convo._id);
  };

  // Scroll to bottom
  useEffect(() => {
    if (messageFeedRef.current) {
      messageFeedRef.current.scrollTop = messageFeedRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvo) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/support/conversations/${selectedConvo._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: textToSend })
      });
      const data = await res.json();
      if (res.ok && data.success && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err) {
      toast.error('Failed to send message');
      console.error(err);
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((c) => {
    const customer = c.customerId || {};
    const name = (customer.name || '').toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="dash-wrapper">
      {/* ── SIDEBAR ── */}
      <AdminSidebar />

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">

        <div className="dash-header mb-4" style={{ display: 'block' }}>
          <div className="dash-title d-flex align-items-center gap-2">
            <LuMessageCircle className="text-primary-garro" />
            <span>{t('support_inbox')}</span>
          </div>
          <div className="dash-subtitle">{t('support_inbox_desc')}</div>
        </div>

        {/* Double Pane Layout */}
        <div className="chat-panel-container">
          
          {/* Left Column: Search & Conversations list */}
          <div className="chat-sidebar-card">
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder={t('search_customer_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="chat-search-input"
              />
            </div>

            <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '12px', color: '#64748b' }}>
              {t('conversations_title')} ({filteredConversations.length})
            </h3>

            {loading ? (
              <p style={{ color: '#64748b', fontSize: '13.5px' }}>{t('loading_conversations')}</p>
            ) : filteredConversations.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13.5px' }}>
                {t('no_support_threads')}
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                {filteredConversations.map((c) => {
                  const customer = c.customerId || {};
                  const isSelected = selectedConvo?._id === c._id;
                  const firstLetter = (customer.name || 'C').charAt(0).toUpperCase();

                  return (
                    <div
                      key={c._id}
                      onClick={() => handleSelectConvo(c)}
                      className={`chat-convo-item ${isSelected ? 'active' : ''}`}
                    >
                      {/* Avatar */}
                      <div className="chat-avatar">
                        {firstLetter}
                      </div>

                      {/* Info preview */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                          <h4 style={{ fontSize: '13.5px', fontWeight: '700', margin: 0, color: isSelected ? 'var(--brand)' : '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {customer.name || 'Unknown User'}
                          </h4>
                          <span style={{ fontSize: '10px', color: isSelected ? 'var(--brand)' : '#94a3b8', flexShrink: 0 }}>
                            {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p style={{ color: isSelected ? 'rgba(255, 92, 26, 0.8)' : '#64748b', fontSize: '11.5px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {c.lastMessage || <i>{t('no_messages_yet')}</i>}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {c.unreadByAgent > 0 && (
                        <div
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            minWidth: '18px',
                            height: '18px',
                            padding: '0 5px',
                            fontSize: '10px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {c.unreadByAgent}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Chat thread view */}
          <div className="chat-main-console">
            {selectedConvo ? (
              <>
                {/* Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      {selectedConvo.customerId?.name || 'Customer'}
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><LuMail size={12} /> {selectedConvo.customerId?.email || 'N/A'}</span>
                      {selectedConvo.customerId?.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><LuPhone size={12} /> {selectedConvo.customerId.phone}</span>
                      )}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {selectedConvo.status === 'open' ? (
                      <button
                        onClick={() => closeConversation(selectedConvo._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontWeight: '600',
                          padding: 0
                        }}
                      >
                        {t('close_conversation')}
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                        Closed
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Feed */}
                <div ref={messageFeedRef} style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messagesLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b', fontSize: '13.5px' }}>
                      {t('loading_chat_logs')}
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8', fontSize: '13.5px' }}>
                      {t('no_messages_in_convo')}
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isAgent = ['admin', 'staff', 'manager', 'superadmin'].includes(msg.senderRole);
                      return (
                        <div
                          key={msg._id}
                          style={{
                            alignSelf: isAgent ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isAgent ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div className={isAgent ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                            {msg.text}
                          </div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input box */}
                <form
                  onSubmit={handleSend}
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    background: '#fff'
                  }}
                >
                  <input
                    type="text"
                    placeholder={t('type_reply_placeholder')}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="chat-search-input"
                    style={{ borderRadius: '24px', padding: '10px 20px' }}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="chat-btn-send"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      padding: 0,
                      opacity: inputText.trim() ? 1 : 0.6,
                      background: inputText.trim() ? 'var(--brand)' : '#cbd5e1',
                      cursor: inputText.trim() ? 'pointer' : 'default'
                    }}
                  >
                    <LuSend size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '32px' }}>
                <div className="d-inline-flex align-items-center justify-content-center p-4 rounded-circle bg-white shadow-sm text-primary-garro mb-4" style={{ width: '80px', height: '80px' }}>
                  <LuMessageCircle size={38} />
                </div>
                <h4 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{t('support_chat_room')}</h4>
                <p className="text-secondary small text-center mb-0" style={{ maxWidth: '320px', fontSize: '13px' }}>
                  {t('select_thread_desc')}
                </p>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminSupportChat;
