import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MainLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="d-flex min-vh-100">
      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar setIsOpen={setIsOpen} />

        <div className="p-3 p-md-4 flex-grow-1">
          {children}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;