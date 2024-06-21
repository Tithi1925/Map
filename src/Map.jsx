import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css'
import L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import axios from 'axios';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { toast } from 'react-toastify';

const redIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
const greenIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const redIcon = L.icon({
  iconUrl: redIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41]
});

const greenIcon = L.icon({
  iconUrl: greenIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41]
});

const ChangeMapCenter = ({ center, shouldCenter, setShouldCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (shouldCenter) {
      map.setView(center, map.getZoom());
      setShouldCenter(false); // Reset the shouldCenter flag
    }
  }, [center, shouldCenter, setShouldCenter, map]);

  return null;
};

const SimpleMap = () => {
  const start = [23.013487532235562, 72.50403242503077]; // Starting point
  const end = [23.164423073637163, 72.8092796894774]; // Ending point
  // 23.0132668, 72.5042391
  const [currentLocation, setCurrentLocation] = useState(); // Initial current location
  const [mapCenter, setMapCenter] = useState(); // Initial map center
  const [shouldCenter, setShouldCenter] = useState(false); // State to track if we should center the map
  const [completedPath, setCompletedPath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [currentLocationAddress, setCurrentLocationAddress] = useState('');
  const provider = new OpenStreetMapProvider();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]); // Center map on the current location
        },
        (error) => {
          console.error('Error getting current position:', error);
        }
      );
    } else {
      console.log("Geolocation is not available in your browser.");
    }
  }, []);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]); // Center map on the current location
      },
      (error) => {
        console.error('Error getting current position:', error);
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // useEffect(() => {
  //   const fetchAddress = async (lat, lng, setAddressFunc) => {
  //     try {
  //       const apiKey = '5b3ce3597851110001cf6248b3fd28cd24bf42dd9e0417d885bda499'; // Replace with your OpenRoute API key
  //       const response = await axios.get(`https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lon=${lng}&point.lat=${lat}&size=100`);
  //       if (response.data && response.data.features && response.data.features.length > 0) {
  //         setAddressFunc(response.data.features[0].properties.label);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching address:', error);
  //     }
  //   };
  
  //   if (start) {
  //     fetchAddress(start[0], start[1], setStartAddress);
  //   }
  //   if (end) {
  //     fetchAddress(end[0], end[1], setEndAddress);
  //   }
  //   if (currentLocation) {
  //     fetchAddress(currentLocation[0], currentLocation[1], setCurrentLocationAddress);
  //     console.log(currentLocationAddress)
  //   }
  // }, [currentLocation]); 

  useEffect(() => {
    const fetchAddress = async (lat, lng, setAddressFunc) => {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        if (response.data && response.data.display_name) {
          setAddressFunc(response.data.display_name);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };
  
    if (start) {
      fetchAddress(start[0], start[1], setStartAddress);
    }
    if (end) {
      fetchAddress(end[0], end[1], setEndAddress);
    }
    if (currentLocation) {
      fetchAddress(currentLocation[0], currentLocation[1], setCurrentLocationAddress);
    }
  }, [currentLocation]);
  
  
  

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        if (currentLocation) {
          const response1 = await axios.get(`http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${currentLocation[1]},${currentLocation[0]}`, {
            params: {
              overview: 'full',
              geometries: 'geojson'
            }
          });

          const completedCoordinates = response1.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

          const response2 = await axios.get(`http://router.project-osrm.org/route/v1/driving/${currentLocation[1]},${currentLocation[0]};${end[1]},${end[0]}`, {
            params: {
              overview: 'full',
              geometries: 'geojson'
            }
          });

          const remainingCoordinates = response2.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

          setCompletedPath(completedCoordinates);
          setRemainingPath(remainingCoordinates);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [currentLocation]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = event.target.elements.query.value;
    if (query.trim() !== '') {
      const results = await provider.search({ query });
      setSearchResults(results);
      if (results.length > 0) {
        const { x, y } = results[0];
        setMapCenter([y, x]);
        setShouldCenter(true); 
      }
      else{
        toast.error(`This map can't find ${query}`)
      }
    }
  };

  return (
    <div className='container'>
    <form onSubmit={handleSearch} className="form-container">
      <input type="text" name="query" placeholder="Search location" className='maptext' />
      <button type="submit" className='mapsubmit'>Search</button>
    </form>
    {currentLocation && (
      <MapContainer center={mapCenter} zoom={13} className="map" style={{ height: "400px", width: "100%" }}>
        <ChangeMapCenter center={mapCenter} shouldCenter={shouldCenter} setShouldCenter={setShouldCenter} />
        <TileLayer
          className='tiles'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {completedPath.length > 0 && <Polyline positions={completedPath} color='green' />}
        {remainingPath.length > 0 && <Polyline positions={remainingPath} color="red" />}
        <Marker position={start} icon={redIcon}>
          <Tooltip>{startAddress}</Tooltip>
        </Marker>
        <Marker position={end} icon={greenIcon}>
          <Tooltip>{endAddress}</Tooltip>
        </Marker>
        <Marker position={currentLocation}>
          <Tooltip>{currentLocationAddress}</Tooltip>
        </Marker>
  
        {searchResults.map((result, index) => (
          <Marker key={index} position={[result.y, result.x]}>
            <Tooltip>{result.label}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    )}
  </div>
  
  );
};

export default SimpleMap;

