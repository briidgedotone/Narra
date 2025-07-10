"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Clipboard } from "@/components/ui/icons";

import { CopyBoardModal } from "./copy-board-modal";

interface CopyBoardButtonProps {
  publicId: string;
  boardName: string;
  className?: string;
}

export function CopyBoardButton({
  publicId,
  boardName,
  className,
}: CopyBoardButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <Clipboard className="w-4 h-4 mr-2" />
        Add to My Collection
      </Button>

      <CopyBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        publicId={publicId}
        boardName={boardName}
      />
    </>
  );
}
