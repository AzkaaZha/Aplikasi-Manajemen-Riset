function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">

        {/* LEFT - SOCIAL */}
        <div className="footer-social">
          <div className="footer-icons">
            <i className="bi bi-twitter-x"></i>
            <i className="bi bi-instagram"></i>
            <i className="bi bi-youtube"></i>
            <i className="bi bi-linkedin"></i>
          </div>
        </div>

        {/* CENTER - TITLE */}
        <div className="footer-center">
          <strong>STT Terpadu Nurul Fikri</strong>
        </div>

        {/* RIGHT - ADDRESS */}
        <div className="footer-info">
          <div>
            <strong>Kampus A:</strong><br />
            Jl. Situ Indah No.166 Cimanggis, Depok
          </div>

          <div className="mt-2">
            <strong>Kampus B:</strong><br />
            Jl. Raya Lenteng Agung No.20 Jagakarsa, Jakarta Selatan
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;