export const fetchPlaces = (mapInstance, center) => {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(mapInstance);
    const request = {
      location: center,
      radius: "5000",
      type: ["tourist_attraction"],
      language: "zh-TW",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const processedResults = results.map((place) => {
          const isOpenNow = place.opening_hours?.isOpen
            ? place.opening_hours.isOpen()
            : null;
          return { ...place, isOpenNow };
        });
        resolve(processedResults);
      } else {
        reject(status);
      }
    });
  });
};

export const fetchPlaceDetails = (map, placeId) => {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(map);
    service.getDetails({ placeId, language: "zh-TW" }, (result, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve(result);
      } else {
        reject(status);
      }
    });
  });
};

export const initializeStreetView = (mapElement, placeDetails) => {
  try {
    if (
      placeDetails &&
      placeDetails.geometry &&
      placeDetails.geometry.location
    ) {
      new window.google.maps.StreetViewPanorama(mapElement, {
        position: {
          lat: placeDetails.geometry.location.lat(),
          lng: placeDetails.geometry.location.lng(),
        },
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
      });
    }
  } catch (error) {
    console.error("Failed to initialize Street View:", error);
  }
};
