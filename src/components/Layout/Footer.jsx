import React from 'react'
import { HeartIcon } from '@heroicons/react/24/solid'

const Footer = () => {
  return (
    <footer className="bg-black/40 backdrop-blur-md py-8 mt-20 border-t border-white/10">
      <div className="container mx-auto px-6 text-center">
        <p className="flex items-center justify-center space-x-2">
          <span>Made with</span>
          <HeartIcon className="h-5 w-5 text-red-500 animate-pulse" />
          <span>for Gospel Music Lovers</span>
        </p>
        <p className="text-sm text-gray-400 mt-2">© 2024 Gospel Tune - Spreading the Word through Music</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="text-gray-400 hover:text-gospel-gold transition">About</a>
          <a href="#" className="text-gray-400 hover:text-gospel-gold transition">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-gospel-gold transition">Contact</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
