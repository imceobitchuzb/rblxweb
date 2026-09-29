"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Video } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DeleteVideoDialogProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (video: Video) => void;
}

export function DeleteVideoDialog({
  video,
  isOpen,
  onClose,
  onConfirm,
}: DeleteVideoDialogProps) {
  if (!video) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span>Delete Video Asset?</span>
        </div>
      }
      description="This action cannot be undone. Any linked calendar schedules for this video will be detached."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-slate-300">
          <p className="font-semibold text-white mb-1">{video.title}</p>
          <p className="text-slate-400 line-clamp-2">
            {video.description || "No description"}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="crimson"
            size="sm"
            onClick={() => {
              onConfirm(video);
              onClose();
            }}
          >
            Delete Video
          </Button>
        </div>
      </div>
    </Modal>
  );
}
