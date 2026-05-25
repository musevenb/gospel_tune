import React from 'react'
import SongCard from './SongCard'

const SongList = ({ songs }) => {
  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No songs found 🙏</p>
        <p className="text-sm mt-2">Check back later for new Gospel music!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {songs.map((song) => (
        <SongCard key={song._id} song={song} />
      ))}
    </div>
  )
}

export default SongList