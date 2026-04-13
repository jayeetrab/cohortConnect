import React, { useState } from 'react';
import { 
  Search, MoreHorizontal, Video, Edit, Image as ImageIcon, 
  Paperclip, Send, User, Shield, Zap, Sparkles, Phone, Info,
  Search as SearchIcon, ArrowLeft, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function MessagingPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState("");
  const navigate = useNavigate();

  const chats = [
     { id: 1, name: "Placement Assistant", date: "09:14 AM", preview: "Your career profile is now active.", unread: true, online: true, role: "System Mentor" },
     { id: 2, name: "Sarah Jenkins", date: "11:20 AM", preview: "Your expertise matches our opening.", unread: false, online: true, role: "Alumni Mentor @ DeepMind" },
     { id: 3, name: "David Chen", date: "Yesterday", preview: "Let's discuss the quant research role.", unread: false, online: false, role: "Alumni @ Goldman Sachs" }
  ];

  const messages = [
    { sender: 'other', text: "Hello! Your profile has been analyzed by the Cohort Connect placement engine. I am here to help you navigate the current industry climate.", time: "09:14 AM" },
    { sender: 'me', text: "Thank you! I've just updated my skills. The job matches are looking very relevant.", time: "09:16 AM" },
    { sender: 'other', text: "Excellent. You have strong alignment with several premium roles in our network.", time: "09:20 AM" }
  ];

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-180px)] min-h-[600px] flex gap-6 overflow-hidden">
        
        {/* SIDEBAR: CHAT LIST */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`w-full md:w-80 flex flex-col glass-panel border border-[var(--border)] rounded-[2rem] overflow-hidden bg-[var(--background)]/60 backdrop-blur-3xl ${activeChat ? 'hidden md:flex' : 'flex'}`}
        >
            <div className="p-6 border-b border-[var(--border)] bg-black/5 dark:bg-white/5 space-y-4">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">Career Comms</h2>
                  <div className="flex gap-2">
                     <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--primary-600)] cursor-pointer hover:text-[var(--foreground)] transition-colors">
                        <Edit size={16} />
                     </div>
                  </div>
               </div>
               <div className="relative">
                  <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-600)]" />
                  <input 
                    type="text" 
                    placeholder="Search professional profiles..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl outline-none text-xs text-[var(--foreground)] focus:border-[var(--primary-500)] transition-all font-bold placeholder:text-[var(--primary-600)]"
                  />
               </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-2">
               {chats.map(chat => (
                  <div 
                    key={chat.id} 
                    onClick={() => setActiveChat(chat)} 
                    className={`p-4 rounded-2xl flex gap-4 cursor-pointer transition-all border ${activeChat?.id === chat.id ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-xl' : 'hover:bg-black/5 dark:hover:bg-white/5 bg-transparent border-transparent'}`}
                  >
                     <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-xl overflow-hidden border ${activeChat?.id === chat.id ? 'border-[var(--background)]/20 shadow-inner' : 'border-[var(--border)]'}`}>
                           <img src={`https://ui-avatars.com/api/?name=${chat.name.replace(/ /g, '+')}&background=random`} className="w-full h-full object-cover" alt={chat.name}/>
                        </div>
                        {chat.online && (
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${activeChat?.id === chat.id ? 'bg-emerald-400 border-[var(--foreground)]' : 'bg-emerald-500 border-[var(--background)]'}`}></div>
                        )}
                     </div>
                     <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                           <h4 className={`text-sm truncate font-black pr-2 tracking-tight ${activeChat?.id === chat.id ? 'text-[var(--background)]' : 'text-[var(--foreground)]'}`}>{chat.name}</h4>
                           <span className={`text-[10px] font-bold uppercase tracking-tighter ${activeChat?.id === chat.id ? 'text-[var(--background)] opacity-60' : 'text-[var(--primary-600)]'}`}>{chat.date}</span>
                        </div>
                        <p className={`text-[11px] font-bold truncate mt-0.5 ${activeChat?.id === chat.id ? 'text-[var(--background)] opacity-80' : 'text-[var(--primary-500)]'}`}>{chat.preview}</p>
                     </div>
                  </div>
               ))}
            </div>
        </motion.div>

        {/* ACTIVE CHAT VIEW */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex-grow flex flex-col glass-panel border border-[var(--border)] rounded-[2rem] overflow-hidden bg-[var(--background)]/60 backdrop-blur-3xl ${!activeChat ? 'hidden md:flex' : 'flex'}`}
        >
            {activeChat ? (
               <>
                   <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-white/5 backdrop-blur-3xl">
                       <div className="flex items-center gap-5">
                           <button onClick={() => setActiveChat(null)} className="md:hidden p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl text-[var(--primary-500)]">
                              <ArrowLeft size={20} />
                           </button>
                           <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[var(--border)] shadow-inner">
                              <img src={`https://ui-avatars.com/api/?name=${activeChat.name.replace(/ /g, '+')}&background=random`} className="w-full h-full" alt={activeChat.name}/>
                           </div>
                           <div>
                              <h3 className="font-black text-lg text-[var(--foreground)] tracking-tight">{activeChat.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{activeChat.online ? 'Active Now' : 'Consultant'}</span>
                              </div>
                           </div>
                       </div>
                       <div className="flex gap-4">
                          <button className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--primary-600)] hover:text-emerald-500 transition-all hover:scale-105">
                             <Phone size={20}/>
                          </button>
                          <button className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--primary-600)] hover:text-emerald-500 transition-all hover:scale-105">
                             <Video size={20}/>
                          </button>
                       </div>
                   </div>
                   
                   <div className="flex-grow p-10 overflow-y-auto flex flex-col gap-8 scrollbar-hide bg-transparent">
                      <div className="flex justify-center my-6">
                         <div className="px-6 py-2 rounded-full bg-emerald-500/5 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] border border-emerald-500/10 backdrop-blur-md">Secure Consultation Channel</div>
                      </div>
 
                      {messages.map((msg, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: msg.sender === 'me' ? 20 : -20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          key={i} 
                          className={`flex gap-4 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}
                        >
                           <div className={`p-6 rounded-[2rem] max-w-[85%] sm:max-w-[65%] text-sm font-bold shadow-2xl relative group ${
                             msg.sender === 'me' 
                             ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-tr-none' 
                             : 'bg-[var(--background)]/40 backdrop-blur-xl text-[var(--foreground)] border border-[var(--border)] rounded-tl-none'
                           }`}>
                              {msg.text}
                              <span className={`block text-[9px] font-black mt-3 uppercase tracking-widest ${msg.sender === 'me' ? 'text-white/60' : 'text-[var(--primary-600)]'}`}>
                                 {msg.time}
                              </span>
                              {msg.sender === 'me' && (
                                <div className="absolute -left-12 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <CheckCircle size={14} className="text-emerald-500" />
                                </div>
                              )}
                           </div>
                        </motion.div>
                      ))}
                   </div>
 
                   <div className="p-8 bg-white/5 backdrop-blur-3xl border-t border-[var(--border)]">
                      <div className="flex items-center gap-4 bg-[var(--background)]/60 border border-[var(--border)] p-3 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] focus-within:border-emerald-500/50 transition-all backdrop-blur-xl">
                         <div className="flex gap-2 pl-2">
                            <button className="p-3 text-[var(--primary-600)] hover:text-emerald-500 transition-all hover:scale-110"><ImageIcon size={22}/></button>
                            <button className="p-3 text-[var(--primary-600)] hover:text-emerald-500 transition-all hover:scale-110"><Paperclip size={22}/></button>
                         </div>
                         <input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && setInputText("")}
                            placeholder="Draft your professional response..." 
                            className="flex-grow bg-transparent outline-none p-3 text-sm text-[var(--foreground)] font-bold placeholder:text-[var(--primary-600)]"
                         />
                         <button 
                           onClick={() => setInputText("")}
                           className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_8px_16px_rgba(16,185,129,0.3)]"
                         >
                           <Send size={20}/>
                         </button>
                      </div>
                   </div>
               </>
            ) : (
               <div className="flex-grow flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="relative">
                     <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
                     <MessageSquare size={80} className="text-[var(--border)] relative z-10" />
                  </div>
                  <div className="max-w-xs space-y-2 relative z-10">
                     <h3 className="text-2xl font-black text-[var(--foreground)]">Consultant Offline</h3>
                     <p className="text-[var(--primary-500)] text-sm font-medium leading-relaxed">
                        Select a verified mentor or alumni from the directory to initiate a career consultation channel.
                     </p>
                  </div>
                  <button onClick={() => navigate('/alumni')} className="bg-[var(--foreground)] text-[var(--background)] px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:opacity-90 transition-all">
                     View Alumni Network
                  </button>
               </div>
            )}
        </motion.div>
    </div>
  );
}
