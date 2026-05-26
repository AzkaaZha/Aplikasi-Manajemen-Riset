import { useState } from "react";

function DocumentCard({ title, data }) {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <div className="document-card">
      {/* HEADER */}
      <div
        className="document-card-header d-flex justify-content-between align-items-center"
        onClick={toggleOpen}
      >
        <strong>{title}</strong>

        <i
          className={`bi ${
            open ? "bi-chevron-up" : "bi-chevron-down"
          }`}
        />
      </div>

      {/* BODY */}
      {open && (
        <div className="document-card-body">
          {data.map((item, index) => (
            <div
              key={index}
              className="document-item d-flex justify-content-between align-items-center"
            >
              <span>{item.title}</span>

              <button className="document-btn">
                <i className="bi bi-paperclip"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentCard;