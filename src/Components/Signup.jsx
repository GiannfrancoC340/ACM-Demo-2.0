import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      navigate('/map')
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
    <div className="auth-container">
      <h2>Sign Up</h2>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email" 
            placeholder="Your email" 
            value={email}
            onChange={e => setEmail(e.target.value)} 
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            placeholder="Choose a secure password" 
            value={password}
            onChange={e => setPassword(e.target.value)} 
            required
          />
        </div>
        
        <button 
          className="btn-primary" 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="auth-footer">
        Already have an account? <a href="/login">Log In</a>
      </div>
    </div>
    </div>
  )
}