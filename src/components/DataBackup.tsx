"use client";

import { useRef } from "react";
import { applyBackup, buildBackup, isValidBackup } from "@/lib/backup";

export default function DataBackup() {
  const fileRef = useRef<HTMLInputElement>(null);

  function onExport() {
    const backup = buildBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `momentum-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function onImportClick() {
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        window.alert("Could not read that file — it isn't valid JSON.");
        return;
      }
      if (!isValidBackup(parsed)) {
        window.alert("That doesn't look like a Momentum backup file.");
        return;
      }
      const ok = window.confirm(
        "Import this backup? It will replace your current sections, tasks, and history on this device."
      );
      if (!ok) return;
      applyBackup(parsed);
      window.location.reload();
    };
    reader.readAsText(file);
  }

  return (
    <div className="side-data">
      <button className="db-btn" onClick={onExport} title="Download a backup of all your data">
        ⬇ Export
      </button>
      <button className="db-btn" onClick={onImportClick} title="Restore data from a backup file">
        ⬆ Import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={onFile}
        hidden
      />
    </div>
  );
}
