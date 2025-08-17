import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

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
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          // Data will be immediately available in the session
          data: {
            email_confirmed: true
          }
        }
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Since email verification is disabled, we can directly sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (signInError) {
          setError(signInError.message)
        } else {
          // Redirect to the map page or dashboard
          navigate('/map')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
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
  )
}