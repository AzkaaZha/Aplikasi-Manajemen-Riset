
const AiSuggestionBox = ({ onSelectSuggestion }) => {
  const suggestions = [
    "Buatkan draf abstrak",
    "Perbaiki tata bahasa tulisan ini",
    "Ringkas isi dokumen ini"
  ];

  return (
    <div className="ai-suggestions">
      {suggestions.map((text, index) => (
        <button
          key={index}
          className="suggestion-btn"
          onClick={() => onSelectSuggestion(text)}
        >
          {text}
        </button>
      ))}
    </div>
  );
};

export default AiSuggestionBox;

