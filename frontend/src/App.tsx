import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Translate from './pages/Translate'
import Train from './pages/Train'
import Docs from './pages/Docs'
import Languages from './pages/Languages'


function App() {

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <div className="text-center py-20">
                <h1 className="text-4xl font-extrabold mb-4">Welcome to NaijaLang</h1>
                <p className="text-lg text-gray-700 mb-6">
                  A community‑driven translation engine for Nigerian languages.
                </p>
                <a
                  href="/translate"
                  className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-full shadow hover:bg-gray-100"
                >
                  Get Started
                </a>
              </div>
            }
          />
          <Route path="/translate" element={<Translate />} />
          <Route path="/languages" element={<Languages />} />
          <Route path="/train" element={<Train />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
