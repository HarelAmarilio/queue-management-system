import logo from "../../images/niniEyebrowes.png";

function Navbar() {
  return (
    <nav>
      <div className="nav-content">
        <ul>
          <li>
            <div className="social-link">
              <a
                href="https://www.instagram.com/nini_eyebrows/"
                target="_blank"
                rel="noreferrer"
                title="Instagram"
              >
                <i className="fab fa-instagram" />
              </a>
            </div>
          </li>
          <li>
            <a href="https://bit.ly/Nini_WhatsApp" target="_blank" rel="noreferrer">
              ליצירת קשר
            </a>
          </li>
          <li>
            <a href="#portfolio">תיק עבודות</a>
          </li>
          <li>
            <a href="services.html">לתיאום תור</a>
          </li>
          <li>
            <a href="#about-us">קצת עליי</a>
          </li>
          <li>
            <a href="HomePage.html">דף הבית</a>
          </li>
        </ul>

        <div className="logo-container">
          <img src={logo} alt="Nini Eyebrows Design Logo" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
