import React from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import PlayerControls from '../AudioPlayer/PlayerControls'

const MainLayout = ({ children }) => {
  const location = useLocation()
  
  // Hide bottom player on PlayerPage
  const hideBottomPlayer = location.pathname.startsWith('/player/')
  
  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
      {!hideBottomPlayer && <PlayerControls />}
    </div>
  )
}

export default MainLayout