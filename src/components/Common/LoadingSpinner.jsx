import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gospel-gold mx-auto mb-4"></div>
        <p className="text-gospel-gold">Loading Gospel music...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner