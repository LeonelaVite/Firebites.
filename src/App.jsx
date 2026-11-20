import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import FeaturedProducts from './components/FeaturedProducts.jsx'
import BrandStory from './components/BrandStory.jsx'
import ContactSection from './components/ContactSection.jsx'
import AssistantChat from './components/AssistantChat.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import Footer from './components/Footer.jsx'
import './App.css'
import './FunctionalSections.css'

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <BrandStory />
        <ContactSection />
        <AssistantChat />
        <AdminPanel />
      </main>
      <Footer />
    </>
  )
}

export default App
