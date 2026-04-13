import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Send, MoreVertical, Paperclip, 
  Smile, Trash2, Check, CheckCheck, User, 
  MessageSquare, X, Briefcase, Sparkles,
  ArrowLeft, Info, Phone, Video, Zap
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function MessagingPage() {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newConvoModal, setNewConvoModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        fetchMessages(activeConversation.id);
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get("/messages/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/messages/conversations/${conversationId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    setSending(true);
    try {
      await api.post(`/messages/conversations/${activeConversation.id}/send`, {
        content: newMessage.trim(),
      });
      setNewMessage("");
      await fetchMessages(activeConversation.id);
      await fetchConversations();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/messages/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const startNewConversation = async () => {
    if (!selectedUser) return;
    try {
      const res = await api.post("/messages/conversations/start", {
        recipient_id: selectedUser.id,
      });
      setNewConvoModal(false);
      setSelectedUser(null);
      await fetchConversations();
      setActiveConversation(res.data);
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  };

  const openNewConvoModal = async () => {
    await fetchUsers();
    setNewConvoModal(true);
  };

  const filteredConversations = useMemo(() => 
    conversations.filter((c) =>
      c.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [conversations, searchQuery]
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-GB", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-transparent overflow-hidden gap-6 relative">
      
      {/* ── Background Decors ── */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar - Conversations */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 flex flex-col glass-panel border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
      >
        {/* Sidebar Header */}
        <div className="p-7 border-b border-white/10 bg-white/5 backdrop-blur-3xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-2">
               Connect
            </h2>
            <button
              onClick={openNewConvoModal}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-white flex items-center justify-center hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-90"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
          <div className="relative group">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--primary-500)] group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[13px] text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none focus:border-white/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/5 dark:bg-white/[0.02]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="w-6 h-6 border-2 border-[var(--border)] border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary-600)]">Syncing Workspace...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center text-[var(--primary-500)] h-full space-y-4 opacity-60">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                <MessageSquare size={32} className="opacity-20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Silent Network</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              <AnimatePresence>
                {filteredConversations.map((conv, idx) => (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full group p-4 rounded-3xl flex items-start gap-4 transition-all duration-500 relative overflow-hidden ${
                      activeConversation?.id === conv.id 
                        ? "bg-white/10 shadow-xl border border-white/10" 
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {activeConversation?.id === conv.id && (
                      <motion.div layoutId="active-marker" className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 to-sky-500" />
                    )}
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-sky-500/5 border border-white/10 flex items-center justify-center flex-shrink-0 relative group-hover:scale-110 transition-transform duration-500">
                      <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-sky-500 font-black text-sm">
                        {conv.other_user_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                      {/* Active Status Dot */}
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-black/20" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-sm text-[var(--foreground)] truncate tracking-tight">
                          {conv.other_user_name}
                        </span>
                        <span className="text-[10px] text-[var(--primary-600)] font-black uppercase">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--primary-500)] truncate pr-4 font-medium opacity-80">
                        {conv.last_message || "Initialize connection..."}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex-1 flex flex-col glass-panel border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] bg-white/[0.01] backdrop-blur-3xl relative z-10"
      >
        {activeConversation ? (
          <>
            {/* ── Chat Header ── */}
            <header className="px-10 py-8 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-20 -mr-20 -mt-20 bg-emerald-500/5 rounded-full blur-3xl" />
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-white/10 flex items-center justify-center shadow-inner">
                  <span className="text-2xl font-black bg-gradient-to-br from-emerald-500 to-sky-500 bg-clip-text text-transparent">
                    {activeConversation.other_user_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--foreground)] tracking-tighter">
                    {activeConversation.other_user_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest">
                        {activeConversation.other_user_role || "verified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <button className="p-3 rounded-2xl border border-white/10 hover:bg-white/5 text-[var(--primary-500)] hover:text-emerald-500 transition-all active:scale-95 shadow-lg">
                  <Video size={18} />
                </button>
                <button className="p-3 rounded-2xl border border-white/10 hover:bg-white/5 text-[var(--primary-500)] hover:text-sky-500 transition-all active:scale-95 shadow-lg">
                  <Phone size={18} />
                </button>
                <div className="w-px h-8 bg-white/10 mx-1" />
                <button className="p-3 rounded-2xl border border-white/10 hover:bg-white/5 text-[var(--primary-500)] transition-all active:scale-95 shadow-lg">
                  <Info size={18} />
                </button>
              </div>
            </header>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 custom-scrollbar bg-transparent">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--primary-500)] space-y-5 opacity-40">
                  <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 shadow-inner">
                    <Sparkles size={48} className="text-emerald-500/50" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Secure Bridge Ready</p>
                    <p className="text-[10px] font-bold text-[var(--primary-600)]">Start the conversation below</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 max-w-5xl mx-auto">
                  {messages.map((msg, idx) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      formatTime={formatTime}
                      showAvatar={idx === 0 || messages[idx-1].sender_id !== msg.sender_id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ── Floating Input Footer ── */}
            <footer className="p-10 pt-4 relative bg-transparent">
              <div className="relative group max-w-4xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
                
                <div className="relative flex items-end gap-3 glass-panel border border-white/10 rounded-[2rem] p-3 pr-4 shadow-2xl backdrop-blur-3xl focus-within:border-white/20 transition-all">
                  <button className="p-3.5 text-[var(--primary-500)] hover:text-emerald-500 transition-colors">
                    <Paperclip size={18} />
                  </button>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 px-2 py-3.5 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--primary-600)] outline-none resize-none max-h-32 custom-scrollbar font-semibold tracking-tight"
                    style={{ minHeight: "24px" }}
                  />
                  <div className="flex items-center gap-2 mb-1.5">
                    <button className="p-3 text-[var(--primary-500)] hover:text-sky-500 transition-colors">
                      <Smile size={18} />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-sky-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={20} strokeWidth={2.5} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-8 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 rounded-[3.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-[var(--primary-500)] shadow-inner group relative"
            >
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <Zap size={56} className="opacity-10 text-emerald-500 relative z-10" />
            </motion.div>
            
            <div className="space-y-3 relative z-10">
              <h3 className="text-3xl font-black text-[var(--foreground)] tracking-tighter flex items-center justify-center gap-3">
                Secure Channel <span className="text-emerald-500">v2.0</span>
              </h3>
              <p className="text-[var(--primary-500)] max-w-sm text-sm font-bold leading-relaxed opacity-60 uppercase tracking-widest mx-auto">
                End-to-End Encrypted Professional Bridge. Select a contact to proceed.
              </p>
            </div>

            <button 
              onClick={openNewConvoModal}
              className="px-10 py-4 bg-white/5 border border-white/10 rounded-3xl text-xs font-black uppercase tracking-widest text-[var(--foreground)] hover:bg-white/10 transition-all active:scale-95 shadow-xl relative z-10"
            >
              Initialize New Stream
            </button>
          </div>
        )}
      </motion.div>

      {/* ── New Conversation Modal (Glass Overhaul) ── */}
      <AnimatePresence>
        {newConvoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6"
            onClick={(e) => e.target === e.currentTarget && setNewConvoModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.6)] relative overflow-hidden"
            >
              {/* Modal Decors */}
              <div className="absolute top-0 right-0 p-24 -mr-24 -mt-24 bg-emerald-500/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 p-24 -ml-24 -mb-24 bg-sky-500/10 rounded-full blur-[100px]" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white tracking-tighter">Initialize Bridge</h3>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em]">Network Search Active</p>
                </div>
                <button
                  onClick={() => {
                    setNewConvoModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-3 rounded-2xl hover:bg-white/5 text-[var(--primary-500)] transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="relative mb-8 z-10">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-500)]" />
                <input
                  type="text"
                  placeholder="Find student or mentor by name..."
                  className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-[2rem] text-sm text-white placeholder-[var(--primary-600)] outline-none focus:border-emerald-500/30 transition-all font-black"
                />
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-3 custom-scrollbar relative z-10">
                {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Bridging API...</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full group flex items-center gap-5 px-5 py-5 rounded-[2rem] border transition-all duration-500 text-left ${
                        selectedUser?.id === user.id
                          ? "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                          : "border-transparent hover:bg-white/5 bg-transparent"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <span className="text-xl font-black bg-gradient-to-br from-emerald-500 to-sky-500 bg-clip-text text-transparent uppercase">
                          {user.full_name?.charAt(0) || <User />}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-black text-white truncate tracking-tight">
                          {user.full_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-white/10 text-white/40'}`}>
                            {user.role}
                          </p>
                        </div>
                      </div>
                      {selectedUser?.id === user.id && (
                        <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="mt-12 relative z-10">
                <button
                  onClick={startNewConversation}
                  disabled={!selectedUser}
                  className="w-full py-5 rounded-[2rem] bg-white text-black font-black text-sm transition-all shadow-2xl hover:bg-emerald-500 hover:text-white active:scale-95 disabled:opacity-20 disabled:hover:bg-white disabled:hover:text-black"
                >
                  Confirm & Open Channel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Message Bubble Component ───────────────────────────────────────────────

function MessageBubble({ message, formatTime, showAvatar }) {
  const isOwn = message.is_own;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: isOwn ? 30 : -30 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      className={`flex items-end gap-5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mb-2 transition-all shadow-lg ${showAvatar ? "opacity-100" : "opacity-0 h-0 invisible"}`}>
        <span className="text-[10px] font-black bg-gradient-to-br from-emerald-500 to-sky-500 bg-clip-text text-transparent">
          {message.sender_name?.charAt(0).toUpperCase() || <User size={12}/>}
        </span>
      </div>

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[80%] group`}>
        <div
          className={`px-7 py-4 rounded-[2.5rem] text-[14px] leading-relaxed shadow-2xl transition-all duration-500 relative font-medium ${
            isOwn
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-none shadow-emerald-500/20"
              : "bg-white/[0.04] text-[var(--foreground)] border border-white/10 rounded-bl-none hover:bg-white/[0.07]"
          }`}
        >
          {message.content}
        </div>
        <div className={`flex items-center gap-2 mt-2 px-3 opacity-0 group-hover:opacity-100 transition-all duration-500 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[9px] font-black text-[var(--primary-600)] uppercase tracking-widest">
            {formatTime(message.created_at)}
          </span>
          {isOwn && (
            <div className="text-emerald-500 transition-transform group-hover:scale-110">
               {message.is_read ? <CheckCheck size={14} strokeWidth={3}/> : <Check size={14} strokeWidth={3}/>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}