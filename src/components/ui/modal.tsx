"use client";

import { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

interface ModalProps {
  trigger: ReactNode;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}

export function Modal({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
}: ModalProps) {
  return (
    <Dialog
      {...(open !== undefined && { open })}
      {...(onOpenChange && { onOpenChange })}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
