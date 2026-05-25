import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { fetchNotifications } from '../../store/slices/notificationSlice'
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  PlusCircleIcon, 
  HomeIcon, 
  BellIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { MusicalNoteIcon } from '@heroicons/react/24/solid'

const Navbar = () => {
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications())
    }
  }, [dispatch, user])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`)
      setSearchTerm('')
      setMobileMenuOpen(false)
    }
  }

  return (
    <nav className="bg-black/60 backdrop-blur-md fixed w-full z-50 top-0 border-b border-white/10">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <MusicalNoteIcon className="h-8 w-8 text-gospel-gold group-hover:rotate-12 transition" />
            <span className="text-2xl font-bold bg-gradient-to-r from-gospel-gold to-purple-400 bg-clip-text text-transparent">
              Gospel Tune
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white/10 rounded-lg px-3 py-1">
            <input
              type="text"
              placeholder="Search songs, sermons, artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-white px-2 py-1 w-80"
            />
            <button type="submit">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </button>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 hover:text-gospel-gold transition">
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>
            
            <Link to="/sermons" className="flex items-center space-x-1 hover:text-gospel-gold transition">
              <BookOpenIcon className="h-5 w-5" />
              <span>Sermons</span>
            </Link>
            
            {user && (
              <Link to="/upload" className="flex items-center space-x-1 hover:text-gospel-gold transition">
                <PlusCircleIcon className="h-5 w-5" />
                <span>Upload</span>
              </Link>
            )}

            {user && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative hover:text-gospel-gold transition"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-xl border border-white/10 z-50">
                    <div className="p-3 border-b border-white/10">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <p className="text-center text-gray-400 py-4 text-sm">
                        No new notifications
                      </p>
                    </div>
                    <button 
                      className="w-full p-2 text-center text-sm text-gospel-gold hover:bg-white/10 transition"
                      onClick={() => setShowNotifications(false)}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 hover:text-gospel-gold transition">
                  <img 
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=6B46C1&color=fff`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden lg:inline">{user.username}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center space-x-1 text-xs bg-gospel-purple px-3 py-1 rounded-full hover:bg-purple-700 transition">
                    <ChartBarIcon className="h-3 w-3" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600/20 hover:bg-red-600/30 px-4 py-2 rounded-lg transition text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-primary text-sm py-2">
                  <UserIcon className="h-5 w-5 inline mr-1" />
                  Login
                </Link>
                <Link to="/register" className="btn-secondary text-sm py-2">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-slide-down">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex items-center bg-white/10 rounded-lg px-3 py-2">
              <input
                type="text"
                placeholder="Search songs, sermons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-white px-2 py-1 flex-1"
              />
              <button type="submit">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </button>
            </form>
            
            <Link 
              to="/" 
              className="block py-2 hover:text-gospel-gold transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              🏠 Home
            </Link>
            
            <Link 
              to="/sermons" 
              className="block py-2 hover:text-gospel-gold transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              📖 Sermons
            </Link>
            
            {user && (
              <Link 
                to="/upload" 
                className="block py-2 hover:text-gospel-gold transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                📤 Upload Content
              </Link>
            )}
            
            {user && (
              <Link 
                to="/profile" 
                className="block py-2 hover:text-gospel-gold transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 Profile
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="block py-2 hover:text-gospel-gold transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                👑 Admin Panel
              </Link>
            )}
            
            {!user && (
              <>
                <Link 
                  to="/login" 
                  className="block py-2 btn-primary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 btn-secondary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
            
            {user && (
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="block w-full py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-center"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar