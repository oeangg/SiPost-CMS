"use client";

import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContentRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ContentRichTextEditor({
  value,
  onChange,
  className,
}: ContentRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-56 px-3 py-3 text-sm leading-7 outline-none prose-content",
      },
    },
    immediatelyRender: false,
    onUpdate({ editor }) {
      const html = editor.getHTML();

      onChange(html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentValue = editor.getHTML() === "<p></p>" ? "" : editor.getHTML();

    if (value !== currentValue) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const toolbarItems = [
    {
      label: "Paragraph",
      icon: Pilcrow,
      active: editor?.isActive("paragraph") ?? false,
      onClick: () => editor?.chain().focus().setParagraph().run(),
    },
    {
      label: "Heading",
      icon: Heading2,
      active: editor?.isActive("heading", { level: 2 }) ?? false,
      onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Bold",
      icon: Bold,
      active: editor?.isActive("bold") ?? false,
      onClick: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: editor?.isActive("italic") ?? false,
      onClick: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      label: "Bullet List",
      icon: List,
      active: editor?.isActive("bulletList") ?? false,
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Ordered List",
      icon: ListOrdered,
      active: editor?.isActive("orderedList") ?? false,
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: Quote,
      active: editor?.isActive("blockquote") ?? false,
      onClick: () => editor?.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border-2 border-input bg-card shadow-xs focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <div className="flex flex-wrap gap-1 border-b-2 border-border bg-muted p-2">
        {toolbarItems.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.label}
              type="button"
              variant={item.active ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={item.onClick}
              disabled={!editor}
              aria-label={item.label}
              title={item.label}
            >
              <Icon aria-hidden="true" />
            </Button>
          );
        })}

        <div className="mx-1 h-8 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          aria-label="Undo"
          title="Undo"
        >
          <Undo2 aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          aria-label="Redo"
          title="Redo"
        >
          <Redo2 aria-hidden="true" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
