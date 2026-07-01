import React from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
  height = 260,
  placeholder = "Write here...",
}) {
  return (
    <div className="rich-text-editor-wrapper">
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        value={value || ""}
        disabled={disabled}
        init={{
          height,
          menubar: false,
          branding: false,
          placeholder,
          plugins: "lists link table code",
          toolbar:
            "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | table link | removeformat code",
          content_style:
            "body { font-family: DM Sans, Arial, sans-serif; font-size: 14px; color: #0f172a; }",
        }}
        onEditorChange={(content) => onChange(content)}
      />
    </div>
  );
}