"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Pal } from "../lib/breeding";
import { paldeckCode } from "../lib/labels";
import { ElementIcon, elementColor } from "./ElementIcon";
import { useI18n } from "./I18nProvider";
import PalAvatar from "./PalAvatar";

interface PalSelectProps {
  id: string;
  label: string;
  options: Pal[];
  value: Pal | null;
  onChange: (pal: Pal) => void;
  placeholder?: string;
  /** Hide the label visually (it stays for screen readers) */
  hideLabel?: boolean;
}

/** Searchable dropdown: type to filter, arrow keys to move, Enter to pick, Escape to close. */
export default function PalSelect({ id, label, options, value, onChange, placeholder, hideLabel = false }: PalSelectProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((p) => p.name.toLowerCase().includes(q)) : options;
  }, [options, query]);

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView?.({ block: "nearest" });
  }, [active, open]);

  function choose(pal: Pal | undefined) {
    if (!pal) return;
    onChange(pal);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => Math.min(Math.max(i + step, 0), filtered.length - 1));
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      choose(filtered[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  const listId = `${id}-list`;
  const showSelected = value && !open;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={hideLabel ? "sr-only" : "text-sm font-semibold text-muted"}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center">
          {showSelected ? (
            <PalAvatar pal={value} size="sm" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1.5 text-muted" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[active] ? `${id}-${filtered[active].id}` : undefined}
          autoComplete="off"
          placeholder={placeholder ?? t.select.search}
          className={`h-12 w-full rounded-xl border border-line bg-surface-2 pr-9 text-base outline-none transition placeholder:text-muted hover:border-line-strong focus:border-accent focus:ring-4 focus:ring-accent/15 ${
            showSelected ? "pl-12 font-semibold" : "pl-10"
          }`}
          value={open ? query : (value?.name ?? "")}
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onClick={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="animate-pop absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-2xl"
          >
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-muted">{t.select.noPal}</li>}
            {filtered.map((pal, i) => (
              <li
                key={pal.id}
                id={`${id}-${pal.id}`}
                role="option"
                aria-selected={i === active}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 ${
                  i === active ? "bg-accent-soft" : ""
                }`}
                // mousedown instead of click so the input's blur doesn't close the list first
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(pal);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <PalAvatar pal={pal} size="sm" />
                  <span className="truncate font-medium">{pal.name}</span>
                  <span className="font-mono text-xs text-muted">{paldeckCode(pal)}</span>
                </span>
                <span className="flex shrink-0 gap-1">
                  {pal.elements.map((el) => (
                    <span key={el} style={{ color: elementColor(el) }}>
                      <ElementIcon element={el} className="h-4 w-4" />
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
