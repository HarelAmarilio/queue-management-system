import backgroundImage from "../images/salon-background.jpg";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import PortfolioSection from "./components/PortfolioSection";

function App() {
  return (
    <div className="app" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <PortfolioSection />
    </div>
  );
}

export default App;
