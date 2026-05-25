import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import MainLayout from './components/Layout/MainLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SongPlayerPage from './pages/SongPlayerPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import UploadPage from './pages/UploadPage'
import SermonsPage from './pages/SermonsPage'
import PlayerPage from './pages/PlayerPage'
import { fetchSongs } from './store/slices/songSlice'

function AppContent() {
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(fetchSongs())
  }, [dispatch])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/song/:id" element={<SongPlayerPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/sermons" element={<SermonsPage />} />
      <Route path="/player/:type/:id" element={<PlayerPage />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <MainLayout>
        <AppContent />
      </MainLayout>
    </Router>
  )
}

export default App