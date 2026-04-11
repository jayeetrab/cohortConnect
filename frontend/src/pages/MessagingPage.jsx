import React, { useState } from 'react';
import { Search, MoreHorizontal, Video, Edit, Image as ImageIcon, Paperclip, Send } from 'lucide-react';

export default function MessagingPage() {
  const [activeChat, setActiveChat] = useState("University Placement Office");

  const chats = [
     { id: 1, name: "University Placement Office", date: "Apr 2", preview: "Your CV was successfully uploaded and semantic parsed.", unread: true },
     { id: 2, name: "Alice Wang", date: "Apr 1", preview: "Thanks! Looking forward to the AI/ML course next semester.", unread: false },
     { id: 3, name: "Tata Consultancy Services - Talent", date: "Mar 28", preview: "We have reviewed your profile and suggest you update...", unread: false }
  ];

  return (
    <div className="bg-white rounded-lg border border-[var(--color-border)] shadow-sm max-w-full h-[75vh] flex overflow-hidden">
        {/* Left Side: Inbox List */}
        <div className="w-1/3 border-r border-[var(--color-border)] flex flex-col bg-white">
            <div className="p-3 border-b flex justify-between items-center bg-gray-50/50">
               <h2 className="font-bold text-gray-800">Messaging</h2>
               <div className="flex text-gray-500 gap-2">
                  <MoreHorizontal size={20} className="cursor-pointer hover:text-gray-800"/>
                  <Edit size={18} className="cursor-pointer hover:text-gray-800"/>
               </div>
            </div>
            <div className="p-2 border-b relative">
               <Search size={16} className="absolute left-4 top-4 text-gray-400"/>
               <input type="text" placeholder="Search messages" className="w-full pl-8 pr-2 py-1.5 bg-[#eef3f8] border border-transparent focus:border-gray-800 outline-none rounded text-sm"/>
            </div>
            <div className="flex-grow overflow-y-auto divide-y divide-[var(--color-border)]">
               {chats.map(chat => (
                  <div key={chat.id} onClick={() => setActiveChat(chat.name)} className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition ${activeChat === chat.name ? 'border-l-4 border-[#0a66c2] bg-blue-50/30' : 'border-l-4 border-transparent'}`}>
                     <div className="w-12 h-12 flex-shrink-0">
                         <img src={`https://ui-avatars.com/api/?name=${chat.name.replace(/ /g, '+')}&background=random`} className="rounded-full w-full h-full"/>
                     </div>
                     <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                           <h4 className={`text-sm truncate pr-2 ${chat.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>{chat.name}</h4>
                           <span className="text-[11px] text-gray-500 whitespace-nowrap">{chat.date}</span>
                        </div>
                        <p className={`text-xs truncate ${chat.unread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{chat.preview}</p>
                     </div>
                  </div>
               ))}
            </div>
        </div>

        {/* Right Side: Active Chat View */}
        <div className="w-2/3 flex flex-col bg-white">
            <div className="p-4 border-b flex justify-between items-center shadow-sm z-10 bg-white">
                <div>
                   <h3 className="font-bold text-gray-900">{activeChat}</h3>
                   <span className="text-xs text-gray-500">Active</span>
                </div>
                <div className="flex text-gray-500 gap-4">
                   <Video size={20} className="cursor-pointer hover:text-gray-800"/>
                   <MoreHorizontal size={20} className="cursor-pointer hover:text-gray-800"/>
                </div>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4 bg-[#f9fafb]">
               <div className="text-center text-xs text-gray-400 mb-2">SATURDAY</div>
               <div className="flex gap-3">
                  <div className="w-10 h-10 flex-shrink-0">
                      <img src={`https://ui-avatars.com/api/?name=${activeChat.replace(/ /g, '+')}&background=random`} className="rounded-full w-full h-full"/>
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none max-w-[80%] text-sm text-gray-800 shadow-sm">
                     Hello! Your profile has been ingested into the Cohort Connect pipeline successfully. Please allow the LLM nodes to index your experience properly.
                     <span className="block text-[10px] text-gray-400 mt-2 text-right">09:14 AM</span>
                  </div>
               </div>
               
               <div className="flex gap-3 mt-4 flex-row-reverse">
                  <div className="w-10 h-10 flex-shrink-0">
                      <img src={`https://ui-avatars.com/api/?name=Me&background=random`} className="rounded-full w-full h-full opacity-0"/>
                  </div>
                  <div className="bg-[#0a66c2] text-white p-3 rounded-lg rounded-tr-none max-w-[80%] text-sm shadow-sm group relative">
                     Thank you! The UI is looking fantastic! No more hanging loaders.
                     <span className="block text-[10px] text-blue-200 mt-2 text-right">09:16 AM</span>
                     <div className="absolute right-[-24px] bottom-1 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">Read</div>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-white border-t border-[var(--color-border)]">
               <div className="bg-[#f3f2ef] rounded-lg border border-transparent focus-within:border-gray-400 transition flex flex-col">
                  <textarea placeholder="Write a message..." className="w-full bg-transparent outline-none p-3 resize-none h-20 text-sm placeholder-gray-500"></textarea>
                  <div className="flex justify-between items-center px-3 pb-2 pt-1 border-t border-gray-200/50">
                     <div className="flex gap-3 text-gray-500">
                        <ImageIcon size={18} className="cursor-pointer hover:text-gray-800"/>
                        <Paperclip size={18} className="cursor-pointer hover:text-gray-800"/>
                     </div>
                     <button className="bg-[#0a66c2] text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-[#004182] transition flex items-center gap-1"><Send size={12}/> Send</button>
                  </div>
               </div>
            </div>
        </div>
    </div>
  );
}
