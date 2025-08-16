import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import L from 'leaflet'

const redIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

export default function MapView() {
  const [locations, setLocations] = useState([])

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from('locations').select('*')
      if (error) console.error(error)
      else setLocations(data)
    }
    fetchData()
  }, [])

  return (
    <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map(loc => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={redIcon}>
          <Popup>{loc.description}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}