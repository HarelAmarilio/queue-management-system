import eyebrow1 from "../../images/eyebrow1.png";
import eyebrow2 from "../../images/eyebrow2.png";
import eyebrow3 from "../../images/eyebrow3.png";
import eyebrow4 from "../../images/eyebrow4.png";

const portfolioImages = [
  { src: eyebrow1, alt: "תיק עבודות גבות 1" },
  { src: eyebrow2, alt: "תיק עבודות גבות 2" },
  { src: eyebrow3, alt: "תיק עבודות גבות 3" },
  { src: eyebrow4, alt: "תיק עבודות גבות 4" },
];

function Portfolio() {
  return (
    <section id="portfolio" className="portfolio-section">
      <h2>תיק עבודות</h2>
      <div className="portfolio-gallery">
        {portfolioImages.map((image) => (
          <img key={image.alt} src={image.src} alt={image.alt} />
        ))}
      </div>
    </section>
  );
}

export default Portfolio;
