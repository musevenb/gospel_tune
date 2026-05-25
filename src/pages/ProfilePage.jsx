import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUserProfile, updateProfile } from '../store/slices/authSlice'
import { fetchUserSongs, deleteSong } from '../store/slices/songSlice'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import SongList from '../components/Songs/SongList'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const ProfilePage = () => {
  const { user, isLoading: authLoading } = useSelector((state) => state.auth)
  const { userSongs, isLoading: songsLoading } = useSelector((state) => state.songs)
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profilePicture: ''
  })

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile())
    } else {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      })
      dispatch(fetchUserSongs())
    }
  }, [dispatch, user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    await dispatch(updateProfile(formData))
    setIsEditing(false)
  }

  const handleDeleteSong = async (songId) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      await dispatch(deleteSong(songId))
    }
  }

  if (authLoading) return <LoadingSpinner />

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to view your profile</p>
      </div>
    )
  }

  const stats = [
    { label: 'Songs Uploaded', value: userSongs?.length || 0, icon: '🎵' },
    { label: 'Total Likes', value: userSongs?.reduce((acc, song) => acc + (song.stats?.likes || 0), 0) || 0, icon: '❤️' },
    { label: 'Total Plays', value: userSongs?.reduce((acc, song) => acc + (song.stats?.plays || 0), 0) || 0, icon: '👀' },
  ]

  const pendingSongs = userSongs?.filter(song => song.status === 'pending') || []
  const approvedSongs = userSongs?.filter(song => song.status === 'approved') || []
  const featuredSongs = userSongs?.filter(song => song.status === 'featured') || []
  const rejectedSongs = userSongs?.filter(song => song.status === 'rejected') || []

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=6B46C1&color=fff&size=150`}
              alt={user.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-gospel-gold"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">{user.username}</h1>
                {user.role === 'admin' && (
                  <span className="bg-gospel-purple text-xs px-2 py-1 rounded-full">Admin</span>
                )}
                {user.role === 'moderator' && (
                  <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">Moderator</span>
                )}
              </div>
              <p className="text-gray-300 mb-4">{user.bio || 'No bio yet. Click edit to add one!'}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Tell us about yourself and your music ministry..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Profile Picture URL</label>
                <input
                  type="url"
                  value={formData.profilePicture}
                  onChange={(e) => setFormData({...formData, profilePicture: e.target.value})}
                  className="input-field"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Songs Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Songs</h2>
          
          {songsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gospel-gold mx-auto"></div>
            </div>
          ) : (
            <>
              {featuredSongs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-gospel-gold">⭐ Featured ({featuredSongs.length})</h3>
                  <SongList songs={featuredSongs} />
                </div>
              )}
              
              {pendingSongs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-yellow-400">⏳ Pending Review ({pendingSongs.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingSongs.map(song => (
                      <div key={song._id} className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-semibold">{song.title}</h4>
                        <p className="text-sm text-gray-400">{song.artist}</p>
                        <button 
                          onClick={() => handleDeleteSong(song._id)}
                          className="mt-2 text-red-400 text-sm hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4 inline" /> Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {approvedSongs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-green-400">✅ Approved ({approvedSongs.length})</h3>
                  <SongList songs={approvedSongs} />
                </div>
              )}
              
              {rejectedSongs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-red-400">❌ Rejected ({rejectedSongs.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rejectedSongs.map(song => (
                      <div key={song._id} className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-semibold">{song.title}</h4>
                        <p className="text-sm text-gray-400">{song.artist}</p>
                        <p className="text-xs text-red-400 mt-1">Reason: {song.moderationNote || 'Content guidelines not met'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {userSongs?.length === 0 && (
                <div className="text-center py-12 bg-white/5 rounded-2xl">
                  <div className="text-6xl mb-3">🎵</div>
                  <p className="text-gray-400">You haven't uploaded any songs yet</p>
                  <a href="/upload" className="btn-primary inline-block mt-4">Upload Your First Song</a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage