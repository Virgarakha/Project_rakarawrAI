import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  MessageSquare,
  Menu,
  SquarePen,
  AudioWaveform,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id: currentChatId } = useParams();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editChatId, setEditChatId] = useState(null);
const [editTitle, setEditTitle] = useState("");

const openEditModal = (chat) => {
  setEditChatId(chat.id);
  setEditTitle(chat.title || "");
};

const closeEditModal = () => {
  setEditChatId(null);
  setEditTitle("");
};

const saveEditTitle = async () => {
  if (!editTitle.trim()) return;
  try {
    await axios.put(
      `https://api-ai.rakarawr.com/api/updateChat/${editChatId}`,
      { title: editTitle },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setChats(chats.map(chat => chat.id === editChatId ? { ...chat, title: editTitle } : chat));
    closeEditModal();
  } catch (err) {
    console.error(err);
  }
};

  // Desktop collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile show/hide
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [token]);

  const fetchChats = async () => {
    try {
      const res = await axios.get("https://api-ai.rakarawr.com/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await axios.post(
        "https://api-ai.rakarawr.com/public/api/chats",
        { title: "Chat Baru" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newChat = res.data;
      setChats([newChat, ...chats]);
      navigate(`/chat/${newChat.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const createVoiceChat = async () => {
    try {
      const res = await axios.post(
        "https://api-ai.rakarawr.com/public/api/chats",
        { title: "Chat Baru" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newChat = res.data;
      setChats([newChat, ...chats]);
      navigate(`/voice/${newChat.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!confirm("Hapus chat ini?")) return;
    try {
      await axios.delete(`https://api-ai.rakarawr.com/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(chats.filter(chat => chat.id !== chatId));
      if (currentChatId == chatId) navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hari ini";
    if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate("/login");
    }
  };

  const handleUpgrade = () => {
    navigate("/plans");
  };

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) { // Desktop
      setIsCollapsed(!isCollapsed);
    } else { // Mobile
      setIsMobileOpen(!isMobileOpen);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
className={`
    fixed top-0 left-0 h-full bg-[#161618] border-r border-[#303030] text-white z-40
    transition-all duration-300 ease-in-out transform
    ${isCollapsed ? "w-16" : "w-80"} 
    block md:block
    ${isMobileOpen ? "translate-x-0 md:translate-x-0" : "translate-x-[-100%] md:translate-x-0"} 
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#303030]">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && <h2 className="text-xl font-semibold">rakarawr.ai</h2>}
            
            {/* Toggle button */}
            <button
              onClick={toggleSidebar}
              className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                isCollapsed ? "mx-auto" : ""
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* New Chat Buttons */}
          <button
            onClick={createNewChat}
            className={`w-full mb-5 bg-[#1d1d1f] border border-[#303030] hover:bg-[#2c2c2e] text-white rounded-lg transition-all flex items-center gap-2 ${
              isCollapsed ? "p-2 justify-start" : "py-2 px-4 justify-start"
            }`}
            title={isCollapsed ? "Chat Baru" : ""}
          >
            <SquarePen className="w-4 h-4"/>
            {!isCollapsed && <span className="text-sm">Chat Baru</span>}
          </button>

          <button
            onClick={createVoiceChat}
            className={`w-full mb-5 bg-[#1d1d1f] border border-[#303030] hover:bg-[#2c2c2e] text-white rounded-lg transition-all flex items-center gap-2 ${
              isCollapsed ? "p-2 justify-start" : "py-2 px-4 justify-start"
            }`}
            title={isCollapsed ? "Obrolan suara" : ""}
          >
            <AudioWaveform className="w-4 h-4"/>
            {!isCollapsed && <span className="text-sm">Obrolan suara</span>}
            {!isCollapsed && <p className="text-[10px] rounded-full bg-blue-500 p-1 py-0">BETA</p>}
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 mt-5 overflow-y-auto p-4" style={{ maxHeight: "calc(81vh - 120px)" }}>
          {loading ? (
            <div className={isCollapsed ? "space-y-3" : "animate-pulse space-y-3"}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={isCollapsed ? "h-10 w-full mx-auto bg-gray-700 rounded" : "h-12 bg-gray-700 rounded"} />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className={`p-4 text-gray-400 text-center ${isCollapsed ? "hidden" : ""}`}>
              <p>Belum ada chat</p>
              <p className="text-sm mt-1">Klik "Chat Baru" untuk memulai</p>
            </div>
          ) : (
            <div>
              <p className="text-sm p-2 text-[#6e6e6e]">Obrolan</p>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className={`group items-center rounded-lg cursor-pointer transition-all mb-2 ${currentChatId == chat.id ? "bg-[#2e2e2e] text-white" : "hover:bg-[#1d1d1f] p-0 "} ${isCollapsed ? "p-3 pb-2" : "p-3 pb-2"}`}
                  title={isCollapsed ? chat.title || "Chat Tanpa Judul" : ""}
                >
                  {isCollapsed ? (
                    <div className="flex justify-center">
                      <MessageSquare size={15} />
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm truncate">{chat.title || "Chat Tanpa Judul"}</h3>
                      </div>
                        <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(chat); }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#404040] cursor-pointer rounded transition-all"
                            title="Edit chat"
                        >
                            <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => deleteChat(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#404040] cursor-pointer rounded transition-all"
                            title="Hapus chat"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>

                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

{editChatId && (
  <div className="fixed inset-0 px-5 flex items-center justify-center bg-[#0000004b] bg-opacity-50 z-50">
    <div className="bg-[#1d1d1f] p-4 rounded-lg w-80 flex flex-col gap-4 border border-[#404040]">
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="w-full py-2 text-sm border-b border-[#404040] text-white outline-none"
      />
      <div className="flex text-xs justify-end gap-2">
        <button
          onClick={closeEditModal}
          className="px-4 py-2 border border-[#404040] text-white rounded"
        >
          Cancel
        </button>
        <button
          onClick={saveEditTitle}
          className="px-4 py-2 bg-[#404040] hover:bg-[#272727] text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-[#303030] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className={`w-10 h-10 rounded-full object-cover ${
                    user.plan === 'Premium' ? 'border-2 border-purple-400' :
                    user.plan === 'Pro' ? 'border-2 border-blue-500' : ''
                  }`}
                />
              )}
              <div>
                <p className="text-sm font-medium">{user.name || "User"}</p>
                <p className="text-xs text-gray-400">{user.plan}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="p-2 bg-[#1d1d1f] hover:bg-[#2c2c2f] text-white rounded-lg text-sm transition-colors"
              >
                <LogOut size={15} />
              </button>
              <button
                onClick={handleUpgrade}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-2 border border-[#343434] right-5 z-50 p-3 bg-[#1d1d1f] hover:bg-[#2c2c2f] text-white rounded-lg md:hidden"
      >
        <Menu size={15} />
      </button>

      {/* Spacer untuk main content */}
      <div className={`transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-80"} hidden md:block`} />
    </>
  );
}
