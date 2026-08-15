import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import BrowseTeams from './pages/BrowseTeams'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import CreateTeam from './pages/CreateTeam'
import TeamDetails from './pages/TeamDetails'
import Applications from './pages/Applications'
import MyTeams from './pages/MyTeams'
import EditTeam from './pages/EditTeam'
import MyRequests from './pages/MyRequests'
import Messages from './pages/Messages'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950">
        <Navbar />

        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <BrowseTeams />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/create-team" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
          <Route path="/teams/:id" element={<ProtectedRoute><TeamDetails /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
          <Route path="/my-teams" element={<ProtectedRoute><MyTeams /></ProtectedRoute>} />
          <Route path="/teams/:id/edit" element={<ProtectedRoute><EditTeam /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:teamId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        </Routes>
      </div>
      <Analytics />
    </BrowserRouter>
  )
}

export default App
