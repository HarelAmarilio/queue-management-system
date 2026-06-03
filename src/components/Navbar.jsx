import logo from "../../images/niniEyebrowes.png";

const navItems = [
  { label: "דף הבית", href: "#home" },
  { label: "קצת עליי", href: "#about-us" },
  { label: "תיק עבודות", href: "#portfolio" },
  { label: "לתיאום תור", href: "https://bit.ly/Nini_WhatsApp", external: true },
  { label: "ליצירת קשר", href: "https://bit.ly/Nini_WhatsApp", external: true }
];

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

          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="logo-container">
          <img src={logo} alt="Nini Eyebrows Design Logo" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
