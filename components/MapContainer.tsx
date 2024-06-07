"use client"

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, DrawingManager, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import CustomMarker from './CustomMarker';
import { GoPencil } from 'react-icons/go';
import { MdClear } from 'react-icons/md';
import { useSearchParams } from 'next/navigation';
import { Helpers } from '../../thecatskillsrealtor/_lib/helpers';

const helper = new Helpers();
const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: 26.282374,
    lng: -81.789738,
};

const initialMarkers = [{}];
let draw: google.maps.MapsEventListener | null = null;

function MapContainer({ zoom, setPayload, handleSearch, payload, properties, mapAddress, initialLoad, setInitialLoad, setPolyLists, api_key }:
    {
        zoom: number, setPayload: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>, handleSearch: () => void,
        payload: { [key: string]: any }, properties: any[], mapAddress: string, initialLoad: boolean,
        setInitialLoad: React.Dispatch<React.SetStateAction<boolean>>,
        setPolyLists: React.Dispatch<React.SetStateAction<string[]>>,
        api_key: string
    }) {

    const searchParams = useSearchParams();
    const [mapCenter, setMapCenter] = useState(center);
    const mapRef = useRef<google.maps.Map | null>(null);
    const [poly, setPoly] = useState<google.maps.Polyline | null>(null);

    const [event_states, setEventsState] = useState({
        draw_poly: true,
        clear_poly: false,
        show_message: false
    });

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: api_key,
        //nonce: nonce,
    });

    const handleMapLoad = (map: google.maps.Map) => {
        mapRef.current = map;
    };

    const handleMapDrag = () => {
        if (!poly) {
            handleZoom();
        } else {
            console.log("Poly is active...")
        }
    };

    const handleZoom = () => {
        const map = mapRef.current;
        if (map) {

            const bounds = map.getBounds();
            const zoom = map.getZoom();
            if (zoom && bounds) {

                const north = bounds?.getNorthEast().lat();
                const east = bounds?.getNorthEast().lng();
                const south = bounds?.getSouthWest().lat();
                const west = bounds?.getSouthWest().lng();

                let prevPayload = { ...payload };
                prevPayload.map_bounds.north = north;
                prevPayload.map_bounds.south = south;
                prevPayload.map_bounds.east = east;
                prevPayload.map_bounds.west = west;
                prevPayload.zoom = zoom;
                setPayload(prevPayload);

                handleSearch();

            }
        }
    }


    const handleDrawPoly = async () => {

        await disable();
        setPoly(null);

        if (poly && poly != null) {
            poly.setMap(null);
        }

        const map = mapRef.current;
        if (map && !draw) {
            draw = google.maps.event.addListenerOnce(map, 'mousedown', function () {
                drawFreeHand();
            });
        }

    }

    const drawFreeHand = () => {

        const map = mapRef.current;
        if (map) {

            let map_poly = new google.maps.Polyline({ map: map, clickable: false });
            let path = map_poly.getPath();

            let move = google.maps.event.addListener(map, 'mousemove', function (e: any) {
                path.push(e.latLng);
            });

            google.maps.event.addListenerOnce(map, 'mouseup', function () {
                google.maps.event.removeListener(move);
                map_poly.setMap(null);

                // Create a copy of the path for the polygon
                let polygonPath = Array.from(path.getArray());

                // Calculate the area of the polygon
                let area = google.maps.geometry.spherical.computeArea(polygonPath);
                let tolerance = parseInt(area.toString()) / 1700000;
                if (tolerance < 6000) {
                    if (zoom <= 9) {
                        tolerance = 2500;
                    } else {
                        if (zoom == 10) {
                            tolerance = 1500;
                        } else if (zoom == 11) {
                            tolerance = 1000;
                        } else if (zoom == 12) {
                            tolerance = 750;
                        } else {
                            tolerance = 500;
                        }
                    }
                }
                console.log("tolerance:", tolerance, "zoom:", zoom)

                // Simplify the polygon path
                polygonPath = simplifyPath(polygonPath, tolerance); // Adjust the tolerance as needed

                var polygon = new google.maps.Polygon({
                    map: map,
                    paths: polygonPath,
                    strokeWeight: 2,
                });
                setPoly(polygon);

                var polyList = polygonPath.map((latLng) => latLng.toUrlValue(5));

                enable();
                setPolyLists(polyList);
            });

        }

    }

    const simplifyPath = (path: google.maps.LatLng[], tolerance: number) => {

        if (path.length <= 2) {
            return path;
        }

        let simplifiedPath = [path[0]];
        let lastPoint = path[0];

        for (let i = 1; i < path.length - 1; i++) {
            if (google.maps.geometry.spherical.computeDistanceBetween(path[i], lastPoint) >= tolerance) {
                simplifiedPath.push(path[i]);
                lastPoint = path[i];
            }
        }

        simplifiedPath.push(path[path.length - 1]);
        console.log("simplifiedPath:", simplifiedPath)
        return simplifiedPath;
    }

    const handleClearBoundary = () => {

        if (poly) {
            poly.setMap(null);
        }
        setPoly(null);
        draw = null;
        setPolyLists([]);

        setEventsState({
            draw_poly: true,
            clear_poly: false,
            show_message: false,
        });

        handleZoom();

    }

    const disable = async () => {
        const map = mapRef.current;
        if (map) {
            map.setOptions({
                draggable: false,
                zoomControl: false,
                scrollwheel: false,
                disableDoubleClickZoom: false
            });
            google.maps.event.clearListeners(map, 'dragend');

            const new_state = { ...event_states };
            new_state.draw_poly = false;
            new_state.clear_poly = true;
            new_state.show_message = true;
            setEventsState(new_state);
            console.log("new_state:", new_state)
        }
    }

    function enable() {
        const map = mapRef.current;
        if (map) {
            map.setOptions({
                draggable: true,
                zoomControl: true,
                scrollwheel: true,
                disableDoubleClickZoom: true
            });
            setTimeout(function () { google.maps.event.addListener(map, 'dragend', getCoordinates); }, 3000);

            setEventsState({
                draw_poly: false,
                clear_poly: true,
                show_message: false
            });
        }
    }

    function getCoordinates() {

        /**
        if (poly && poly != null) {
            console.log("There is poly")
        } else {

            if (speedTest.markerClusterer) {
                speedTest.markerClusterer.clearMarkers();
            }
            //var cordinates = speedTest.map.getBounds();
            //console.log('Cordinates: '+cordinates);
            aNord = speedTest.map.getBounds().getNorthEast().lat();
            aEst = speedTest.map.getBounds().getNorthEast().lng();
            aSud = speedTest.map.getBounds().getSouthWest().lat();
            aOvest = speedTest.map.getBounds().getSouthWest().lng();

            //alert(aNord+' @ '+aEst+' @ '+aSud+' @ '+aOvest)
            //alert(NELat+' @ '+NELng+' @ '+SWLat+' @ '+SWLng)

            loadPptyInThisArea(aNord, aEst, aSud, aOvest, speedTest.map);

        }
        **/
    }

    const geocodeAddress = (address: string) => {

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (results && status === 'OK') {
                const this_loc = results[0].geometry.location;

                setMapCenter({
                    lat: this_loc.lat(),
                    lng: this_loc.lng(),
                });

                setInitialLoad(false);
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
            }
        });
    };

    useEffect(() => {
        const loc = searchParams?.get("location");
        if (isLoaded && loc != "" && initialLoad) {
            geocodeAddress(`${loc}, FL`);
        }
    }, [searchParams?.get("location"), isLoaded, initialLoad]); //properties

    useEffect(() => {
        console.log("mapCenter:", mapCenter, "initialLoad:", initialLoad)
        handleZoom();
    }, [mapCenter]);

    if (!isLoaded) return <div className='w-full h-full flex justify-center items-center'>
        <AiOutlineLoading3Quarters size={35} className='animate-spin' />
    </div>;

    const mapOptions = {
        fullscreenControl: false,
        mapTypeControl: false, // Remove other controls if needed
        streetViewControl: false,
        zoomControl: true,
    };

    const groupedData: any[] = [];
    const visitedCoordinates = new Map<string, number>();

    properties.forEach((prop) => {
        const key = `${prop.Latitude},${prop.Longitude}`;
        const count = visitedCoordinates.get(key) || 0;
        visitedCoordinates.set(key, count + 1);
    });

    properties.forEach((prop) => {

        const key = `${prop.Latitude},${prop.Longitude}`;
        const index = groupedData.findIndex((item) => item.Latitude === prop.Latitude && item.Longitude === prop.Longitude);
        const all_clust = properties.filter((item) => item.Latitude === prop.Latitude && item.Longitude === prop.Longitude);

        if (visitedCoordinates.get(key) === 1) {
            groupedData.push({ ...prop, clustered: false });
        } else {
            if (index !== -1) {
                groupedData[index] = { ...groupedData[index], clustered: true, num_of_clusters: visitedCoordinates.get(key), clustered_rops: all_clust };
            } else {
                groupedData.push({ ...prop, clustered: true, num_of_clusters: visitedCoordinates.get(key), clustered_rops: all_clust });
            }
        }
    });

    return (isLoaded && api_key != "") ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={zoom}
            onLoad={handleMapLoad}
            onDragEnd={handleMapDrag}
            onZoomChanged={handleZoom}
            options={mapOptions}>

            {
                event_states.draw_poly && (<button className={`bg-white border absolute z-10 top-[10px] right-2 h-[40px] border-primary text-primary py-2 px-4 flex 
                items-center justify-center`} onClick={handleDrawPoly}>
                    <GoPencil size={14} className='mr-1' /> <span className="">Draw</span>
                </button>)
            }

            {
                event_states.clear_poly && (<button className={`bg-white border absolute z-[9] top-[10px] right-2 h-[40px] border-primary text-primary py-2 px-4 flex 
                items-center justify-center`} onClick={handleClearBoundary}>
                    <MdClear size={14} className='mr-1' /> <span className="hddn_map_txt">Clear Boundary</span>
                </button>)
            }

            {
                event_states.show_message && (<div className='w-full bg-black/50 text-white absolute z-[8] top-0 py-5 px-3 font-normal'>
                    Draw a shape around the region you would like to live in
                </div>)
            }

            {groupedData.length && groupedData.map((prop) => (
                <CustomMarker prop={prop} zoom_level={zoom} />
            ))}

        </GoogleMap>
    ) : <div className='w-full h-full flex justify-center items-center'>
        <AiOutlineLoading3Quarters size={35} className='animate-spin' />
    </div>
}

export default MapContainer;
