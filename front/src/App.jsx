import './App.css';
import Nav from './Nav/Nav';
import Home from './pages/Home';
import OwnerPostView from './pages/OwnerPostView';
import Works from './pages/Works';
import People from './pages/People';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from "./pages/Profile";
import EditPost from "./pages/EditPost";
import PostDetail from "./pages/PostDetail";
import UserProfile from './pages/UserProfile';
import Search from './search/search';
import CreatePost from './pages/CreatePost';
import Chat from './pages/ChatPage';
import { Toaster } from 'react-hot-toast';
import MyApplications from './pages/MyApplications';

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { useAuthContext } from './Context/AuthContext';

// Componente envoltorio (necesario para usar useNavigate)
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">
          Cargando usuario...
        </div>
      </div>
    );
  }
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/newPost" element={<CreatePost user={user} />} />
        <Route path="/works" element={<Works />} />
        <Route path="/people" element={<People />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ownerPostView/:id" element={<OwnerPostView user={user} />} />
        <Route path="/editar/:id" element={<EditPost />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route path="/myApplications" element={<MyApplications />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
