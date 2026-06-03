import eyebrow1 from "../../images/eyebrow1.png";
import eyebrow2 from "../../images/eyebrow2.png";
import eyebrow3 from "../../images/eyebrow3.png";
import eyebrow4 from "../../images/eyebrow4.png";

const portfolioImages = [eyebrow1, eyebrow2, eyebrow3, eyebrow4];

function PortfolioSection() {
  return (
    <section id="portfolio" className="portfolio-section">
      <h2>תיק עבודות</h2>
      <div className="portfolio-gallery">
        {portfolioImages.map((imageSrc, index) => (
          <img key={imageSrc} src={imageSrc} alt={`תיק עבודות גבות ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}

export default PortfolioSection;
