import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import BrowseTeams from './pages/BrowseTeams'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import CreateTeam from './pages/CreateTeam'
import TeamDetails from './pages/TeamDetails'

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
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App