import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, ExternalLink, X } from 'lucide-react';
import type { Museum } from '../@types';

interface Props {
  museums: Museum[];
}

interface SelectedMuseum extends Museum {
  //
}

const MuseumMap: React.FC<Props> = ({ museums }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selected, setSelected] = useState<SelectedMuseum | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const validMuseums = museums.filter(
    (m) => m.latitude && m.longitude && m.latitude !== 0 && m.longitude !== 0
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    
    import('leaflet').then((L) => {
      
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Create map centered on India
      const map = L.map(mapRef.current!, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // OpenStreetMap tiles — completely free, no API key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom orange marker icon
      const orangeIcon = L.divIcon({
        className: '',
        html: `<div style="
          width: 32px; height: 32px;
          background: #ea580c;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Add markers for each museum
      validMuseums.forEach((museum) => {
        const marker = L.marker([museum.latitude!, museum.longitude!], { icon: orangeIcon });

        marker.bindPopup(`
          <div style="min-width:200px; font-family: sans-serif;">
            <div style="font-weight:700; font-size:14px; color:#1f2937; margin-bottom:4px;">
              ${museum.name}
            </div>
            <div style="font-size:12px; color:#6b7280; margin-bottom:6px;">
              ${museum.city}, ${museum.state}
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px;">
              <span style="background:#fff7ed; color:#ea580c; padding:2px 8px; border-radius:999px; font-size:11px; border:1px solid #fed7aa;">
                ${museum.type}
              </span>
              <span style="background:#f0fdf4; color:#16a34a; padding:2px 8px; border-radius:999px; font-size:11px; border:1px solid #bbf7d0;">
                ${museum.rating?.toFixed(1) || 'N/A'} stars
              </span>
            </div>
            <div style="font-size:12px; color:#374151; margin-bottom:8px;">
              From ₹${museum.ticketPrices?.adult || 0}
            </div>
          </div>
        `);

        marker.on('click', () => setSelected(museum));
        marker.addTo(map);
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden shadow-lg border">
        <div ref={mapRef} style={{ height: '500px', width: '100%' }} />

        {!mapLoaded && (
          <div className="absolute inset-0 bg-orange-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-3" />
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-xs text-gray-600 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-600" />
            <span>{validMuseums.length} museums on map</span>
          </div>
        </div>
      </div>

      {/* Selected Museum Detail Card */}
      {selected && (
        <Card className="mt-4 border-orange-200 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selected.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{selected.city}, {selected.state}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selected.description && (
              <p className="text-sm text-gray-600 line-clamp-3">{selected.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                {selected.type}
              </Badge>
              {selected.rating && (
                <Badge variant="outline">{selected.rating.toFixed(1)} ★</Badge>
              )}
              {selected.establishedYear && (
                <Badge variant="outline">Est. {selected.establishedYear}</Badge>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Adult', price: selected.ticketPrices?.adult },
                { label: 'Child', price: selected.ticketPrices?.child },
                { label: 'Senior', price: selected.ticketPrices?.senior },
                { label: 'Student', price: selected.ticketPrices?.student },
              ].map(({ label, price }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-semibold text-sm text-orange-600">₹{price ?? 0}</div>
                </div>
              ))}
            </div>

            {selected.facilities?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selected.facilities.slice(0, 4).map((f) => (
                  <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    {f}
                  </span>
                ))}
                {selected.facilities.length > 4 && (
                  <span className="text-xs text-gray-400">+{selected.facilities.length - 4} more</span>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
                onClick={() => window.location.href = `/museum/${selected._id}`}
              >
                Book Tickets
              </Button>
              {selected.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={selected.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MuseumMap;