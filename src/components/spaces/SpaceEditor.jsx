import { useState, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Link as LinkIcon, Code, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SpaceEditor({ initialContent = "", onChange }) {
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef(null);

  const handleContentChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      onChange?.(html);
    }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const toolbarButtons = [
    { icon: Bold, command: "bold", label: "Bold" },
    { icon: Italic, command: "italic", label: "Italic" },
    { icon: Heading1, command: "formatBlock", value: "<h2>", label: "Heading 1" },
    { icon: Heading2, command: "formatBlock", value: "<h3>", label: "Heading 2" },
    { icon: List, command: "insertUnorderedList", label: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", label: "Numbered List" },
    { icon: Quote, command: "formatBlock", value: "<blockquote>", label: "Quote" },
    { icon: Code, command: "formatBlock", value: "<pre>", label: "Code Block" },
  ];

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((btn, index) => {
          const Icon = btn.icon;
          return (
            <button
              key={index}
              onClick={() => executeCommand(btn.command, btn.value)}
              className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              title={btn.label}
              type="button"
            >
              <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </button>
          );
        })}
        <button
          onClick={insertLink}
          className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
          title="Insert Link"
          type="button"
        >
          <LinkIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: content }}
        className={cn(
          "min-h-[400px] p-6 focus:outline-none",
          "prose prose-zinc dark:prose-invert max-w-none",
          "prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl",
          "prose-p:text-zinc-700 dark:prose-p:text-zinc-300",
          "prose-a:text-purple-600 dark:prose-a:text-purple-400",
          "prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded",
          "prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800 prose-pre:p-4",
          "prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4"
        )}
      />
    </div>
  );
}
