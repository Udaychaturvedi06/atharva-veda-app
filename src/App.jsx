import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Library from './pages/Library';
import Campaign from './pages/Campaign';
import Chat from './pages/Chat';
import Rankings from './pages/Rankings';
import VerseDetail from './pages/VerseDetail';
import Quizzes from './pages/Quizzes';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import About from './pages/About';
import Founders from './pages/Founders';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './contexts/AuthContext';

import { useGameStore } from './store/useGameStore';

function App() {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');
  
  // Connect to global Zustand store
  const rp = useGameStore(state => state.rp);
  const hp = useGameStore(state => state.hp);
  const vedaBg = useGameStore(state => state.vedaBg);
  const getRank = useGameStore(state => state.getRank);
  const addRp = useGameStore(state => state.addRp);
  const takeDamage = useGameStore(state => state.takeDamage);
  const heal = useGameStore(state => state.heal);
  const setVedaBg = useGameStore(state => state.setVedaBg);
  
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.02 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  return (
    <>
      {/* Global AAA Lobby Background with Parallax/Scanlines Overlay */}
      <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundImage: `url(${vedaBg})`, backgroundSize: 'cover', backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out', zIndex: -2
      }} />
      <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'linear-gradient(to bottom, rgba(10,10,18,0.7) 0%, rgba(10,10,18,0.95) 100%)',
          zIndex: -1
      }} />

      <div className="app-container">
        <Routes location={location} key={location.pathname === '/' || location.pathname === '/login' ? location.pathname : 'app'}>
          <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" replace />} />
          <Route path="/login" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/founders" element={<Founders />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Legal />} />
          
          <Route path="/*" element={
            user ? (
              <Layout theme={theme} toggleTheme={toggleTheme} rp={rp} rank={getRank()} hp={hp}>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/dashboard" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Home addRp={addRp} rp={rp} setVedaBg={setVedaBg} hp={hp} takeDamage={takeDamage} heal={heal} /></motion.div>} />
                    <Route path="/library" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Library /></motion.div>} />
                    <Route path="/campaign" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Campaign addRp={addRp} /></motion.div>} />
                    <Route path="/chat" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Chat /></motion.div>} />
                    <Route path="/rankings" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Rankings playerRp={rp} /></motion.div>} />
                    <Route path="/verse/:book/:hymn/:verse" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><VerseDetail /></motion.div>} />
                    <Route path="/quiz" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Quizzes /></motion.div>} />
                    <Route path="/settings" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Settings /></motion.div>} />
                    <Route path="/admin" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><AdminDashboard /></motion.div>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AnimatePresence>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </div>
    </>
  );
}

export default App;
