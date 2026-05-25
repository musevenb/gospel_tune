import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import apiClient from '../store/api/apiClient'
import { 
  UsersIcon, MusicalNoteIcon, ChatBubbleLeftRightIcon, 
  PlayIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  EyeIcon, TrashIcon, StarIcon, UserPlusIcon,
  ChartBarIcon, DocumentTextIcon, ArrowPathIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [pendingSongs, setPendingSongs] = useState([])
  const [pendingSermons, setPendingSermons] = useState([])
  const [allSongs, setAllSongs] = useState([])
  const [allSermons, setAllSermons] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [contentType, setContentType] = useState('song') // 'song' or 'sermon'

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, pendingSongsRes, pendingSermonsRes, songsRes, sermonsRes, usersRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/pending-songs'),
        apiClient.get('/admin/pending-sermons'),
        apiClient.get('/admin/songs'),
        apiClient.get('/admin/sermons'),
        apiClient.get('/admin/users')
      ])
      setStats(statsRes.data.stats)
      setPendingSongs(pendingSongsRes.data)
      setPendingSermons(pendingSermonsRes.data || [])
      setAllSongs(songsRes.data.songs)
      setAllSermons(sermonsRes.data?.sermons || [])
      setUsers(usersRes.data.users)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSong = async (songId, status, note = '') => {
    try {
      await apiClient.put(`/songs/${songId}/approve`, { status, note })
      toast.success(`Song ${status === 'approved' ? 'approved' : 'rejected'}!`)
      fetchDashboardData()
      setShowModal(false)
      setRejectReason('')
    } catch (error) {
      toast.error('Failed to update song status')
    }
  }

  const handleApproveSermon = async (sermonId, status, note = '') => {
    try {
      await apiClient.put(`/admin/sermons/${sermonId}/approve`, { status, note })
      toast.success(`Sermon ${status === 'approved' ? 'approved' : 'rejected'}!`)
      fetchDashboardData()
      setShowModal(false)
      setRejectReason('')
    } catch (error) {
      toast.error('Failed to update sermon status')
    }
  }

  const handleFeatureSong = async (songId) => {
    try {
      await apiClient.put(`/admin/songs/${songId}/feature`)
      toast.success('Song feature toggled')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to toggle feature')
    }
  }

  const handleFeatureSermon = async (sermonId) => {
    try {
      await apiClient.put(`/admin/sermons/${sermonId}/feature`)
      toast.success('Sermon feature toggled')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to toggle feature')
    }
  }

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role })
      toast.success(`User role updated to ${role}`)
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure? This will delete all user data including songs, sermons and comments.')) {
      try {
        await apiClient.delete(`/admin/users/${userId}`)
        toast.success('User deleted successfully')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  const handleDeleteSong = async (songId) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await apiClient.delete(`/songs/${songId}`)
        toast.success('Song deleted')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete song')
      }
    }
  }

  const handleDeleteSermon = async (sermonId) => {
    if (window.confirm('Are you sure you want to delete this sermon?')) {
      try {
        await apiClient.delete(`/admin/sermons/${sermonId}`)
        toast.success('Sermon deleted')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete sermon')
      }
    }
  }

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: UsersIcon, 
      color: 'bg-blue-500',
      change: '+12%',
      description: 'Active users'
    },
    { 
      label: 'Total Songs', 
      value: stats?.totalSongs || 0, 
      icon: MusicalNoteIcon, 
      color: 'bg-green-500',
      change: '+8%',
      description: 'In library'
    },
    { 
      label: 'Total Sermons', 
      value: stats?.totalSermons || 0, 
      icon: BookOpenIcon, 
      color: 'bg-purple-500',
      change: '+15%',
      description: 'Teachings available'
    },
    { 
      label: 'Pending Songs', 
      value: stats?.pendingSongs || 0, 
      icon: ClockIcon, 
      color: 'bg-yellow-500',
      change: pendingSongs.length > 0 ? 'Need review' : 'All clear',
      description: 'Awaiting approval'
    },
    { 
      label: 'Pending Sermons', 
      value: stats?.pendingSermons || 0, 
      icon: DocumentTextIcon, 
      color: 'bg-orange-500',
      change: pendingSermons.length > 0 ? 'Need review' : 'All clear',
      description: 'Awaiting approval'
    },
    { 
      label: 'Total Plays', 
      value: stats?.totalPlays || 0, 
      icon: PlayIcon, 
      color: 'bg-pink-500',
      change: '+18%',
      description: 'Song streams'
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-gospel-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access the admin portal.</p>
        </div>
      </div>
    )
  }

  const totalPending = (pendingSongs?.length || 0) + (pendingSermons?.length || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Portal</h1>
          <p className="text-gray-400">Manage users, songs, sermons, and moderate content</p>
          {totalPending > 0 && (
            <div className="mt-2 inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
              <ClockIcon className="h-4 w-4" />
              {totalPending} items pending review
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:scale-105 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-semibold ${stat.change.includes('+') ? 'text-green-400' : 'text-yellow-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value.toLocaleString()}</div>
                <p className="text-gray-300 text-sm">{stat.label}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.description}</p>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-8 border-b border-white/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-t-lg transition ${
              activeTab === 'overview' 
                ? 'bg-gospel-purple text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ClockIcon className="h-5 w-5 inline mr-2" />
            Pending ({pendingSongs.length + pendingSermons.length})
          </button>
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-6 py-3 rounded-t-lg transition ${
              activeTab === 'songs' 
                ? 'bg-gospel-purple text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <MusicalNoteIcon className="h-5 w-5 inline mr-2" />
            All Songs ({allSongs.length})
          </button>
          <button
            onClick={() => setActiveTab('sermons')}
            className={`px-6 py-3 rounded-t-lg transition ${
              activeTab === 'sermons' 
                ? 'bg-gospel-purple text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpenIcon className="h-5 w-5 inline mr-2" />
            All Sermons ({allSermons.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-t-lg transition ${
              activeTab === 'users' 
                ? 'bg-gospel-purple text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <UsersIcon className="h-5 w-5 inline mr-2" />
            Users ({users.length})
          </button>
        </div>

        {/* Pending Items Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Pending Songs */}
            {pendingSongs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MusicalNoteIcon className="h-6 w-6 text-gospel-gold" />
                  Pending Songs ({pendingSongs.length})
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {pendingSongs.map((song) => (
                    <div key={song._id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:shadow-2xl transition">
                      <div className="flex flex-col md:flex-row gap-6">
                        <img
                          src={song.albumArt || 'https://via.placeholder.com/150x150?text=Album+Art'}
                          alt={song.title}
                          className="w-32 h-32 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-2xl font-semibold mb-1">{song.title}</h3>
                              <p className="text-gospel-gold text-lg">{song.artist}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs bg-white/20 px-2 py-1 rounded">🎵 {song.genre}</span>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded">📀 {song.album || 'Single'}</span>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded">🌍 {song.language || 'English'}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Uploaded by</p>
                              <p className="font-semibold">{song.artistId?.username || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{new Date(song.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3 mt-6">
                            <button
                              onClick={() => handleApproveSong(song._id, 'approved')}
                              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition flex items-center gap-2"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                              Approve Song
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(song)
                                setContentType('song')
                                setShowModal(true)
                              }}
                              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition flex items-center gap-2"
                            >
                              <XCircleIcon className="h-5 w-5" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleFeatureSong(song._id)}
                              className="bg-gospel-gold text-gospel-dark hover:bg-yellow-500 px-6 py-2 rounded-lg transition flex items-center gap-2"
                            >
                              <StarIcon className="h-5 w-5" />
                              Feature
                            </button>
                            <button
                              onClick={() => window.open(song.audioUrl, '_blank')}
                              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition flex items-center gap-2"
                            >
                              <PlayIcon className="h-5 w-5" />
                              Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Sermons */}
            {pendingSermons.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpenIcon className="h-6 w-6 text-gospel-gold" />
                  Pending Sermons ({pendingSermons.length})
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {pendingSermons.map((sermon) => (
                    <div key={sermon._id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:shadow-2xl transition">
                      <div className="flex flex-col md:flex-row gap-6">
                        <img
                          src={sermon.thumbnail || 'https://via.placeholder.com/150x150?text=Sermon'}
                          alt={sermon.title}
                          className="w-32 h-32 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-2xl font-semibold mb-1">{sermon.title}</h3>
                              <p className="text-gospel-gold text-lg">by {sermon.preacher}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs bg-white/20 px-2 py-1 rounded">📖 {sermon.type}</span>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded">🌍 {sermon.language || 'English'}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Submitted by</p>
                              <p className="font-semibold">{sermon.preacherId?.username || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{new Date(sermon.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <p className="text-gray-300 text-sm mt-2 line-clamp-2">{sermon.description}</p>
                          
                          <div className="flex gap-3 mt-6">
                            <button
                              onClick={() => handleApproveSermon(sermon._id, 'approved')}
                              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition flex items-center gap-2"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                              Approve Sermon
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(sermon)
                                setContentType('sermon')
                                setShowModal(true)
                              }}
                              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition flex items-center gap-2"
                            >
                              <XCircleIcon className="h-5 w-5" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleFeatureSermon(sermon._id)}
                              className="bg-gospel-gold text-gospel-dark hover:bg-yellow-500 px-6 py-2 rounded-lg transition flex items-center gap-2"
                            >
                              <StarIcon className="h-5 w-5" />
                              Feature
                            </button>
                            <button
                              onClick={() => window.open(sermon.audioUrl || sermon.videoUrl, '_blank')}
                              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition flex items-center gap-2"
                            >
                              <PlayIcon className="h-5 w-5" />
                              Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingSongs.length === 0 && pendingSermons.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-2xl">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                <p className="text-gray-400">No pending songs or sermons to review</p>
              </div>
            )}
          </div>
        )}

        {/* All Songs Tab */}
        {activeTab === 'songs' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left">Song</th>
                    <th className="px-6 py-4 text-left">Artist</th>
                    <th className="px-6 py-4 text-left">Uploader</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Plays</th>
                    <th className="px-6 py-4 text-left">Likes</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allSongs.map((song) => (
                    <tr key={song._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={song.albumArt || 'https://via.placeholder.com/40x40'} className="w-10 h-10 rounded object-cover" />
                          <span className="font-semibold">{song.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{song.artist}</td>
                      <td className="px-6 py-4">{song.artistId?.username || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          song.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          song.status === 'featured' ? 'bg-gospel-gold/20 text-gospel-gold' :
                          song.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {song.status === 'featured' ? '⭐ Featured' : song.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{song.stats?.plays || 0}</td>
                      <td className="px-6 py-4">{song.stats?.likes || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleFeatureSong(song._id)} className="text-gospel-gold hover:text-yellow-500">
                            <StarIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDeleteSong(song._id)} className="text-red-400 hover:text-red-600">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Sermons Tab */}
        {activeTab === 'sermons' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left">Title</th>
                    <th className="px-6 py-4 text-left">Preacher</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Uploader</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Views</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allSermons.map((sermon) => (
                    <tr key={sermon._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={sermon.thumbnail || 'https://via.placeholder.com/40x40'} className="w-10 h-10 rounded object-cover" />
                          <span className="font-semibold">{sermon.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{sermon.preacher}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-purple-500/20 px-2 py-1 rounded">
                          {sermon.type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">{sermon.preacherId?.username || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sermon.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          sermon.status === 'featured' ? 'bg-gospel-gold/20 text-gospel-gold' :
                          sermon.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {sermon.status === 'featured' ? '⭐ Featured' : sermon.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{sermon.stats?.views || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleFeatureSermon(sermon._id)} className="text-gospel-gold hover:text-yellow-500">
                            <StarIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDeleteSermon(sermon._id)} className="text-red-400 hover:text-red-600">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Role</th>
                    <th className="px-6 py-4 text-left">Songs</th>
                    <th className="px-6 py-4 text-left">Sermons</th>
                    <th className="px-6 py-4 text-left">Joined</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}&background=6B46C1&color=fff`} 
                            className="w-10 h-10 rounded-full object-cover" 
                          />
                          <span className="font-semibold">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                          className="bg-white/10 rounded px-3 py-1 text-sm focus:outline-none"
                        >
                          <option value="user">👤 User</option>
                          <option value="moderator">🛡️ Moderator</option>
                          <option value="admin">👑 Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">{u.uploadedSongs?.length || 0}</td>
                      <td className="px-6 py-4">{u.uploadedSermons?.length || 0}</td>
                      <td className="px-6 py-4 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-400 hover:text-red-600 transition"
                          disabled={u._id === user?._id}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Reject {contentType === 'song' ? 'Song' : 'Sermon'}</h3>
              <p className="text-gray-300 mb-4">
                Provide a reason for rejecting "{selectedItem.title}" by {contentType === 'song' ? selectedItem.artist : selectedItem.preacher}
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="input-field w-full mb-6"
                rows="4"
              ></textarea>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (contentType === 'song') {
                      handleApproveSong(selectedItem._id, 'rejected', rejectReason)
                    } else {
                      handleApproveSermon(selectedItem._id, 'rejected', rejectReason)
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg flex-1"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setRejectReason('')
                    setSelectedItem(null)
                  }}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard