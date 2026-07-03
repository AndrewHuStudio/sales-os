"use client";

import MapLibreGL, { type MarkerOptions, type PopupOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Locate, Loader2, Maximize, Minus, Plus, X } from "lucide-react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

type Theme = "light" | "dark";

type MapViewport = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

type MapStyleOption = string | MapLibreGL.StyleSpecification;
type MapRef = MapLibreGL.Map;

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a Map component");
  return context;
}

function getDocumentTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return null;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useResolvedTheme(themeProp?: Theme): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(() => getDocumentTheme() ?? getSystemTheme());
  useEffect(() => {
    if (themeProp) return;
    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) setDetectedTheme(docTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!getDocumentTheme()) setDetectedTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeProp]);
  return themeProp ?? detectedTheme;
}

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter();
  return { center: [center.lng, center.lat], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
}

function DefaultLoader() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

type MapProps = {
  children?: ReactNode;
  className?: string;
  theme?: Theme;
  styles?: { light?: MapStyleOption; dark?: MapStyleOption };
  projection?: MapLibreGL.ProjectionSpecification;
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
  loading?: boolean;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

const Map = forwardRef<MapRef, MapProps>(function Map(
  { children, className, theme: themeProp, styles, projection, viewport, onViewportChange, loading = false, ...props },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const currentStyleRef = useRef<MapStyleOption | null>(null);
  const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const internalUpdateRef = useRef(false);
  const resolvedTheme = useResolvedTheme(themeProp);
  const isControlled = viewport !== undefined && onViewportChange !== undefined;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;
  const mapStyles = useMemo(() => ({ dark: styles?.dark ?? defaultStyles.dark, light: styles?.light ?? defaultStyles.light }), [styles]);
  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);
  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) clearTimeout(styleTimeoutRef.current);
    styleTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const initialStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    currentStyleRef.current = initialStyle;
    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    });
    const styleDataHandler = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true);
        if (projection) (map as MapLibreGL.Map & { setProjection?: (p: MapLibreGL.ProjectionSpecification) => void }).setProjection?.(projection);
      }, 100);
    };
    const loadHandler = () => setIsLoaded(true);
    const handleMove = () => {
      if (!internalUpdateRef.current) onViewportChangeRef.current?.(getViewport(map));
    };
    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("move", handleMove);
    setMapInstance(map);
    return () => {
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("move", handleMove);
      map.remove();
      setIsLoaded(false);
      setIsStyleLoaded(false);
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport || mapInstance.isMoving()) return;
    const current = getViewport(mapInstance);
    const next = {
      center: viewport.center ?? current.center,
      zoom: viewport.zoom ?? current.zoom,
      bearing: viewport.bearing ?? current.bearing,
      pitch: viewport.pitch ?? current.pitch,
    };
    if (next.center[0] === current.center[0] && next.center[1] === current.center[1] && next.zoom === current.zoom && next.bearing === current.bearing && next.pitch === current.pitch) return;
    internalUpdateRef.current = true;
    mapInstance.jumpTo(next);
    internalUpdateRef.current = false;
  }, [mapInstance, isControlled, viewport]);

  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;
    const newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (currentStyleRef.current === newStyle) return;
    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    setIsStyleLoaded(false);
    mapInstance.setStyle(newStyle, { diff: true });
  }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

  const contextValue = useMemo(() => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }), [mapInstance, isLoaded, isStyleLoaded]);
  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative h-full w-full", className)}>
        {(!isLoaded || loading) && <DefaultLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

type MarkerContextValue = { marker: MapLibreGL.Marker; map: MapLibreGL.Map | null };
const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) throw new Error("Marker components must be used within MapMarker");
  return context;
}

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({ longitude, latitude, children, onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd, draggable = false, ...markerOptions }: MapMarkerProps) {
  const { map } = useMap();
  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd });
  callbacksRef.current = { onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd };
  const marker = useMemo(() => {
    const markerInstance = new MapLibreGL.Marker({ ...markerOptions, element: document.createElement("div"), draggable }).setLngLat([longitude, latitude]);
    markerInstance.getElement().addEventListener("click", (e) => callbacksRef.current.onClick?.(e));
    markerInstance.getElement().addEventListener("mouseenter", (e) => callbacksRef.current.onMouseEnter?.(e));
    markerInstance.getElement().addEventListener("mouseleave", (e) => callbacksRef.current.onMouseLeave?.(e));
    markerInstance.on("dragstart", () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
    });
    markerInstance.on("drag", () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
    });
    markerInstance.on("dragend", () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
    });
    return markerInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => { marker.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const lngLat = marker.getLngLat();
  if (lngLat.lng !== longitude || lngLat.lat !== latitude) marker.setLngLat([longitude, latitude]);
  if (marker.isDraggable() !== draggable) marker.setDraggable(draggable);
  return <MarkerContext.Provider value={{ marker, map }}>{children}</MarkerContext.Provider>;
}

