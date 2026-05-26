
const DocumentStatusBadge = ({ status, type }) => {
  const getBadgeClass = () => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "selesai":
        return "badge-success";
      case "submitted":
      case "proses":
        return "badge-warning";
      case "draft":
        return "badge-secondary";
      default:
        return "badge-primary";
    }
  };

  const getStyle = () => {
    if (type === "outline") {
      return {
        border: "1px solid currentColor",
        background: "transparent",
        color: "var(--dark-blue)",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px"
      };
    }
    return {};
  };

  return (
    <span className={`badge ${getBadgeClass()}`} style={getStyle()}>
      {status}
    </span>
  );
};

export default DocumentStatusBadge;

