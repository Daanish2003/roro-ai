import { useAuth } from '@/hooks/use-auth'
import React from 'react'
import { FaGithub } from 'react-icons/fa'

export default function GithubButton() {
    const { socialSignInHandler, loading} = useAuth()
  return (
    <button className="gsi-material-button bg-transparent border-primary w-full" 
    onClick={() => socialSignInHandler("github")} 
    disabled={loading}>
      <div className="gsi-material-button-state"></div>
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <FaGithub className="w-5 h-5" />
        </div>
        <span className="gsi-material-button-contents">Sign in with GitHub</span>
        <span className="hidden">Sign in with GitHub</span>
      </div>
    </button>
  )
}
