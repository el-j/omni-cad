import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Docs } from './pages/Docs';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white">
        <nav className="fixed top-0 left-0 right-0 z-[1000] bg-black/60 backdrop-blur-2xl border-b border-white/5">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l9 4.9V17.1L12 22l-9-4.9V6.9L12 2z" />
                </svg>
              </div>
              OmniCAD
            </Link>
            
            <ul className="hidden md:flex items-center gap-8">
              <li><Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/docs" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><a href="https://github.com/el-j/omni-cad" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">GitHub</a></li>
              <li>
                <a href="#download" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all">
                  Install →
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Docs />} />
          </Routes>
        </main>

        <footer className="py-20 border-t border-white/5 bg-black">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <span className="font-bold text-lg tracking-tight">OmniCAD</span>
              <div className="hidden md:block w-px h-4 bg-white/10" />
              <span className="text-sm text-gray-500 font-medium">MIT License · Built with ❤️ for the CAD community</span>
            </div>
            
            <div className="flex items-center gap-8">
              <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors">Home</Link>
              <Link to="/docs" className="text-sm text-gray-500 hover:text-white transition-colors font-semibold text-blue-400">Docs</Link>
              <a href="https://github.com/el-j/omni-cad" className="text-sm text-gray-500 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
