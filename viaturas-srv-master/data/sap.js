const soap = require('soap');
const {evolve} = require('ramda');

const SAP_CAR_DATA_WSDL = 'http://ptlxs4finq01.cimpor.root:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zzxx_vehicles_mng/100/zzxx_vehicle_mng/zzxx_vehicle_mng?sap-client=100'
const SAP_RFC_USER = 'RFC_SIPET';
const SAP_RFC_PASS = 'Cimpor.2013';

const _mkSoapClient =  async (url, rfcUser, rfcPass) => {
  const _client = await soap.createClientAsync(url);
  _client.setSecurity(new soap.BasicAuthSecurity(rfcUser, rfcPass));
  return _client;
}

const _isValidYearMonth = (year, month) => {
  const _now = new Date();
  const _year = _now.getFullYear();
  const _month = _now.getMonth();

  return year * 100 + month <= _year * 100 + _month;
}

module.exports = {
  async getUserVehicles(user) {
    try {
      const _client = await _mkSoapClient(SAP_CAR_DATA_WSDL, SAP_RFC_USER, SAP_RFC_PASS);
      const _ret = await _client.ZzxxUserVehiclesAsync({IUser: user});
      let _vehicles = _ret[0].Vehicles === null ? [] : _ret[0].Vehicles.item;
      _vehicles.forEach(v => {
        v.Costs = v.Costs === null ? [] : v.Costs.item;
        v.Km = v.Km === null ? [] : v.Km.item.map(k => evolve({ Month: m => parseInt(m), Year: y => parseInt(y) }, k));
      });

      return {
        error: false,
        vehicles: _vehicles
      }
    } catch (err) {
      return {
        error: true,
        info: err
      };
    }
  },
  async saveKm (order, km, year, month) {
    try {
      if(_isValidYearMonth(year, month)) {
        const _client = await _mkSoapClient(SAP_CAR_DATA_WSDL, SAP_RFC_USER, SAP_RFC_PASS);
        const _ret = await _client.ZzxxKmSaveAsync({
          IAufnr: order,
          IKm: km,
          IMonth: month,
          IYear: year
        }, { forever: true });

        console.log(_ret[0]);

        return {
          error: _ret[0].Success.trim().length === 0,
          info: 'Success'
        }
      } else {
        return {
          error: true,
          info: 'Invalid year/month.'
        }
      }
    } catch (err) {
      return {
        error: true,
        info: JSON.stringify(err)
      }
    }
  }
}
