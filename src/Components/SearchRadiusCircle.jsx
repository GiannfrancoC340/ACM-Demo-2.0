// src/components/SearchRadiusCircle.jsx
import { Circle } from 'react-leaflet';

const BCT_COORDS = {
  lat: 26.3785,
  lng: -80.1077
};

export default function SearchRadiusCircle({ radiusKm = 50, visible = true }) {
  if (!visible) return null;

  return (
    <Circle
      center={[BCT_COORDS.lat, BCT_COORDS.lng]}
      radius={radiusKm * 1000} // Convert km to meters
      pathOptions={{
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '10, 10' // Dashed line
      }}
    />
  );
}