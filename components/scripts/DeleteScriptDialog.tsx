"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Script } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DeleteScriptDialogProps {
  script: Script | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (script: Script) => void;
}

export function DeleteScriptDialog({
  script,
  isOpen,
  onClose,
  onConfirm,
}: DeleteScriptDialogProps) {
  if (!script) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Delete Script &ldquo;{script.title}&rdquo;?</span>
        </div>
      }
      description="This will permanently delete this script and all associated scenes and dialogue lines."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-slate-300">
          <p className="font-semibold text-white mb-1">{script.title}</p>
          <p className="text-slate-400 line-clamp-2">
            {script.scenes.length} scene(s) • {script.status}
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
              onConfirm(script);
              onClose();
            }}
          >
            Delete Script
          </Button>
        </div>
      </div>
    </Modal>
  );
}
