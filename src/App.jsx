import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './Components/Signup'
import Login from './Components/Login'
import MapView from './Components/MapView'
import ProtectedRoute from './Routes/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App