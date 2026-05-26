function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {}
        <div className="footer-left">
          <span>&copy; {new Date().getFullYear()} <strong>STT Terpadu Nurul Fikri</strong>. Hak Cipta Dilindungi.</span>
        </div>

        {}
        <div className="footer-right">
          <div className="footer-social-links">
            <a href="https://www.instagram.com/stttepadunurulfikri/" target="_blank" rel="noopener noreferrer" title="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="https://www.youtube.com/@STTnurulfikri" target="_blank" rel="noopener noreferrer" title="YouTube">
              <i className="bi bi-youtube"></i>
            </a>
            <a href="https://www.linkedin.com/school/stt-terpadu-nurul-fikri/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <i className="bi bi-linkedin"></i>
            </a>
            <a href="https://nurulfikri.ac.id" target="_blank" rel="noopener noreferrer" title="Website Resmi STT NF">
              <i className="bi bi-globe"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;