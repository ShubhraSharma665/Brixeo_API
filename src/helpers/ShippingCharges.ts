const axios = require('axios');
const qs = require('qs');

const COOKIE = 'ak_bmsc=E1BFD02A8809DF3F1A94B5842652C55F~000000000000000000000000000000~YAAQtXUsMXjsdoiMAQAARc8XtBYm913yRNxuRdlUWNkallmq9kMSdZDs/Ky0UyP8ZSG8Z5qgVi8ugLaFexmJDutI8hdKPMZjBdoUAOkmIKPLCZSz4bzGcoBKgrGwzl1Bv1/sMSXt8fj8ML4ZrGuABd4CnNwOXdXXvzRuXpbxvBRH5Fvvayjja2gX+CKP3HxMGzYOc8TlpZbTZPGD5Y+Ki5MQHHnidvBxUrMpr2naQFxVpi60MPQar0tQRFOS+lCSAQO25WwQgGSrfNF6++Zv6t1jz3+KbM7Ad0XLDuWuZ23JDCz0Sea4wzSNRB6duwItezyb/vlk38FEnOVwSqqGc3D0Q+SB4wniHjSaSYI3gAvedAwGfOkV4kNur5Y=; bm_sv=9EFCA7EA256AA600DD8CB52C2CA42CC4~YAAQLf3UFws69FqMAQAAqgAstBYsrs+O/NEx65b+2IfzWXk9keAm+6RJqoocQo2kTlMSCO3hmgy/5aJuSExQbCHS8ERfRKmws0AHqlDz3HwrnYaGE+g0frXDtt620lTUO4LwGrQ/UbT+Xr/pRPJFAQsC1ROYqU9/MplQPNkUR/Z4wW7mGrZm+IlnT4VaVVMtR8d2spP4gOFx6A3o9uAKKzjkPGwa2avELFUVeTkDTaZv+kz0KynxROJxqh5SPJE=~1'

class ShippingCharges {
  constructor() {

  }

  static async getFedexToken() {
    try {
      const data = qs.stringify({
        'grant_type': 'client_credentials',
        'client_id': 'l74a586d6031064bb9a7b40f1538479b50',
        'client_secret': 'df2f8722a3e5468f940b149faa4f1882'
      });

      console.log(data, "------ data");

      const config = {
        url: 'https://apis-sandbox.fedex.com/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // 'Cookie': COOKIE
        }
      };

      console.log(config, "----- config");

      const response = await axios.post(config.url, data, config);
      console.log(JSON.stringify(response.data));
      return response.data.access_token;
    } catch (error) {
      console.error(error);
      return null; // Or handle the error in an appropriate way
    }
  }

  static async getShippingCharges() {
    try {
      const data = {
        accountNumber: {
          value: '740561073'
        },
        requestedShipment: {
          shipper: {
            address: {
              postalCode: '90660',
              countryCode: 'US'
            }
          },
          recipient: {
            address: {
              postalCode: '10007',
              countryCode: 'US',
              residential: 'true'
            }
          },
          serviceType: 'GROUND_HOME_DELIVERY',
          pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
          rateRequestType: ['ACCOUNT'],
          requestedPackageLineItems: [
            {
              weight: {
                units: 'LB',
                value: '40'
              }
            }
          ]
        }
      };

      const token = await this.getFedexToken()

      console.log(JSON.stringify(data), "------ data");

      const config = {
        url: 'https://apis-sandbox.fedex.com/rate/v1/rates/quotes',
        headers: {
          'X-locale': 'en_US',
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
          // 'Cookie': COOKIE
        }
      };

      console.log(JSON.stringify(config), "----- config");

      const response = await axios.post(config.url, data, { headers: config.headers });
      console.log(JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Error:', error.message);
      console.error('Error response data:', error.response ? error.response.data : 'N/A');
      return null;
    }
  }
}

export default ShippingCharges;