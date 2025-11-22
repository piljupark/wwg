// types/naver-maps.d.ts
declare namespace naver {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      setCenter(center: LatLng | Coord): void;
      getCenter(): LatLng;
      setZoom(zoom: number, animate?: boolean): void;
      getZoom(): number;
      fitBounds(bounds: LatLngBounds, margin?: Margin | number): void;
      panTo(coord: LatLng | Coord, transition?: boolean): void;
      destroy(): void;
    }

    interface MapOptions {
      center?: LatLng | Coord;
      zoom?: number;
      minZoom?: number;
      maxZoom?: number;
      zoomControl?: boolean;
      zoomControlOptions?: ZoomControlOptions;
      mapTypeControl?: boolean;
      scaleControl?: boolean;
      logoControl?: boolean;
      mapDataControl?: boolean;
      [key: string]: any;
    }

    interface ZoomControlOptions {
      position?: Position;
      style?: string;
    }

    enum Position {
      TOP_LEFT,
      TOP_CENTER,
      TOP_RIGHT,
      LEFT_CENTER,
      CENTER,
      RIGHT_CENTER,
      BOTTOM_LEFT,
      BOTTOM_CENTER,
      BOTTOM_RIGHT,
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
      equals(other: LatLng): boolean;
      toString(): string;
      clone(): LatLng;
    }

    interface Coord {
      x: number;
      y: number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(coord: LatLng | Coord): LatLngBounds;
      union(bounds: LatLngBounds): LatLngBounds;
      equals(other: LatLngBounds): boolean;
      getSW(): LatLng;
      getNE(): LatLng;
      getCenter(): LatLng;
      hasLatLng(latlng: LatLng): boolean;
      isEmpty(): boolean;
    }

    interface Margin {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      getMap(): Map | null;
      setPosition(position: LatLng | Coord): void;
      getPosition(): LatLng;
      setTitle(title: string): void;
      getTitle(): string;
      setIcon(icon: string | ImageIcon | SymbolIcon | HtmlIcon): void;
      setVisible(visible: boolean): void;
      getVisible(): boolean;
      setZIndex(zIndex: number): void;
      setClickable(clickable: boolean): void;
      destroy(): void;
    }

    interface MarkerOptions {
      map?: Map;
      position: LatLng | Coord;
      icon?: string | ImageIcon | SymbolIcon | HtmlIcon;
      title?: string;
      visible?: boolean;
      clickable?: boolean;
      draggable?: boolean;
      zIndex?: number;
      [key: string]: any;
    }

    interface ImageIcon {
      url: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
    }

    interface SymbolIcon {
      path: string | SymbolPath;
      style?: string;
      radius?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
      anchor?: Point;
    }

    interface HtmlIcon {
      content: string | HTMLElement;
      size?: Size;
      anchor?: Point | string;
    }

    enum SymbolPath {
      CIRCLE,
      BACKWARD_CLOSED_ARROW,
      FORWARD_CLOSED_ARROW,
      BACKWARD_OPEN_ARROW,
      FORWARD_OPEN_ARROW,
    }

    class Size {
      constructor(width: number, height: number);
      width: number;
      height: number;
      equals(other: Size): boolean;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
      equals(other: Point): boolean;
      clone(): Point;
    }

    class Polyline {
      constructor(options: PolylineOptions);
      setMap(map: Map | null): void;
      getMap(): Map | null;
      setPath(path: LatLng[] | Coord[]): void;
      getPath(): LatLng[];
      setOptions(options: PolylineOptions): void;
      setVisible(visible: boolean): void;
      getVisible(): boolean;
      destroy(): void;
    }

    interface PolylineOptions {
      map?: Map;
      path?: LatLng[] | Coord[];
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      strokeStyle?: string;
      strokeLineCap?: string;
      strokeLineJoin?: string;
      startIcon?: string | ImageIcon | SymbolIcon;
      endIcon?: string | ImageIcon | SymbolIcon;
      visible?: boolean;
      clickable?: boolean;
      zIndex?: number;
      [key: string]: any;
    }

    class Polygon {
      constructor(options: PolygonOptions);
      setMap(map: Map | null): void;
      getMap(): Map | null;
      setPaths(paths: LatLng[] | LatLng[][]): void;
      getPaths(): LatLng[][];
      setOptions(options: PolygonOptions): void;
      setVisible(visible: boolean): void;
      destroy(): void;
    }

    interface PolygonOptions {
      map?: Map;
      paths?: LatLng[] | LatLng[][];
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      strokeStyle?: string;
      visible?: boolean;
      clickable?: boolean;
      zIndex?: number;
      [key: string]: any;
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(map: Map, anchor?: Marker | LatLng): void;
      close(): void;
      getMap(): Map | null;
      setContent(content: string | HTMLElement): void;
      getContent(): string | HTMLElement;
      setPosition(position: LatLng): void;
      setOptions(options: InfoWindowOptions): void;
    }

    interface InfoWindowOptions {
      content: string | HTMLElement;
      position?: LatLng;
      maxWidth?: number;
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
      anchorColor?: string;
      anchorSize?: Size;
      pixelOffset?: Point;
      disableAutoPan?: boolean;
      [key: string]: any;
    }

    namespace Event {
      function addListener(
        target: any,
        eventName: string,
        listener: (...args: any[]) => void
      ): EventListener;
      function removeListener(listener: EventListener): void;
      function once(
        target: any,
        eventName: string,
        listener: (...args: any[]) => void
      ): EventListener;
      function trigger(target: any, eventName: string, ...args: any[]): void;
      function clearInstanceListeners(target: any): void;
    }

    interface EventListener {
      remove(): void;
    }

    class KVO {
      addListener(eventName: string, listener: (...args: any[]) => void): void;
      get(key: string): any;
      set(key: string, value: any): void;
      trigger(eventName: string, ...args: any[]): void;
    }
  }
}

interface Window {
  naver: typeof naver;
}