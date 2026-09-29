"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Character, Script } from "@/lib/types";
import { getScriptsUsingCharacter } from "@/lib/roster-script-utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DeleteCharacterDialogProps {
  character: Character | null;
  scripts: Script[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (character: Character) => void;
}

export function DeleteCharacterDialog({
  character,
  scripts,
  isOpen,
  onClose,
  onConfirm,
}: DeleteCharacterDialogProps) {
  if (!character) return null;

  const usedInScripts = getScriptsUsingCharacter(character.id, scripts);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Delete character &ldquo;{character.name}&rdquo;?</span>
        </div>
      }
      description="This will permanently delete this character profile from your Roblox roster."
      maxWidth="md"
    >
      <div className="space-y-4">
        {usedInScripts.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <span className="font-bold block mb-1">
              ⚠️ Warning: Active Script Usage
            </span>
            This character is currently featured in {usedInScripts.length} script(s):{" "}
            {usedInScripts.map((s) => s.title).join(", ")}.
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-slate-300">
          <p className="font-semibold text-white mb-1">{character.name}</p>
          <p className="text-slate-400 line-clamp-2">{character.description}</p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="crimson"
            size="sm"
            onClick={() => {
              onConfirm(character);
              onClose();
            }}
          >
            Delete Character
          </Button>
        </div>
      </div>
    </Modal>
  );
}
