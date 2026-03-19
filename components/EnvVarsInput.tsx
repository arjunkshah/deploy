"use client";

import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";

export interface EnvVarRow {
  id: string;
  key: string;
  value: string;
}

interface EnvVarsInputProps {
  rows: EnvVarRow[];
  onChange: (rows: EnvVarRow[]) => void;
}

export function EnvVarsInput({ rows, onChange }: EnvVarsInputProps) {
  const addRow = () => {
    onChange([...rows, { id: crypto.randomUUID(), key: "", value: "" }]);
  };

  const updateRow = (id: string, field: "key" | "value", value: string) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Environment</p>
          <h2 className="mt-2 text-sm font-semibold text-foreground">Variables</h2>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <PlusIcon />
          Add variable
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {rows.map((row) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid items-center gap-3 md:grid-cols-[1fr_auto_1.4fr_auto]"
            >
              <input
                placeholder="KEY"
                value={row.key}
                onChange={(e) => updateRow(row.id, "key", e.target.value)}
                className="rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-foreground/50"
              />
              <span className="font-mono text-muted-foreground/50">=</span>
              <input
                placeholder="VALUE"
                value={row.value}
                onChange={(e) => updateRow(row.id, "value", e.target.value)}
                className="rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-foreground/50"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-rose-600"
                aria-label="Remove env var"
              >
                <TrashIcon />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {rows.length === 0 && (
          <div className="py-4 text-sm italic text-muted-foreground">No environment variables required.</div>
        )}
      </div>
    </div>
  );
}
