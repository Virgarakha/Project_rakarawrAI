import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import GoogleCallback from './pages/GoogleCallback'
import GithubCallback from './pages/GithubCallback'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import ChatDetail from './pages/AI/ChatDetail'
import VoiceChatDetail from './pages/AI/VoiceChatDetail'
import Chat from './pages/AI/Chat'
import Plans from './pages/AI/Plans'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/google/callback' element={<GoogleCallback />} />
          <Route path='/github/callback' element={<GithubCallback />} />
          <Route path='/plans' element={<Plans />} />

          <Route element={<PrivateRoute />}>
            <Route path='/' element={<Chat />} />
            <Route path='/chat/:id' element={<ChatDetail />} />
            <Route path='/voice/:id' element={<VoiceChatDetail />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
