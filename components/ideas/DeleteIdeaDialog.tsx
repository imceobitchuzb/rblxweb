"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { IdeaItem } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DeleteIdeaDialogProps {
  idea: IdeaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (idea: IdeaItem) => void;
}

export function DeleteIdeaDialog({
  idea,
  isOpen,
  onClose,
  onConfirm,
}: DeleteIdeaDialogProps) {
  if (!idea) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Delete this idea?</span>
        </div>
      }
      description="This action cannot be undone and will remove the concept from your workspace."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-slate-300">
          <p className="font-semibold text-white mb-1">{idea.title}</p>
          <p className="text-slate-400 line-clamp-2">{idea.description}</p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="crimson"
            size="sm"
            onClick={() => {
              onConfirm(idea);
              onClose();
            }}
          >
            Delete Idea
          </Button>
        </div>
      </div>
    </Modal>
  );
}
