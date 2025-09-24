// GithubCallback.jsx
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GithubCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const user = params.get('user')

    if (token && user) {
        const parsedUser = JSON.parse(decodeURIComponent(user))
        login(parsedUser, token)
        navigate('/')
    } else {
        navigate('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []) // ✅ hanya jalan sekali saat mount


  return <div>Logging in with GitHub...</div>
}

export default GithubCallback
