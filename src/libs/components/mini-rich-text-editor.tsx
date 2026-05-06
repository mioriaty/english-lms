"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Strikethrough } from "lucide-react";
import { Button } from "@/libs/components/ui/button";
import { cn } from "@/libs/utils/string";

interface MiniRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MiniRichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minHeight = "80px",
}: MiniRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Nhập nội dung…" }),
    ],
    immediatelyRender: false,
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none px-3 py-2 focus:outline-none",
        ),
        style: `min-height: ${minHeight}`,
      },
    },
  });

  if (!editor) return null;

  const tools = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      title: "Italic",
    },
    {
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
      title: "Strikethrough",
    },
  ] as const;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input bg-background",
        className,
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-input px-1.5 py-1">
        {tools.map((tool) => (
          <Button
            key={tool.title}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 w-6 p-0",
              tool.active && "bg-muted text-foreground",
            )}
            title={tool.title}
            onClick={tool.action}
          >
            <tool.icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
