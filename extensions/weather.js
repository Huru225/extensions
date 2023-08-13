(function(ext) {
  var APPID = '960f7f58abbc5c98030d1899739c1ba8';

  var cacheDuration = 1800000 //ms, 30 minutes
  var cachedTemps = {};

  var units = '摄氏度';

  function getWeatherData(weatherData, type) {
    var val = null;
    switch (type) {
      case '温度':
        val = weatherData.main.temp;
        if (units === '摄氏度')
          val = (val - 32) * (5/9)
        val = Math.round(val);
        break;
      case '天气':
        val = weatherData.weather[0].description;
        break;
      case '湿度':
        val = weatherData.main.humidity;
        break;
      case '风速':
        val = weatherData.wind.speed;
        if (units === '华氏度')
          val *= 2.23694;
        if (Math.round(val) !== val)
          val = val.toFixed(1);
        break;
      case '云量':
        val = weatherData.clouds.all;
        break;
    }
    return(val);
  }

  function fetchWeatherData(location, callback) {

    if (location in cachedTemps &&
        Date.now() - cachedTemps[location].time < cacheDuration) {
      //Weather data is cached
      callback(cachedTemps[location].data);
      return;
    }

    // Make an AJAX call to the Open Weather Maps API
    $.ajax({
      url: 'http://api.openweathermap.org/data/2.5/weather',
      data: {q: location, units: 'imperial', appid: APPID},
      dataType: 'jsonp',
      success: function(weatherData) {
        //Received the weather data. Cache and return the data.
        cachedTemps[location] = {data: weatherData, time: Date.now()};
        callback(weatherData);
      }
    });
  }

  // Cleanup function when the extension is unloaded
  ext._shutdown = function() {};

  // Status reporting code
  // Use this to report missing hardware, plugin or unsupported browser
  ext._getStatus = function() {
    return {status: 2, msg: 'Ready'};
  };

  ext.getWeather = function(type, location, callback) {
    fetchWeatherData(location, function(data) {
      var val = getWeatherData(data, type);
      callback(val);
    });
  };

  ext.whenWeather = function(type, location, op, val) {
    if (!cachedTemps[location]) {
      //Weather data not cached
      //Fetch it and return false for now
      fetchWeatherData(location, function(){});
      return false;
    }
    //Weather data is cached, no risk of blocking
    var data = getWeatherData(cachedTemps[location].data, type);
    switch (op) {
      case '<':
        return (data < val);
      case '=':
        return (data == val);
      case '>':
        return (data > val);
    }
  };

  ext.setUnits = function(format) {
    units = format;
    return;
  };

  ext.getUnits = function() {
    return units;
  };

  // Block and block menu descriptions
  var descriptor = {
    blocks: [
      ['R', '%m.reporterData 的数据在 %s', 'getWeather', '温度', 'Beijing'],
      ['h', '当数据 %m.eventData 对于 %s %m.ops %n', 'whenWeather', '温度', 'Beijing', '>', 80],
      [' ', '设置单位为 %m.units', 'setUnits', '摄氏度'],
      ['r', '温度单位', 'getUnits']
    ],
    menus: {
      reporterData: ['温度', '天气', '湿度', '风速', '云量'],
      eventData: ['温度', '湿度', '风速', '云量'],
      ops: ['>','=', '<'],
      units: ['华氏度', '摄氏度']
    }
  };

  // Register the extension
  ScratchExtensions.register('天气', descriptor, ext);

})({});