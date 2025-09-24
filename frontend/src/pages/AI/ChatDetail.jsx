import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import AIMessageFormatter from "../../components/AiMessageFormatter";
import Sidebar from "../../components/Sidebar";
import { X, ArrowDown, ImagePlus, SendHorizontal, Plus, MoveRight, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MessageList = React.memo(({ messages, messagesEndRef, isLoading }) => {
  return (
    <AnimatePresence>
      {messages.map((m, index) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: m.sender === "user" ? 20 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex ${m.sender === "user" ? "justify-end flex flex-col items-end gap-2" : "justify-start"}`}
          ref={index === messages.length - 1 ? messagesEndRef : null}
        >
          {m.photo_path && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-2 rounded-2xl max-w-xs overflow-hidden relative"
            >
              {!m.photo_path ? (
                <div className="w-40 h-40 bg-gray-300 animate-pulse rounded" />
              ) : (
                <img
                  src={m.photo_path.startsWith("https") ? m.photo_path : `https://api-ai.rakarawr.com/storage/${m.photo_path}`}
                  alt="chat attachment"
                  className="w-full h-full object-cover rounded"
                />
              )}
            </motion.div>
          )}

          <div
            className={`p-2 px-3 pt-1 rounded-2xl ${
              m.center
                ? "w-full mt-[30vh] bg-none text-white text-2xl lg:text-4xl mx-auto text-center"
                : m.sender === "user"
                ? "max-w-[70%] bg-[#2b2b2b] border border-[#39393a] text-white rounded-br-md"
                : "max-w-[85%] bg-none text-white"
            }`}
          >
            <AIMessageFormatter message={m.message} isUser={m.sender === "user"} messageId={m.id} />
          </div>
        </motion.div>
      ))}

      {isLoading && (
        <motion.div
          className="flex justify-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-none rounded-2xl rounded-bl-md p-3 max-w-[70%]">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
              <span className="text-sm text-gray-500"></span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default function ChatDetail() {
  const { token, user } = useContext(AuthContext);
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState("");
  const [refreshSidebar, setRefreshSidebar] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPhotoPopupOpen, setIsPhotoPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // New state for error message
  const messagesEndRef = useRef(null);

  const handleToggleCollapse = () => setIsCollapsed(!isCollapsed);
  const handlePhotoChange = (e) => { if (e.target.files?.[0]) setPhoto(e.target.files[0]); };
  const handleRemovePhoto = () => setPhoto(null);
  const togglePhotoPopup = () => setIsPhotoPopupOpen(!isPhotoPopupOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getGreeting = (userName) => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return `Selamat pagi, ${userName}!`;
    if (hour >= 12 && hour < 15) return `Selamat siang, ${userName}!`;
    if (hour >= 15 && hour < 18) return `Selamat sore, ${userName}!`;
    return `Malam! Jangan lupa ngopi, ${userName}!`;
  };

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`https://api-ai.rakarawr.com/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
        fetchChatTitle();
        scrollToBottom();

        if (res.data.length === 0) {
          const greetingMessage = getGreeting(user.name);
          setMessages([
            {
              id: `greeting-${Date.now()}`,
              sender: "ai",
              message: greetingMessage,
              created_at: new Date().toISOString(),
              photo_path: null,
              center: true,
            },
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [chatId, token]);

const fetchChatTitle = async () => {
  if (!chatId) return;
  try {
    const res = await axios.get(`https://api-ai.rakarawr.com/api/chats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(res.data); // cek apakah setiap chat punya title
    const currentChat = res.data.find(chat => String(chat.id) === chatId);
    if (currentChat) {
      console.log("Current Chat:", currentChat);
      setChatTitle(currentChat.title || "Chat Baru");
    } else {
      setChatTitle("Chat Baru");
    }
  } catch (err) {
    console.error("Error fetching chat title:", err);
  }
};


  const updateChatTitle = async (newTitle) => {
    try {
      await axios.put(`https://api-ai.rakarawr.com/api/updateChat/${chatId}`, { title: newTitle }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatTitle(newTitle);
      if (refreshSidebar) refreshSidebar();
    } catch (err) {
      console.error("Error updating chat title:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !photo || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null); // Reset error message
    setMessages(prev => prev.filter(m => !m.id.toString().startsWith("greeting-")));

    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      message: input,
      photo_path: photo ? URL.createObjectURL(photo) : null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);
    setInput("");
    setPhoto(null);

    try {
      const formData = new FormData();
      formData.append("message", input);
      if (photo) formData.append("photo", photo);

      const res = await axios.post(
        `https://api-ai.rakarawr.com/api/chat/${chatId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempMessage.id),
        res.data.user,
        res.data.ai
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      if (err.response?.data?.error) {
        setErrorMessage(err.response.data.error); // Set specific error message from backend
      } else {
        setErrorMessage("Gagal mengirim pesan. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[99vh] bg-[#161618]">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />

      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : ''}`} style={{ maxWidth: '100vw', overflow: 'hidden' }}>
        <div className="h-[10vh] flex w-full justify-start gap-2 lg:justify-between items-center px-5">
          <p className="flex items-center gap-3 mb-5 text-xs p-3 bg-[#1d1d1f] border border-[#303030] hover:bg-[#2c2c2e] text-white rounded-lg">
            Model <MoveRight size={15} /> rakai-0-9.
          </p>
          <button className="flex items-center gap-3 mb-5 text-xs p-3 bg-[#1d1d1f] border border-[#303030] hover:bg-[#2c2c2e] text-white rounded-lg">
            <Share size={15}/> Share 
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 px-2 pr-5 lg:px-100 overflow-y-auto p-4 space-y-4">
          {!chatId ? <div className="flex justify-center h-full">Pilih chat...</div>
            : <MessageList messages={messages} messagesEndRef={messagesEndRef} isLoading={isLoading} />}
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute w-[90%] top-15 text-sm left-1/2 transform -translate-x-1/2 bg-[#2e2e2e] border border-[#4c4c4c] text-white p-3 rounded-lg shadow-md z-50"
          >
            {errorMessage}
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-2 text-white underline"
            >
              Tutup
            </button>
          </motion.div>
        )}

        {/* Input Area */}
        {chatId && (
          <div className="bg-[#202023] p-2 rounded-4xl mb-5 flex flex-col items-start justify-center w-[90%] lg:w-[50%] mx-auto relative">
            <div className="photo">
              {photo && (
                <motion.div
                  className="relative inline-block w-20 h-20 rounded overflow-hidden m-2 lg:m-5 mb-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-full h-full bg-gray-300 animate-pulse rounded" />
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="preview"
                    className="w-full h-full object-cover rounded absolute top-0 left-0"
                  />
                  <button
                    onClick={handleRemovePhoto}
                    className="absolute top-1 right-1 bg-[#404040] text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </div>
            <div className="flex w-full items-center justify-center">
              <button
                onClick={togglePhotoPopup}
                className="bg-[#2b2b2e] hover:bg-[#404044] rounded-full p-3 text-white shadow-md"
              >
                <Plus size={20} />
              </button>
              <AnimatePresence>
                {isPhotoPopupOpen && (
                  <motion.div
                    className="absolute top-[-7vh] left-0 bg-[#2b2b2e] rounded-full shadow-md p-2 z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.1 }}
                    style={{ zIndex: 100 }}
                  >
                    <label className="cursor-pointer text-xs lg:text-normal flex items-center gap-2 hover:bg-[#ffffff] text-white hover:text-black p-1 lg:p-2 rounded-full">
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      <ImagePlus size={15} />
                      Tambahkan Foto
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex mt-2 items-center w-[90%]">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tulis pesan..."
                    rows={1}
                    className="w-full resize-none border border-none text-white rounded-2xl px-4 py-3 outline-none"
                    style={{ minHeight: "48px", maxHeight: "120px" }}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() && !photo || isLoading}
                  className="bg-[#2b2b2e] mb-2 hover:bg-[#404044] disabled:text-[#7b7b7b] disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-colors"
                >
                  <SendHorizontal />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}