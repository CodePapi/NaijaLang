import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Translate from './pages/Translate'
import Train from './pages/Train'
import Docs from './pages/Docs'


function App() {

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<div className="text-center text-xl">Welcome to NaijaLang</div>} />
          <Route path="/translate" element={<Translate />} />
          <Route path="/train" element={<Train />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
