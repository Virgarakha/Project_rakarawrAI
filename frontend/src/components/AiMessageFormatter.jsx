import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyIcon, CheckIcon } from "lucide-react";
import copy from "copy-to-clipboard";

export default function AIMessageFormatter({ message, isUser = false, messageIndex }) {
  const [isCopiedStates, setIsCopiedStates] = useState({});
  const [formattedMessage, setFormattedMessage] = useState("");
  const codeBlockRefs = useRef({}); // Use object to store refs by unique key

  // Pre-process message untuk memperbaiki formatting dan hapus "Assistant:" untuk AI
  const formatMessage = useCallback((text) => {
    if (!text || typeof text !== "string") return "";

    let processedText = text;

    // Hapus "Assistant:" untuk pesan AI
    if (!isUser) {
      processedText = processedText.replace(/^Assistant:\s*/i, "");
    }

    return processedText
      // Normalisasi line breaks
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Perbaiki bold formatting
      .replace(/\*\*([^*]+)\*\*/g, "**$1**")
      // Perbaiki italic formatting
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "*$1*")
      // Format section headers dengan proper spacing
      .replace(
        /\*\*(Cara Membuat|Penjelasan|Tips Tambahan|Cara Menggunakan|Struktur|Elemen):\*\*/gi,
        "\n\n## $1\n"
      )
      // Perbaiki numbered lists
      .replace(/(\n|^)(\d+)\.([^\s])/g, "$1$2. $3")
      // Perbaiki bullet points
      .replace(/(\n|^)[•-]([^\s])/g, "$1• $2")
      // Tambahkan spacing sebelum lists
      .replace(/([^\n])\n([•-\d])/g, "$1\n\n$2")
      // Perbaiki spasi setelah tanda baca
      .replace(/([.,;!?])([a-zA-Z])/g, "$1 $2")
      // Format inline code
      .replace(/([^`])`([^`\n]+)`([^`])/g, "$1`$2`$3")
      // Clean up multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace
      .trim();
  }, [isUser]);

  useEffect(() => {
    setFormattedMessage(formatMessage(message));
  }, [message, formatMessage]);

  const handleCopy = useCallback((index) => {
    const codeBlockRef = codeBlockRefs.current[index];
    if (codeBlockRef) {
      const codeText = codeBlockRef.innerText;
      copy(codeText);
      setIsCopiedStates((prev) => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setIsCopiedStates((prev) => ({ ...prev, [index]: false }));
      }, 2000);
    }
  }, []);

  // Jika pesan dari user, tampilkan tanpa Markdown
  if (isUser) {
    return (
      <div className="whitespace-pre-wrap text-white leading-relaxed">
        {message || ""}
      </div>
    );
  }

  return (
    <div className="prose prose-gray max-w-none text-white">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : null;
            const codeContent = String(children).replace(/\n$/, "");
            const codeBlockIndex = `${messageIndex}-${children.toString().slice(0, 10)}`; // Unique key

            return !inline && lang ? (
              <div
                key={`codeblock-${codeBlockIndex}`}
                className="relative my-4 rounded-lg overflow-hidden border border-[#39393a]"
              >
                <div className="bg-[#282c34] text-gray-200 px-4 py-2 text-xs font-medium flex items-center justify-between">
                  <span>📄 {lang?.toUpperCase() || "CODE"}</span>
                  <button
                    onClick={() => handleCopy(codeBlockIndex)}
                    className="hover:bg-gray-700 text-gray-300 rounded px-2 py-1 focus:outline-none focus:shadow-outline"
                    aria-label="Copy code"
                    title={isCopiedStates[codeBlockIndex] ? "Copied!" : "Copy code"}
                  >
                    {isCopiedStates[codeBlockIndex] ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={lang || "text"}
                  PreTag="div"
                  className="!mt-0 !rounded-none text-sm"
                  showLineNumbers={false}
                  customStyle={{ margin: 0, padding: "1rem" }}
                  ref={(el) => (codeBlockRefs.current[codeBlockIndex] = el)}
                  {...props}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-[#424242] text-white px-2 py-1 rounded-lg text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <p className="mb-4 last:mb-0 leading-7 text-white">{children}</p>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-white pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0 px-3 py-2 rounded-lg text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2 mt-4 first:mt-0 text-white">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-none mb-4 space-y-2 pl-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-none mb-4 space-y-2 pl-0 counter-reset-custom">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const parent = props.node?.parent;
            const isOrdered = parent?.tagName === "ol";
            return (
              <li
                className={`leading-7 text-white pl-6 relative ${
                  isOrdered ? "counter-increment-custom" : ""
                }`}
              >
                <span
                  className={`absolute left-0 top-0 font-semibold ${
                    isOrdered ? "text-white text-2xl counter-custom" : "text-white text-2xl"
                  }`}
                >
                  {isOrdered ? "" : "•"}
                </span>
                {children}
              </li>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 pl-6 py-3 mb-4 bg-gradient-to-r from-blue-50/10 to-transparent italic text-white rounded-r-lg">
              💡 {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-white px-1 py-0.5 rounded-sm">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-blue-400 font-medium">{children}</em>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 underline font-medium px-1 py-0.5 rounded transition-colors"
            >
              🔗 {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full bg-[#2b2b2b]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left font-bold text-white border-b-2 border-gray-600">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 text-white border-b border-gray-600 leading-6">
              {children}
            </td>
          ),
          hr: () => <hr className="my-6 border-gray-600 border-2" />,
        }}
      >
        {formattedMessage}
      </ReactMarkdown>
    </div>
  );
}