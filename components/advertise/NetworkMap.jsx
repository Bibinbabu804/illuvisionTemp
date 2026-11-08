"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Icon from "@/components/ui/Icon";
import BtnIcon from "@/components/ui/BtnIcon";
import { screens, screenTypes, statuses, areas, cities, isSample, mapConfig } from "@/data/network";
import { track, EVENTS } from "@/lib/analytics";
import { savePlanner } from "@/lib/plannerStore";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import styles from "./NetworkMap.module.css";

const typeLabel = Object.fromEntries(screenTypes.map((t) => [t.id, t.label]));
const ease = [0.16, 1, 0.3, 1];

const startZoom = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? mapConfig.zoom - 1 : mapConfig.zoom;

const distanceKm = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

/**
 * Network map in the site's light theme: a white control panel (search,
 * filters, results) beside a warm light-gray map with small dot markers,
 * compact clusters and hover labels. Wheel zoom is off so page scrolling
 * never gets stuck; on touch, one finger scrolls and two fingers pan.
 */
export default function NetworkMap({ enquiryHref = "#enquiry" }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const LRef = useRef(null);
  const clusterRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const listRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [types, setTypes] = useState([]);
  const [area, setArea] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [geoState, setGeoState] = useState("idle");
  const [touchHint, setTouchHint] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = screens.filter(
      (s) =>
        (types.length === 0 || types.includes(s.type)) &&
        (area === "all" || s.area === area) &&
        (!q || `${s.name} ${s.area} ${typeLabel[s.type]}`.toLowerCase().includes(q))
    );
    if (!userPos) return list;
    return list.map((s) => ({ ...s, km: distanceKm(userPos, s) })).sort((a, b) => a.km - b.km);
  }, [types, area, query, userPos]);

  const selectedScreen = results.find((s) => s.id === selected) || null;

  // ---- Create the map once ----
  useEffect(() => {
    let cancelled = false;
    let map;
    (async () => {
      const L = (await import("leaflet")).default;
      window.L = L;
      await import("leaflet.markercluster");
      if (cancelled || !mapEl.current) return;
      LRef.current = L;
      const touch = window.matchMedia("(pointer: coarse)").matches;

      map = L.map(mapEl.current, {
        center: mapConfig.center,
        zoom: startZoom(),
        minZoom: mapConfig.minZoom,
        maxZoom: mapConfig.maxZoom,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: !touch,
        tap: false,
        zoomSnap: 0.5,
      });
      L.tileLayer(mapConfig.tileUrl, { attribution: mapConfig.attribution, maxNativeZoom: 16, className: styles.tiles }).addTo(map);
      if (mapConfig.labelsUrl) {
        L.tileLayer(mapConfig.labelsUrl, { maxNativeZoom: 16, className: styles.labels, pane: "overlayPane" }).addTo(map);
      }

      // Subtle animated links between the network's cities.
      const [hub, ...rest] = cities;
      rest.forEach((c) => {
        L.polyline(
          [
            [hub.lat, hub.lng],
            [c.lat, c.lng],
          ],
          { className: styles.link, interactive: false, weight: 1.2 }
        ).addTo(map);
      });

      clusterRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 48,
        animate: true,
        iconCreateFunction: (cluster) => {
          const n = cluster.getChildCount();
          const size = n < 10 ? 30 : n < 30 ? 34 : 38;
          return L.divIcon({ html: `<span>${n}</span>`, className: styles.cluster, iconSize: [size, size] });
        },
      }).addTo(map);

      if (touch) {
        let t;
        mapEl.current.addEventListener(
          "touchmove",
          (e) => {
            if (e.touches.length === 1) {
              setTouchHint(true);
              clearTimeout(t);
              t = setTimeout(() => setTouchHint(false), 1400);
            }
          },
          { passive: true }
        );
      }

      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // ---- Sync markers with filters ----
  useEffect(() => {
    const L = LRef.current;
    const group = clusterRef.current;
    if (!ready || !L || !group) return;
    group.clearLayers();
    markersRef.current = {};
    const markers = results.map((s) => {
      const m = L.marker([s.lat, s.lng], {
        icon: L.divIcon({
          html: `<span class="${styles.dot}"></span>`,
          className: `${styles.pin} ${styles[`t_${s.type}`]}`,
          iconSize: [22, 22],
        }),
        title: `${s.name}, ${s.area}`,
        keyboard: true,
        riseOnHover: true,
      });
      m.bindTooltip(`<strong>${s.name}</strong><span>${s.area} · ${typeLabel[s.type]}</span>`, {
        direction: "top",
        offset: [0, -10],
        className: styles.tip,
      });
      m.on("click", () => {
        setSelected(s.id);
        track(EVENTS.MAP_MARKER, { section: "map", screen: s.id, sample: isSample });
      });
      markersRef.current[s.id] = m;
      return m;
    });
    group.addLayers(markers);
    if (markers.length && (types.length || area !== "all" || query)) {
      mapRef.current.flyToBounds(group.getBounds().pad(0.3), { duration: 1, maxZoom: 12 });
    }
  }, [ready, results, types.length, area, query]);

  // ---- Highlight selected marker + list row ----
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, m]) => {
      const el = m.getElement();
      if (el) el.dataset.active = id === selected ? "true" : "false";
    });
    if (!selected || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id="${selected}"]`);
    if (!el) return;
    const list = listRef.current;
    const top = el.offsetTop;
    if (top < list.scrollTop || top + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: top - 8, behavior: "smooth" });
    }
  }, [selected, results]);

  const focusScreen = (s) => {
    setSelected(s.id);
    track(EVENTS.SCREEN_DETAIL, { section: "map-list", screen: s.id, sample: isSample });
    const m = markersRef.current[s.id];
    if (m && clusterRef.current) {
      clusterRef.current.zoomToShowLayer(m, () => {
        const el = m.getElement();
        if (el) el.dataset.active = "true";
      });
    }
  };

  const zoom = (d) => mapRef.current?.[d > 0 ? "zoomIn" : "zoomOut"]();
  const reset = () => {
    setSelected(null);
    mapRef.current?.flyTo(mapConfig.center, startZoom(), { duration: 1.1 });
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setGeoState("idle");
        setArea("all");
        const L = LRef.current;
        if (L && mapRef.current) {
          userMarkerRef.current?.remove();
          userMarkerRef.current = L.marker([p.lat, p.lng], {
            icon: L.divIcon({ html: "<span></span>", className: styles.me, iconSize: [18, 18] }),
            interactive: false,
          }).addTo(mapRef.current);
          mapRef.current.flyTo([p.lat, p.lng], 11, { duration: 1.4 });
        }
        track(EVENTS.PLANNER_CHANGE, { section: "map", action: "near-me" });
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const toggleType = (id) => {
    setTypes((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
    setSelected(null);
    track(EVENTS.PLANNER_CHANGE, { section: "map", filter: "type", value: id });
  };

  const enquire = (s) => savePlanner({ screens: [`${s.name} (${s.area})`], area: s.area, types: [s.type] });
  const visible = showAll ? results : results.slice(0, 40);

  return (
    <div className={styles.frame}>
      {/* ---------- control panel ---------- */}
      <aside className={styles.panel} aria-label="Search and filter screens">
        <div className={styles.panelHead}>
          <div>
            <p className={styles.panelKicker}>Screen network</p>
            <p className={styles.panelCount}>
              <motion.span key={results.length} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease }}>
                {results.length}
              </motion.span>{" "}
              {isSample ? "sample screens" : "screens"}
            </p>
          </div>
          {isSample && <span className="badge badge--sample">Sample data</span>}
        </div>

        <label className={styles.search}>
          <Icon name="zoom" size={18} />
          <span className="visually-hidden">Search screens or cities</span>
          <input
            type="search"
            className="input"
            placeholder="Search a city or venue"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
          />
        </label>

        <div className="chip-group" role="group" aria-label="Filter by screen type">
          {screenTypes.map((t) => (
            <button key={t.id} type="button" className="chip" aria-pressed={types.includes(t.id)} onClick={() => toggleType(t.id)}>
              <span className={styles.chipDot} data-type={t.id} />
              {t.label}
            </button>
          ))}
        </div>

        <label className={styles.citySelect}>
          <span className="visually-hidden">City</span>
          <select
            className="input"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setSelected(null);
              if (e.target.value === "all") reset();
            }}
          >
            <option value="all">All cities</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        <p className={styles.listHead}>{userPos ? "Nearest to you" : "Results"}</p>
        <ul ref={listRef} className={styles.list} data-lenis-prevent>
          <AnimatePresence initial={false}>
            {visible.map((s) => (
              <motion.li
                key={s.id}
                data-id={s.id}
                layout="position"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
              >
                <button type="button" className={styles.result} data-active={s.id === selected} onClick={() => focusScreen(s)}>
                  <span className={styles.resultDot} data-type={s.type} />
                  <span className={styles.resultText}>
                    <strong>{s.name}</strong>
                    <span>
                      {s.area} · {typeLabel[s.type]}
                      {s.km != null && ` · ${s.km.toFixed(1)} km`}
                    </span>
                  </span>
                  <Icon name="chevronRight" size={16} className={styles.resultArrow} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          {results.length === 0 && (
            <li className={styles.empty}>
              No screens match.{" "}
              <button type="button" onClick={() => { setTypes([]); setArea("all"); setQuery(""); }}>Clear filters</button>
            </li>
          )}
          {!showAll && results.length > visible.length && (
            <li>
              <button type="button" className={styles.more} onClick={() => setShowAll(true)}>
                Show all {results.length}
              </button>
            </li>
          )}
        </ul>
      </aside>

      {/* ---------- map ---------- */}
      <div className={styles.mapWrap}>
        <div ref={mapEl} className={styles.map} aria-label="Map of sample screen locations" role="region" />
        {!ready && <div className={styles.loading} aria-hidden="true" />}

        <div className={styles.legend} aria-hidden="true">
          {screenTypes.map((t) => (
            <span key={t.id}>
              <i data-type={t.id} /> {t.label}
            </span>
          ))}
        </div>

        <div className={styles.zoom} role="group" aria-label="Map zoom">
          <button type="button" onClick={() => zoom(1)} aria-label="Zoom in"><Icon name="plus" size={18} /></button>
          <button type="button" onClick={() => zoom(-1)} aria-label="Zoom out"><Icon name="minus" size={18} /></button>
          <button type="button" onClick={reset} aria-label="Reset map view"><Icon name="map" size={16} /></button>
        </div>

        <div className={styles.nearRow}>
          <button type="button" className="btn btn--light" onClick={locate} disabled={geoState === "locating"}>
            <BtnIcon name="pin" />
            <span>{geoState === "locating" ? "Locating…" : userPos ? "Screens near you" : "Find screens near me"}</span>
          </button>
        </div>
        {(geoState === "denied" || geoState === "unsupported") && (
          <p className={styles.geoMsg} role="status">
            {geoState === "denied" ? "Location access was blocked. Search a city instead." : "Location isn't available here. Search a city instead."}
          </p>
        )}

        <p className={styles.touchHint} data-show={touchHint} aria-hidden="true">Use two fingers to move the map</p>

        <AnimatePresence>
          {selectedScreen && (
            <motion.div
              className={styles.detail}
              key={selectedScreen.id}
              role="dialog"
              aria-label={`${selectedScreen.name} details`}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.45, ease }}
            >
              <button type="button" className={styles.detailClose} aria-label="Close details" onClick={() => setSelected(null)}>
                <Icon name="close" size={16} />
              </button>
              <p className={styles.detailType}>
                <span className={styles.resultDot} data-type={selectedScreen.type} />
                {typeLabel[selectedScreen.type]}
              </p>
              <h3>{selectedScreen.name}</h3>
              <p className={styles.detailMeta}>
                {selectedScreen.venue} · {selectedScreen.area}
                {selectedScreen.km != null && ` · ${selectedScreen.km.toFixed(1)} km away`}
              </p>
              <div className={styles.detailFoot}>
                <span className="badge">{statuses[selectedScreen.status].label}</span>
                <a href={enquiryHref} className="btn btn--sm" onClick={() => enquire(selectedScreen)}>
                  <BtnIcon name="arrow" />
                  <span>Enquire</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