function MarkerContent({ children, className }: { children?: ReactNode; className?: string }) {
  const { marker } = useMarkerContext();
  return createPortal(<div className={cn("relative cursor-pointer", className)}>{children || <div className="relative size-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />}</div>, marker.getElement());
}

function PopupCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Close popup" className="absolute right-1 top-1 z-10 inline-flex size-6 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <X className="size-3.5" />
    </button>
  );
}

type MarkerPopupProps = { children: ReactNode; className?: string; closeButton?: boolean } & Omit<PopupOptions, "className" | "closeButton">;

function MarkerPopup({ children, className, closeButton = false, ...popupOptions }: MarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const popup = useMemo(() => new MapLibreGL.Popup({ offset: 16, ...popupOptions, closeButton: false }).setMaxWidth("none").setDOMContent(container), []);
  useEffect(() => {
    if (!map) return;
    popup.setDOMContent(container);
    marker.setPopup(popup);
    return () => { marker.setPopup(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return createPortal(
    <div className={cn("relative max-w-[15.5rem] rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 duration-200", className)}>
      {closeButton && <PopupCloseButton onClick={() => popup.remove()} />}
      {children}
    </div>,
    container,
  );
}

type MarkerTooltipProps = { children: ReactNode; className?: string } & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">;

function MarkerTooltip({ children, className, ...popupOptions }: MarkerTooltipProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const tooltip = useMemo(() => new MapLibreGL.Popup({ offset: 16, ...popupOptions, closeOnClick: true, closeButton: false }).setMaxWidth("none"), []);
  useEffect(() => {
    if (!map) return;
    tooltip.setDOMContent(container);
    const enter = () => tooltip.setLngLat(marker.getLngLat()).addTo(map);
    const leave = () => tooltip.remove();
    marker.getElement().addEventListener("mouseenter", enter);
    marker.getElement().addEventListener("mouseleave", leave);
    return () => {
      marker.getElement().removeEventListener("mouseenter", enter);
      marker.getElement().removeEventListener("mouseleave", leave);
      tooltip.remove();
    };
  }, [map, marker, tooltip, container]);
  return createPortal(<div className={cn("pointer-events-none rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md", className)}>{children}</div>, container);
}

function MarkerLabel({ children, className, position = "top" }: { children: ReactNode; className?: string; position?: "top" | "bottom" }) {
  return <div className={cn("absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-foreground", position === "top" ? "bottom-full mb-1" : "top-full mt-1", className)}>{children}</div>;
}

type MapControlsProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

const positionClasses = { "top-left": "left-2 top-2", "top-right": "right-2 top-2", "bottom-left": "bottom-2 left-2", "bottom-right": "bottom-10 right-2" };

function ControlButton({ onClick, label, children, disabled = false }: { onClick: () => void; label: string; children: ReactNode; disabled?: boolean }) {
  return <button onClick={onClick} aria-label={label} type="button" className="flex size-8 items-center justify-center transition-all hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" disabled={disabled}>{children}</button>;
}

function ControlGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-sm [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-border">{children}</div>;
}

function MapControls({ position = "bottom-right", showZoom = true, showCompass = false, showLocate = false, showFullscreen = false, className, onLocate }: MapControlsProps) {
  const { map } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);
  const handleLocate = useCallback(() => {
    setWaitingForLocation(true);
    if (!("geolocation" in navigator)) return setWaitingForLocation(false);
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
      map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14, duration: 1500 });
      onLocate?.(coords);
      setWaitingForLocation(false);
    }, () => setWaitingForLocation(false));
  }, [map, onLocate]);
  return (
    <div className={cn("absolute z-10 flex flex-col gap-1.5", positionClasses[position], className)}>
      {showZoom && <ControlGroup><ControlButton onClick={() => map?.zoomTo(map.getZoom() + 1, { duration: 300 })} label="Zoom in"><Plus className="size-4" /></ControlButton><ControlButton onClick={() => map?.zoomTo(map.getZoom() - 1, { duration: 300 })} label="Zoom out"><Minus className="size-4" /></ControlButton></ControlGroup>}
      {showCompass && <ControlGroup><ControlButton onClick={() => map?.resetNorthPitch({ duration: 300 })} label="Reset bearing"><span className="text-xs font-medium">N</span></ControlButton></ControlGroup>}
      {showLocate && <ControlGroup><ControlButton onClick={handleLocate} label="Find my location" disabled={waitingForLocation}>{waitingForLocation ? <Loader2 className="size-4 animate-spin" /> : <Locate className="size-4" />}</ControlButton></ControlGroup>}
      {showFullscreen && <ControlGroup><ControlButton onClick={() => { const el = map?.getContainer(); if (!el) return; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen(); }} label="Toggle fullscreen"><Maximize className="size-4" /></ControlButton></ControlGroup>}
    </div>
  );
}

