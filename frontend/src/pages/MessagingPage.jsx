import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Send, MoreVertical, Paperclip, 
  Smile, Trash2, Check, CheckCheck, User, 
  MessageSquare, X, Briefcase, Sparkles
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

  const filteredConversations = conversations.filter((c) =>
    c.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="flex h-[calc(100vh-10rem)] bg-transparent overflow-hidden gap-4">
      {/* Sidebar - Conversations */}
      <div className="w-80 flex flex-col glass-panel border border-[var(--border)] rounded-[2rem] overflow-hidden shadow-xl">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[var(--border)] bg-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">Inbox</h2>
            <button
              onClick={openNewConvoModal}
              className="p-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-all shadow-lg active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-500)]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary-500)]/30 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--primary-500)] rounded-full animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--primary-500)] h-full opacity-60">
              <MessageSquare size={32} className="mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No chats active</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full group p-4 rounded-2xl flex items-start gap-4 transition-all duration-300 relative ${
                    activeConversation?.id === conv.id 
                      ? "bg-white/10 shadow-lg border border-white/10" 
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {activeConversation?.id === conv.id && (
                    <motion.div layoutId="active-tab" className="absolute left-2 top-4 bottom-4 w-1 bg-emerald-500 rounded-full" />
                  )}
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-emerald-500 font-black text-sm">
                      {conv.other_user_name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-sm text-[var(--foreground)] truncate">
                        {conv.other_user_name}
                      </span>
                      <span className="text-[10px] text-[var(--primary-500)] font-medium">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--primary-500)] truncate pr-4">
                      {conv.last_message || "Start a conversation"}
                    </p>
                    {conv.unread_count > 0 && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-panel border border-[var(--border)] rounded-[2rem] overflow-hidden shadow-2xl bg-white/[0.02] backdrop-blur-xl">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <header className="px-8 py-6 border-b border-[var(--border)] bg-white/5 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-emerald-500/10 flex items-center justify-center">
                  <span className="text-emerald-500 font-black text-sm">
                    {activeConversation.other_user_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-[var(--foreground)] tracking-tight">
                    {activeConversation.other_user_name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">
                      {activeConversation.other_user_role || "Candidate"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl border border-[var(--border)] hover:bg-white/5 text-[var(--primary-500)] transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar bg-transparent">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--primary-500)] space-y-3 opacity-40">
                  <Sparkles size={40} className="text-[var(--primary-500)]" />
                  <p className="text-xs font-black uppercase tracking-widest text-center">Conversation Initialized.<br/>Start the bridge.</p>
                </div>
              ) : (
                <div className="space-y-6">
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

            {/* Input Bar */}
            <footer className="p-6 bg-white/5 backdrop-blur-md border-t border-[var(--border)]">
              <div className="max-w-4xl mx-auto flex items-end gap-3 glass-panel border border-white/10 rounded-[1.5rem] p-2 pr-3 focus-within:border-emerald-500/30 transition-all shadow-inner">
                <button className="p-3 text-[var(--primary-500)] hover:text-emerald-500 transition-colors">
                  <Paperclip size={18} />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Draft your response..."
                  rows={1}
                  className="flex-1 px-2 py-3 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--primary-500)] outline-none resize-none max-h-32 custom-scrollbar font-medium"
                  style={{ minHeight: "24px" }}
                />
                <button className="p-3 text-[var(--primary-500)] hover:text-emerald-500 transition-colors">
                  <Smile size={18} />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="w-11 h-11 flex items-center justify-center bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={18} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-[var(--border)] flex items-center justify-center text-[var(--primary-500)] shadow-inner">
              <MessageSquare size={40} className="opacity-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight flex items-center justify-center gap-3">
                Select a Bridge
              </h3>
              <p className="text-[var(--primary-500)] max-w-xs text-sm font-medium leading-relaxed">
                Choose a conversation from the sidebar to start collaborating with the network.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {newConvoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            onClick={(e) => e.target === e.currentTarget && setNewConvoModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-[var(--background)] glass-panel border border-[var(--border)] rounded-[2.5rem] p-10 w-full max-w-md shadow-[0_32px_120px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 -mr-16 -mt-16 opacity-10 blur-3xl bg-emerald-500 w-40 h-40 rounded-full" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">New Bridge</h3>
                <button
                  onClick={() => {
                    setNewConvoModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 rounded-xl hover:bg-white/5 text-[var(--primary-500)] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="relative mb-6 z-10">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-500)]" />
                <input
                  type="text"
                  placeholder="Find colleague or student..."
                  className="w-full pl-9 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] outline-none focus:border-emerald-500/30 transition-all font-medium"
                />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {users.length === 0 ? (
                  <div className="text-center py-10 opacity-30 text-xs font-black uppercase tracking-widest">
                    Searching Network...
                  </div>
                ) : (
                  users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full group flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all duration-300 text-left ${
                        selectedUser?.id === user.id
                          ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                          : "border-transparent hover:bg-white/5 bg-transparent"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <span className="text-emerald-500 font-black text-sm uppercase">
                          {user.full_name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[var(--foreground)] truncate">
                          {user.full_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                          <p className="text-[10px] text-[var(--primary-500)] uppercase font-black tracking-widest">
                            {user.role}
                          </p>
                        </div>
                      </div>
                      {selectedUser?.id === user.id && (
                        <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="flex gap-4 mt-10 relative z-10">
                <button
                  onClick={startNewConversation}
                  disabled={!selectedUser}
                  className="flex-1 py-4 rounded-3xl bg-[var(--foreground)] text-[var(--background)] font-black text-sm transition-all shadow-xl hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                >
                  Start Conversation
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
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`flex items-end gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-emerald-500/10 flex items-center justify-center flex-shrink-0 mb-1 transition-opacity ${showAvatar ? "opacity-100" : "opacity-0 invisible h-0"}`}>
        <span className="text-emerald-500 font-black text-[10px]">
          {message.sender_name?.charAt(0).toUpperCase() || <User size={12}/>}
        </span>
      </div>

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%] group`}>
        <div
          className={`px-5 py-3 rounded-[1.5rem] text-[13px] leading-relaxed shadow-sm transition-all duration-300 relative ${
            isOwn
              ? "bg-emerald-500 text-white rounded-br-none shadow-emerald-500/10 hover:shadow-emerald-500/20"
              : "bg-white/[0.05] text-[var(--foreground)] border border-white/10 rounded-bl-none hover:bg-white/[0.08]"
          }`}
        >
          {message.content}
        </div>
        <div className={`flex items-center gap-1.5 mt-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] font-bold text-[var(--primary-600)] uppercase">
            {formatTime(message.created_at)}
          </span>
          {isOwn && (
            <div className="text-emerald-500">
               {message.is_read ? <CheckCheck size={12} strokeWidth={3}/> : <Check size={12} strokeWidth={3}/>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}