import { useEffect, useMemo, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "../../styles/QuillEditor.css";

const defaultModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link", "image"],
    [{ align: [] }],
    ["clean"],
  ],
};

const mergeModules = (modules) => {
  if (!modules) return defaultModules;
  return { ...defaultModules, ...modules };
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "link",
  "image",
  "align",
  "clean",
];

const QuillEditor = ({ value, onChange, modules, theme = "snow", placeholder = "", onFocus }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdating = useRef(false);

  const editorModules = useMemo(() => mergeModules(modules), [modules]);

  useEffect(() => {
    if (containerRef.current && !quillRef.current) {
      const quill = new Quill(containerRef.current, {
        theme,
        modules: editorModules,
        formats,
        placeholder,
      });

      quillRef.current = quill;

      quill.on("text-change", () => {
        if (!isUpdating.current) {
          const html = containerRef.current.firstChild.innerHTML;
          onChange(html);
        }
      });

      quill.on("selection-change", (range) => {
        if (range && range.length === 0) {
          
          if (onFocus) onFocus();
        }
      });
    }
  }, [theme, editorModules, placeholder, onChange, onFocus]);

  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentHtml = containerRef.current.firstChild.innerHTML;
      if (value !== currentHtml) {
        isUpdating.current = true;
        quillRef.current.root.innerHTML = value || "";
        isUpdating.current = false;
      }
    }
  }, [value]);

  return (
    <div className="quill-editor-wrapper">
      <div ref={containerRef} />
    </div>
  );
};

export default QuillEditor;
