import "../../styles/research/DeleteResearchModal.css";

function DeleteResearchModal({
  show,
  research,
  onConfirm,
  onCancel,
  isDeleting,
  errorMessage,
}) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="delete-modal-content">
        <div className="delete-modal-header">
          <h5>Hapus Penelitian</h5>
          <button
            type="button"
            className="delete-modal-close"
            onClick={onCancel}
            disabled={isDeleting}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="delete-modal-body">
          <p>Yakin ingin menghapus penelitian ini?</p>
          <strong>{research?.nama}</strong>

          {errorMessage && (
            <div className="delete-error-msg">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {errorMessage}
            </div>
          )}
        </div>

        <div className="delete-modal-footer">
          <button
            type="button"
            className="btn-delete-cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Batal
          </button>

          <button
            type="button"
            className="btn-delete-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteResearchModal;