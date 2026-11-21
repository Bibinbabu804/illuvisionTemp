"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useLocationSearch } from "@/services/api/planner/planner.queries";
import styles from "./LocationSearchSelect.module.css";

/**
 * Accessible, debounced hierarchical Location Search combobox
 * backed by GET /api/v1/public/marketplace/locations/search.
 */
export default function LocationSearchSelect({
  id,
  value = null,
  areaLabel = "",
  onSelect,
  onClear,
  placeholder = "Search a city, district, or state (e.g. Kerala, Kochi)…",
}) {
  const listId = useId();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value?.label || (areaLabel && areaLabel !== "any" ? areaLabel : ""));
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);

  // Sync display text when external value changes (e.g. session restore)
  useEffect(() => {
    const nextText = value?.label || (areaLabel && areaLabel !== "any" ? areaLabel : "");
    setInputValue(nextText);
  }, [value, areaLabel]);

  // Debounce search queries by 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const { data: results = [], isFetching, isError } = useLocationSearch(debouncedQuery, {
    enabled: open,
    limit: 20,
  });

  const handleChoose = (item) => {
    setInputValue(item.label);
    setOpen(false);
    setHighlighted(-1);
    onSelect?.(item);
  };

  const handleClear = () => {
    setInputValue("");
    setDebouncedQuery("");
    setHighlighted(-1);
    onClear?.();
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen(true);
      setHighlighted(0);
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => (results.length ? (prev + 1) % results.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => (results.length ? (prev <= 0 ? results.length - 1 : prev - 1) : -1));
    } else if (e.key === "Enter") {
      if (highlighted >= 0 && results[highlighted]) {
        e.preventDefault();
        e.stopPropagation();
        handleChoose(results[highlighted]);
      } else if (open) {
        // Prevent Enter from advancing wizard while user is actively typing a search query
        e.preventDefault();
        e.stopPropagation();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const hasSelection = Boolean(value?.id || (areaLabel && areaLabel !== "any") || inputValue.trim());

  return (
    <div className={styles.wrap} ref={wrapRef} data-location-combobox={open ? "open" : "closed"}>
      <div className={styles.inputRow}>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          className={`input ${styles.input}`}
          placeholder={placeholder}
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            setHighlighted(0);
            if (!e.target.value.trim()) {
              onClear?.();
            }
          }}
          onKeyDown={onKeyDown}
        />
        {hasSelection && (
          <button
            type="button"
            className={styles.clearBtn}
            aria-label="Clear location"
            onClick={handleClear}
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      {open && (
        <ul id={listId} role="listbox" className={styles.dropdown} data-lenis-prevent>
          {isFetching && results.length === 0 ? (
            <li className={styles.stateRow} role="status">Searching locations…</li>
          ) : isError ? (
            <li className={styles.stateRow} role="alert">Could not load locations. Please try again.</li>
          ) : results.length === 0 ? (
            <li className={styles.stateRow} role="status">
              No matching locations found for &ldquo;{debouncedQuery}&rdquo;.
            </li>
          ) : (
            results.map((item, idx) => {
              const isSelected = value && value.type === item.type && String(value.id) === String(item.id);
              return (
                <li key={`${item.type}-${item.id}`} role="option" aria-selected={Boolean(isSelected)}>
                  <button
                    type="button"
                    className={styles.itemBtn}
                    data-highlighted={highlighted === idx ? "true" : undefined}
                    data-selected={isSelected ? "true" : undefined}
                    onMouseEnter={() => setHighlighted(idx)}
                    onClick={() => handleChoose(item)}
                  >
                    <span className={styles.itemMain}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemSub}>{item.subtitle}</span>
                    </span>
                    <span className={styles.badge}>{item.type}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
