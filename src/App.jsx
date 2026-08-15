import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
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

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950">
        <Navbar />

        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<BrowseTeams />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/my-teams" element={<MyTeams />} />
          <Route path="/teams/:id/edit" element={<EditTeam />} />
          <Route path="/my-requests" element={<MyRequests />} />
        </Routes>
      </div>
      <Analytics />
    </BrowserRouter>
  )
}

export default App