type MapPopupProps = { longitude: number; latitude: number; onClose?: () => void; children: ReactNode; className?: string; closeButton?: boolean } & Omit<PopupOptions, "className" | "closeButton">;

function MapPopup({ longitude, latitude, onClose, children, className, closeButton = false, ...popupOptions }: MapPopupProps) {
  const { map } = useMap();
  const container = useMemo(() => document.createElement("div"), []);
  const popup = useMemo(() => new MapLibreGL.Popup({ offset: 16, ...popupOptions, closeButton: false }).setMaxWidth("none").setLngLat([longitude, latitude]), []);
  useEffect(() => {
    if (!map) return;
    const close = () => onClose?.();
    popup.on("close", close);
    popup.setDOMContent(container);
    popup.addTo(map);
    return () => {
      popup.off("close", close);
      if (popup.isOpen()) popup.remove();
    };
  }, [map, popup, container, onClose]);
  if (popup.isOpen()) popup.setLngLat([longitude, latitude]);
  return createPortal(<div className={cn("relative max-w-[15.5rem] rounded-md border bg-popover p-3 text-popover-foreground shadow-md", className)}>{closeButton && <PopupCloseButton onClick={() => popup.remove()} />}{children}</div>, container);
}

type MapRouteProps = {
  id?: string;
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: [number, number];
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  interactive?: boolean;
};

function safeId(id: string) {
  return id.replace(/[^a-zA-Z0-9-_]/g, "");
}

function MapRoute({ id: propId, coordinates, color = "#4285F4", width = 3, opacity = 0.8, dashArray, onClick, onMouseEnter, onMouseLeave, interactive = true }: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const autoId = safeId(useId());
  const id = propId ?? autoId;
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;
  useEffect(() => {
    if (!isLoaded || !map) return;
    map.addSource(sourceId, { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } } });
    map.addLayer({ id: layerId, type: "line", source: sourceId, layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": color, "line-width": width, "line-opacity": opacity, ...(dashArray && { "line-dasharray": dashArray }) } });
    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map]);
  useEffect(() => {
    if (!isLoaded || !map || coordinates.length < 2) return;
    (map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined)?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } });
  }, [isLoaded, map, coordinates, sourceId]);
  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return;
    map.setPaintProperty(layerId, "line-color", color);
    map.setPaintProperty(layerId, "line-width", width);
    map.setPaintProperty(layerId, "line-opacity", opacity);
    if (dashArray) map.setPaintProperty(layerId, "line-dasharray", dashArray);
  }, [isLoaded, map, layerId, color, width, opacity, dashArray]);
  useEffect(() => {
    if (!isLoaded || !map || !interactive) return;
    const click = () => onClick?.();
    const enter = () => { map.getCanvas().style.cursor = "pointer"; onMouseEnter?.(); };
    const leave = () => { map.getCanvas().style.cursor = ""; onMouseLeave?.(); };
    map.on("click", layerId, click);
    map.on("mouseenter", layerId, enter);
    map.on("mouseleave", layerId, leave);
    return () => {
      map.off("click", layerId, click);
      map.off("mouseenter", layerId, enter);
      map.off("mouseleave", layerId, leave);
    };
  }, [isLoaded, map, layerId, onClick, onMouseEnter, onMouseLeave, interactive]);
  return null;
}

type MapArcDatum = { id: string | number; from: [number, number]; to: [number, number] };
type MapArcEvent<T extends MapArcDatum = MapArcDatum> = { arc: T; longitude: number; latitude: number; originalEvent: MapLibreGL.MapMouseEvent };
function MapArc() { return null; }
function MapClusterLayer() { return null; }

export { Map, useMap, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip, MarkerLabel, MapPopup, MapControls, MapRoute, MapArc, MapClusterLayer };
export type { MapRef, MapViewport, MapArcDatum, MapArcEvent };
