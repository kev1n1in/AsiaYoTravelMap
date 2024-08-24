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
        resolve(results);
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
