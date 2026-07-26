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

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';



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
      <main className="dash-main" style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px' }}>
        
        {/* Navigation & Language */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Link to="/admin" className="back" style={{ textDecoration: 'none', color: '#64748b', fontSize: '13.5px', display: 'inline-block', marginBottom: '4px' }}>
              ← {t('dashboard_back')}
            </Link>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LuMessageCircle /> Customer Support Inbox
            </h1>
          </div>

          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '13.5px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
            >
              <LuGlobe size={14} /> {lang === 'en' ? 'English' : (lang === 'ar' ? 'العربية' : 'اردو')}
            </button>
            {isLangOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                boxShadow: '0 10px 24px rgba(0,0,0,0.2)', zIndex: 1000,
                minWidth: '120px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px'
              }}>
                {[{ code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }, { code: 'ur', label: 'اردو' }].map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => { changeLanguage(code); setIsLangOpen(false); }}
                    style={{
                      background: lang === code ? 'rgba(255,92,26,0.15)' : 'none', border: 'none',
                      borderRadius: '8px', padding: '8px 12px',
                      color: lang === code ? '#ff8c5a' : 'rgba(255,255,255,0.6)',
                      fontSize: '13px', fontWeight: lang === code ? 700 : 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', width: '100%', transition: 'all 0.15s'
                    }}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Double Pane Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', height: 'calc(100vh - 160px)', minHeight: '500px' }}>
          
          {/* Left Column: Search & Conversations list */}
          <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', overflow: 'hidden' }}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#1e293b', fontSize: '14px', outline: 'none'
                }}
              />
            </div>

            <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '12px', color: '#64748b' }}>
              Conversations ({filteredConversations.length})
            </h3>

            {loading ? (
              <p style={{ color: '#64748b' }}>Loading conversations...</p>
            ) : filteredConversations.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
                No support threads found.
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
                      style={{
                        display: 'flex',
                        gap: '12px',
                        background: isSelected ? '#fff4ef' : '#ffffff',
                        border: isSelected ? '1.5px solid #ff5c1a' : '1.5px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: '#1e293b',
                        alignItems: 'center'
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {firstLetter}
                      </div>

                      {/* Info preview */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: isSelected ? '#ff5c1a' : '#1e293b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {customer.name || 'Unknown User'}
                          </h4>
                          <span style={{ fontSize: '10px', color: '#94a3b8', flexShrink: 0 }}>
                            {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '12px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {c.lastMessage || <i>No messages yet</i>}
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
          <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden' }}>
            {selectedConvo ? (
              <>
                {/* Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
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
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontWeight: '600',
                          padding: 0
                        }}
                      >
                        Close conversation
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                        Closed
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Feed */}
                <div ref={messageFeedRef} style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messagesLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b', fontSize: '14px' }}>
                      Loading chat logs...
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8', fontSize: '14px' }}>
                      No messages in this conversation.
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
                          <div
                            style={{
                              background: isAgent ? 'linear-gradient(135deg, #ff5c1a, #ff8c42)' : '#ffffff',
                              color: isAgent ? 'white' : '#1e293b',
                              padding: '12px 16px',
                              borderRadius: isAgent ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              fontSize: '13.5px',
                              lineHeight: '1.45',
                              boxShadow: isAgent ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                              border: isAgent ? 'none' : '1px solid #e2e8f0',
                              wordBreak: 'break-word',
                              whiteSpace: 'pre-wrap'
                            }}
                          >
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
                    placeholder="Type a reply..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={{
                      flex: 1,
                      border: '1px solid #cbd5e1',
                      borderRadius: '24px',
                      padding: '10px 20px',
                      fontSize: '14px',
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
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: inputText.trim() ? 'linear-gradient(135deg, #ff5c1a, #ff8c42)' : '#e2e8f0',
                      color: inputText.trim() ? 'white' : '#94a3b8',
                      border: 'none',
                      cursor: inputText.trim() ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                  >
                    <LuSend size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <LuMessageCircle size={64} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#64748b', margin: '0 0 4px' }}>Support Chat Room</h3>
                <p style={{ fontSize: '13.5px', margin: 0 }}>Select a customer from the left to start replying in real-time.</p>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminSupportChat;
