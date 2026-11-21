"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useLocationSearch, useNearbyLocations } from "@/services/api/planner/planner.queries";
import styles from "./LocationSearchSelect.module.css";

const GEO_DENIED_KEY = "illuvision:geo:denied";

/**
 * Accessible, debounced Multi-Location City Selector with:
 * - City-only search (state queries return cities in that state, never a state row)
 * - Smart alias resolution (e.g. Cochin -> Kochi)
 * - Real geographical Nearby Cities (selected-city proximity -> browser geo -> IP fallback)
 * - Multi-city pills with duplicate prevention and Clear All
 */
export default function LocationSearchSelect({
  id,
  selectedLocations = [],
  onAdd,
  onRemove,
  onClearAll,
  maxSelections = 10,
  placeholder = "Search cities or states (e.g. Kochi, Cochin, Kerala)…",
}) {
  const listId = useId();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);

  // Browser geolocation state (requested at most once responsibly)
  const [browserCoords, setBrowserCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | requesting | granted | denied
  const geoRequestedRef = useRef(false);

  const selectedIds = useMemo(
    () => selectedLocations.map((loc) => Number(loc.city_id ?? loc.id)).filter((n) => n > 0),
    [selectedLocations]
  );
  const selectedIdSet = useMemo(() => new Set(selectedIds.map(String)), [selectedIds]);
  const lastSelectedCityId = selectedIds.length > 0 ? selectedIds[selectedIds.length - 1] : null;
  const atLimit = selectedLocations.length >= maxSelections;

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

  const requestBrowserLocation = useCallback((explicit = false) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("denied");
      return;
    }
    if (!explicit) {
      if (geoRequestedRef.current) return;
      try {
        if (sessionStorage.getItem(GEO_DENIED_KEY) === "1") {
          setGeoStatus("denied");
          return;
        }
      } catch {
        /* ignore storage errors */
      }
    }

    geoRequestedRef.current = true;
    setGeoStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBrowserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoStatus("granted");
      },
      () => {
        setGeoStatus("denied");
        try {
          sessionStorage.setItem(GEO_DENIED_KEY, "1");
        } catch {
          /* ignore */
        }
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 10 * 60 * 1000 }
    );
  }, []);

  // When dropdown opens with no selected city yet, check browser permission silently
  // (only auto-request if permission is already granted or prompt hasn't been denied)
  useEffect(() => {
    if (!open || lastSelectedCityId || browserCoords || geoRequestedRef.current) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((perm) => {
          if (perm.state === "granted") {
            requestBrowserLocation(false);
          } else if (perm.state === "denied") {
            geoRequestedRef.current = true;
            setGeoStatus("denied");
          }
        })
        .catch(() => {
          /* Permissions API unavailable; user can click "Use my location" or rely on IP fallback */
        });
    }
  }, [open, lastSelectedCityId, browserCoords, requestBrowserLocation]);

  const isSearching = debouncedQuery.length > 0;

  // 1. Search results (when typing, or as popular-cities fallback when nearby is empty)
  const {
    data: searchResults = [],
    isFetching: searchFetching,
    isError: searchError,
  } = useLocationSearch(debouncedQuery, {
    enabled: open,
    limit: 20,
  });

  // 2. Nearby cities (when dropdown is open and search input is empty)
  const {
    data: nearbyData,
    isFetching: nearbyFetching,
  } = useNearbyLocations({
    cityId: lastSelectedCityId,
    lat: lastSelectedCityId ? null : browserCoords?.lat ?? null,
    lng: lastSelectedCityId ? null : browserCoords?.lng ?? null,
    excludeIds: selectedIds,
    limit: 8,
    enabled: open && !isSearching,
  });

  const nearbyItems = nearbyData?.items || [];
  const nearbyMeta = nearbyData?.meta || { source: "unavailable", reference_city: null };

  // Build visible option list
  const { visibleItems, sectionTitle, isLoadingList } = useMemo(() => {
    if (isSearching) {
      return {
        visibleItems: searchResults,
        sectionTitle: "Matching cities",
        isLoadingList: searchFetching && searchResults.length === 0,
      };
    }

    if (nearbyItems.length > 0) {
      const title =
        nearbyMeta.source === "selected_city" && nearbyMeta.reference_city
          ? `Nearby ${nearbyMeta.reference_city}`
          : "Nearby cities";
      return {
        visibleItems: nearbyItems,
        sectionTitle: title,
        isLoadingList: false,
      };
    }

    // Fallback when neither selected city nor geolocation/IP returned nearby cities
    const unselectedPopular = searchResults.filter((c) => !selectedIdSet.has(String(c.city_id ?? c.id)));
    return {
      visibleItems: unselectedPopular,
      sectionTitle: "Popular cities",
      isLoadingList: (nearbyFetching || searchFetching) && unselectedPopular.length === 0,
    };
  }, [isSearching, searchResults, searchFetching, nearbyItems, nearbyMeta, nearbyFetching, selectedIdSet]);

  const handleToggleItem = (item) => {
    const canonicalId = String(item.city_id ?? item.id);
    if (selectedIdSet.has(canonicalId)) {
      onRemove?.(canonicalId);
      return;
    }
    if (atLimit) return;

    onAdd?.({
      id: item.city_id ?? item.id,
      city_id: item.city_id ?? item.id,
      type: "city",
      name: item.name,
      label: item.label || item.name,
      state_id: item.state_id ?? null,
      state_name: item.state_name ?? null,
      country_id: item.country_id ?? null,
      country_name: item.country_name ?? null,
      parent_label: item.parent_label ?? item.subtitle ?? null,
      subtitle: item.subtitle ?? item.parent_label ?? null,
    });

    // Clear typed query & keep dropdown open so the user can add more cities effortlessly
    setInputValue("");
    setDebouncedQuery("");
    setHighlighted(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Backspace" && !inputValue && selectedLocations.length > 0) {
      const last = selectedLocations[selectedLocations.length - 1];
      onRemove?.(String(last.city_id ?? last.id));
      return;
    }

    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen(true);
      setHighlighted(0);
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => (visibleItems.length ? (prev + 1) % visibleItems.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) =>
        visibleItems.length ? (prev <= 0 ? visibleItems.length - 1 : prev - 1) : -1
      );
    } else if (e.key === "Enter") {
      if (highlighted >= 0 && visibleItems[highlighted]) {
        e.preventDefault();
        e.stopPropagation();
        handleToggleItem(visibleItems[highlighted]);
      } else if (open) {
        e.preventDefault();
        e.stopPropagation();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const showUseMyLocation =
    !isSearching &&
    !lastSelectedCityId &&
    !browserCoords &&
    geoStatus !== "denied" &&
    geoStatus !== "requesting";

  return (
    <div className={styles.wrap} ref={wrapRef} data-location-combobox={open ? "open" : "closed"}>
      {selectedLocations.length > 0 && (
        <div className={styles.selectedBar} aria-label="Selected cities">
          {selectedLocations.map((loc) => {
            const key = String(loc.city_id ?? loc.id);
            return (
              <span key={key} className={styles.pill}>
                <span>{loc.name || loc.label}</span>
                <button
                  type="button"
                  className={styles.pillRemove}
                  aria-label={`Remove ${loc.name || loc.label}`}
                  onClick={() => onRemove?.(key)}
                >
                  <Icon name="close" size={11} />
                </button>
              </span>
            );
          })}
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={() => {
              onClearAll?.();
              setInputValue("");
              setDebouncedQuery("");
            }}
          >
            Clear all
          </button>
        </div>
      )}

      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          className={`input ${styles.input}`}
          placeholder={
            selectedLocations.length > 0
              ? "Add another city (e.g. Alappuzha, Kottayam)…"
              : placeholder
          }
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            setHighlighted(0);
          }}
          onKeyDown={onKeyDown}
        />
        {inputValue && (
          <button
            type="button"
            className={styles.clearBtn}
            aria-label="Clear search"
            onClick={() => {
              setInputValue("");
              setDebouncedQuery("");
              setHighlighted(-1);
              inputRef.current?.focus();
            }}
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      {atLimit && (
        <p className={styles.limitNote} role="status">
          Maximum of {maxSelections} cities selected. Remove one to add another.
        </p>
      )}

      {open && (
        <ul id={listId} role="listbox" aria-multiselectable="true" className={styles.dropdown} data-lenis-prevent>
          <li className={styles.sectionHeader} role="presentation">
            <span>{sectionTitle}</span>
            {showUseMyLocation && (
              <button
                type="button"
                className={styles.geoAction}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => requestBrowserLocation(true)}
              >
                Use my location
              </button>
            )}
            {geoStatus === "requesting" && <span>Locating…</span>}
          </li>

          {isLoadingList ? (
            <li className={styles.stateRow} role="status">
              {isSearching ? "Searching cities…" : "Finding nearby cities…"}
            </li>
          ) : searchError && isSearching ? (
            <li className={styles.stateRow} role="alert">
              Could not load cities. Please try again.
            </li>
          ) : visibleItems.length === 0 ? (
            <li className={styles.stateRow} role="status">
              {isSearching
                ? `No matching cities found for "${debouncedQuery}".`
                : "Start typing a city or state name to search."}
            </li>
          ) : (
            visibleItems.map((item, idx) => {
              const canonicalId = String(item.city_id ?? item.id);
              const isSelected = selectedIdSet.has(canonicalId);
              const disabled = atLimit && !isSelected;

              return (
                <li key={canonicalId} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={styles.itemBtn}
                    disabled={disabled}
                    data-highlighted={highlighted === idx ? "true" : undefined}
                    data-selected={isSelected ? "true" : undefined}
                    onMouseEnter={() => setHighlighted(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleToggleItem(item)}
                  >
                    <span className={styles.itemMain}>
                      <span className={styles.itemName}>{item.name}</span>
                      {item.subtitle && <span className={styles.itemSub}>{item.subtitle}</span>}
                    </span>
                    <span className={styles.itemMeta}>
                      {typeof item.distance_km === "number" && !isSelected && (
                        <span className={styles.distanceTag}>
                          {item.distance_km < 1 ? "< 1 km" : `${Math.round(item.distance_km)} km`}
                        </span>
                      )}
                      {isSelected && (
                        <span className={styles.selectedTag}>
                          <Icon name="check" size={12} /> Selected
                        </span>
                      )}
                    </span>
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
