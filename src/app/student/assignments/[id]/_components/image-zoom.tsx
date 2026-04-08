"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImageZoom({
  src,
  alt = "Question image",
  className,
}: ImageZoomProps) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ cursor: "zoom-in" }}
        />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 outline-none"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            {alt}
          </DialogPrimitive.Title>
          <div
            className="flex h-full w-full cursor-zoom-out items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[90vw] rounded-md object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 focus:outline-none">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
