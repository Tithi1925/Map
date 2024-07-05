import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getDatabase, push, ref, set } from "firebase/database";
import { initializeApp } from "firebase/app";

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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
      setShouldCenter(false);
    }
  }, [center, shouldCenter, setShouldCenter, map]);

  return null;
};

const SimpleMap = () => {
  const start = [22.979954553154236, 72.50086017342043]; // Starting point
  const end = [23.243531133149922, 72.49322461562474]; // Ending point
  const [currentLocation, setCurrentLocation] = useState(null); // Initial current location
  const [mapCenter, setMapCenter] = useState(start); // Initial map center
  const [shouldCenter, setShouldCenter] = useState(false); // State to track if we should center the map
  const [completedPath, setCompletedPath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [currentLocationAddress, setCurrentLocationAddress] = useState('');
  const [username, setUsername] = useState(''); // Add state for username
  const [isTracking, setIsTracking] = useState(false); // State to track if we are tracking the user
  const [watchId, setWatchId] = useState(null); // State to track geolocation watch ID
  const provider = new OpenStreetMapProvider();
  const lastLocationRef = useRef(null);

  const firebaseConfig = {
    apiKey: "AIzaSyDeouxYk3mphLe01gwWAKhuRWQUW4Q7j7U",
    authDomain: "leaftlet-map.firebaseapp.com",
    projectId: "leaftlet-map",
    storageBucket: "leaftlet-map.appspot.com",
    messagingSenderId: "682688095140",
    appId: "1:682688095140:web:706b3839f8fd0f989f9731",
    measurementId: "G-YJZ2NFY9ZG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const fetchAddress = useCallback(async (lat, lng, setAddressFunc) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      if (response.data && response.data.display_name) {
        setAddressFunc(response.data.display_name);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  }, []);

  const fetchRoute = useCallback(async () => {
    try {
      if (currentLocation) {
        const response1 = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${currentLocation[1]},${currentLocation[0]}`, {
          params: {
            overview: 'full',
            geometries: 'geojson'
          }
        });

        const completedCoordinates = response1.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

        const response2 = await axios.get(`https://router.project-osrm.org/route/v1/driving/${currentLocation[1]},${currentLocation[0]};${end[1]},${end[0]}`, {
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
  }, [currentLocation]);

  useEffect(() => {
    if (start) {
      fetchAddress(start[0], start[1], setStartAddress);
    }
    if (end) {
      fetchAddress(end[0], end[1], setEndAddress);
    }
    if (currentLocation) {
      fetchAddress(currentLocation[0], currentLocation[1], setCurrentLocationAddress);
      fetchRoute();
    }
  }, [currentLocation]);

  const startGeolocationWatch = () => {
            if (username && "geolocation" in navigator) {
              const id = navigator.geolocation.watchPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
        
                  // Check if the current location is different from the last stored location
                  if (
                    lastLocationRef.current === null ||
                    lastLocationRef.current.latitude !== latitude ||
                    lastLocationRef.current.longitude !== longitude
                  ) {
                    // Update state with new location
                    setCurrentLocation([latitude, longitude]);
                    setMapCenter([latitude, longitude]);
        
                    // Update Firebase with the new location
                    const usersRef = ref(database, 'users/' + username);
                    push(usersRef, {
                      lat: latitude,
                      lon: longitude
                    });
        
                    // Update last location reference
                    lastLocationRef.current = { latitude, longitude };
                  }
                },
                (error) => {
                  console.error('Error getting current position:', error);
                }
              );
        
              setWatchId(id); // Store the watch ID
            }
          };
        
          useEffect(() => {
            // Start watching geolocation when component mounts
            startGeolocationWatch();
        
            // Cleanup function to clear watch when component unmounts
            return () => {
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
              }
            };
          }, [])
    

  const stopGeolocationWatch = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null); // Clear the watch ID
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = event.target.elements.query.value;
    if (query.trim() !== '') {
      try {
        const results = await provider.search({ query });
        setSearchResults(results);
        if (results.length > 0) {
          const { x, y } = results[0];
          setMapCenter([y, x]);
          setShouldCenter(true);
        } else {
          toast.error(`This map can't find ${query}`);
        }
      } catch (error) {
        toast.error('Error searching location');
      }
    }
  };

  const handleStartTracking = () => {
    if (username.trim() !== '') {
      setIsTracking(true);
      startGeolocationWatch();
    } else {
      toast.error('Please enter a username');
    }
  };

  useEffect(() => {
    return () => {
      stopGeolocationWatch(); // Cleanup on component unmount
    };
  }, []);

  return (
    <div className='container'>
  {!isTracking ? (
        <div className='form-container'>
          <input
            type="text"
            placeholder="Enter your username"
            className='form-search-container'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className='mapsubmit' onClick={handleStartTracking}>Start Tracking</button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="form-container">
            <input type="text" name="query" placeholder="Search location" className='form-search-container' />
            <button type="submit" className='mapsubmit'>Search</button>
          </form>
          
            {currentLocation && (
            <MapContainer center={mapCenter} zoom={8} className="map">
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
        </>
      )}
    </div>
  );
};

export default SimpleMap;

