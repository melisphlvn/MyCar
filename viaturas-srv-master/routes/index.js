var express = require('express');
const {getUserVehicles, saveKm} = require('../data/sap');

var router = express.Router();

// const _carData = [
//   {
//     order: '1234',
//     orderDescription: 'Rent contract 456',
//     companyCode: '002',
//     companyDescription: 'Rent XYZ',
//     plant: 'P101',
//     plantDescription: "Alhandra",
//     costCenter: '123123123',
//     costcenterDescription:"pahali",
//     plateNumber:"5000",
//     vehicleType:"araba",
//     scale:"15km",
//     scaleDescription:"uzun",
//     beginofContract:"monday",
//     endofContract:"wednesday",
//     acquisitionValue:"7bintl",
//     dateFrom:"13.03.2022",
//     dateTo:"24.05.2023"
//   },
//   {
//     order: '1234',
//     orderDescription: 'Rent contract 456',
//     companyCode: '002',
//     companyDescription: 'Rent XYZ',
//     plant: 'P101',
//     plantDescription: "Souselas",
//     costCenter: '123123123',
//     costcenterDescription:"kjdhjhd",
//     plateNumber:"98765",
//     vehicleType:"ortui",
//     scale:"15km",
//     scaleDescription:"uzun",
//     beginofContract:"monday",
//     endofContract:"wednesday",
//     acquisitionValue:"7bintl",
//     dateFrom:"18.04.2022",
//     dateTo:"24.08.2023"
//   }
// ];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(`<h3>Hi there ${req.connection.user}!</h3>`);
});

router.get('/api/whoami', function(req, res, next) {
  res.json(req.connection.user);
});

router.get('/api/get-car-data', async (req, res, next) => {
  const _user = req.connection.user.split('\\');
  const _vs = await getUserVehicles(_user.length > 1 ? _user[1] : '');
  
  // console.log(_user);
  
  if(_vs.error) {
    res.json(_vs);
  } else {
    res.json(_vs);
  }
});

router.post('/api/save-km', async (req, res, next) => {
  const _kms = req.body.kms;
  let _error = false;

  for(km of _kms) {
    const _ret = await saveKm(req.body.order, km.Km, km.Year, km.Month);
    
    // console.log('>>>', _ret);

    if (_ret.error) {
      res.json(_ret);
      _error = true;
      break;
    }
  }

  if(!_error) {
    res.json({
      error: false,
      info: 'Success'
    });
  }
})

module.exports = router;
