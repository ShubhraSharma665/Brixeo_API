import axios from "axios";

const twilio = require("twilio");

class GoogleMapHelper {
  constructor() { }

  // source and destination lat,long
  async calculateTravelTime(source, destination, travelMode?) {
    try {
      const mode = !!travelMode ? travelMode : "driving";
      console.log(mode, "mode");
      const apiKey = "AIzaSyAad0w-9p1zROAeni2JakxvkSfX_YDIkF4"; // Travel Mode  => Choose from 'driving', 'walking', 'transit', 'bicycling'
      const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${source}&destinations=${destination}&mode=${mode}&key=${apiKey}`;
      let response = await axios.get(apiUrl);
      console.log(response, "response");
      const { rows } = response.data;

      console.log(rows, "rows");

      const { duration: Gduration, distance: Gdistance } = rows[0].elements[0];
      console.log(Gduration, "map", Gdistance);

      const duration = {
        text: Gduration.text,
        in_hours: Gduration.value / 3600,
        in_sec: Gduration.value,
      };

      const distance = {
        text: Gdistance.text,
        in_meters: Gdistance.value,
        in_km: Gdistance.value / 1000,
        in_mile: Math.round(((Gdistance.value / 1000) / 1.60934) * 100) / 100
      };

      return { duration, distance };
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async getAddressDetails(lat, long) {
    console.log(lat, long, "hfjdhjhjdgh------------------- latlng")
    try {
      const apiKey = "AIzaSyAad0w-9p1zROAeni2JakxvkSfX_YDIkF4";
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},%${long}&key=AIzaSyAad0w-9p1zROAeni2JakxvkSfX_YDIkF4`;

      let response: any = await axios.get(apiUrl);


      console.log(response?.data, "response?.data");

      const postalCodeObj = response?.data?.results[0]?.address_components.find(component => component.types.includes('postal_code'));
      const postalCode = postalCodeObj ? postalCodeObj.long_name : null;

      const contryObj = response?.data?.results[0]?.address_components.find(component => component.types.includes('country'))// || component.types.includes('political') || component.types.includes('administrative_area_level_2'));
      const country = contryObj ? contryObj.short_name : null;

      return {
        country, postalCode
      };
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default new GoogleMapHelper();


