// OpenWeather API key
var APIKey = "a24e0e9edc3a8c9c8a7f2869fbda5104";

//Define global variable for Local storage
var nameOfCity = "";    //Name of the city
var cityNamehistory = []; //History of city names

//Define main function to fetch and present the data
function cityWeatherForecast(data,nameOfCity) {
    //Today's date (Tuesday, 23 January 2024 format)
    var todaysDate = dayjs().format("(DD/MM/YYYY)");

    //Today's weather stats
    var todaystats = $('#today');
    var todayTitle = $("<h2>").text(nameOfCity +" " +
    todaysDate);
    var iconcode = data.list[0].weather[0].icon;
    var iconURL = "http://openweathermap.org/img/w/" + iconcode + ".png";
    var todayIcon = $("<img>").attr('src',iconURL);
    todayTitle.append(todayIcon);

    //Convert temperature input to Celcius
    var tempC = (data.list[0].main.temp - 273.15).toFixed(2);
    //Weather details
    var todaysTemp = $("<div>").addClass("stats").text("Temp: "+ tempC +" °C");
    var todaysWind = $("<div>").addClass("stats").text("Wind: "+ data.list[0].wind.speed + " KPH");
    var todaysHumidity = $("<div>").addClass("stats").text("Humidity: "+data.list[0].main.humidity + "%");

    //Append the above to the today section
    todaystats.append(todayTitle, todaysTemp, todaysWind, todaysHumidity);

    //Forecast
    $('#forecastHeader').text("5-Day Forecast:");

    for(let i = 1; i < 6; i++) {
        var forecaststats = $('#forecast-cards');
        var cardContainer = $('<div>').addClass("cardContainer col-lg-2 col-md-2 col-sm-12");
        var card = $('<div>').addClass('card bg-info bg-gradient');

        //Every 8 index is the next day, -1 as the last index is 39.
        var dataIndex = (i * 8) - 1;
        //Weather icon
        var iconcodes = data.list[dataIndex].weather[0].icon;
        var iconURLs = "http://openweathermap.org/img/w/" + iconcodes + ".png";
        var todayIcons = $("<img>").attr('src',iconURLs);
        
        //Forecast card details
        var forecastDetails = $('<div>').addClass("card-body");
        var forecastDate = dayjs().add(i, 'day').format("DD/M/YYYY");
        var forecastTitle = $('<h6>').addClass('card-title').text(forecastDate);
        //Convert temperature input to Celcius
        var tempCs = (data.list[dataIndex].main.temp - 273.15).toFixed(2);
        var todaysTemps = $("<div>").addClass("stats").text("Temp: "+ tempCs +" °C");
        var todaysWinds = $("<div>").addClass("stats").text("Wind: "+ data.list[dataIndex].wind.speed + " KPH");
        var todaysHumiditys = $("<div>").addClass("stats").text("Humidity: "+data.list[dataIndex].main.humidity + "%");

        //Appends
        forecastDetails.append(forecastTitle, todaysTemps, todaysWinds, todaysHumiditys);
        card.append(todayIcons, forecastDetails);
        cardContainer.append(card);
        forecaststats.append(cardContainer);
    }
};

//Define function to clear the page
function clearPage() {
    $('#today').empty();
    $('#forecast-cards').empty();
    $('#forecastHeader').empty();
    $('#history').empty();
};

//Define function to keep the data persistent
function persistentData(storedCityHistory) {
    //Refresh inputs
    clearPage();

    var cityName = $(storedCityHistory).last().get(0)
    var lat = "";
    var lon = "";

    // Create button in history section
    $.each(storedCityHistory, function(index, city) {
        var cityHistory = $('<button>').attr('id','city-History-btn').text(city);
        $('#history').append(cityHistory);
    })
   
    //URL for database query to get the lat and lon based on the city name
    var query1URL = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid="+ APIKey;

    //Fetch call to get the lat and lon
    fetch(query1URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            //Assign values to lat and lon
            lat = (data[0].lat).toFixed(2);
            lon = (data[0].lon).toFixed(2);
            console.log(data);
            var nameOfCity = data[0].name;
            console.log(nameOfCity);

        //URL for database query
        var query2URL = "https://api.openweathermap.org/data/2.5/forecast?lat="+ lat +"&lon="+ lon +"&appid=" + APIKey;

        //Fetch weather data using lat and lon from previous fetch
        fetch(query2URL)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                //Apply function to manipulate data and push to HTML
                cityWeatherForecast(data,nameOfCity);
                console.log(data);
            })
        }); 


}

//Retrieve weather data from localStorage if present, otherwise do nothing
$(document).ready(function() {
    storedCityHistory = JSON.parse(localStorage.getItem('city-history'));
    if(storedCityHistory === null) {

    } else {
        persistentData(storedCityHistory);
    }
});

//Event listener triggers weather info to appear for any button pressed
$(document).on("click", 'button', function(event) {
    //Prevent form submission
    event.preventDefault();
    //Refresh inputs
    clearPage();

    //Placeholder for city names and location coordinates
    var buttonId = $(this).attr('id');
    
    //Get item if present in LocalStorage
    
    cityNamehistorys = JSON.parse(localStorage.getItem('city-history'));

    if(cityNamehistorys === null) {
        cityNamehistory = [];
    } else {
        cityNamehistory = cityNamehistorys
    }

    if (buttonId === "search-button") {
        var cityName = $('#search-input').val();
        //Push searches to global search history array if submit button pressed
        cityNamehistory.push(cityName)
    } else {
        var cityName = $(this).text();
    }
    console.log("city name: " + cityName);

    var lat = "";
    var lon = "";

    //Store new inputs to local storage
    localStorage.setItem('city-history',JSON.stringify(cityNamehistory));

    // Create button in history section
    $.each(cityNamehistory, function(index, city) {
        var cityHistory = $('<button>').attr('id','city-History-btn').text(city);
        $('#history').append(cityHistory);
    })
   
    //URL for database query to get the lat and lon based on the city name
    var query1URL = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid="+ APIKey;

    //Fetch call to get the lat and lon
    fetch(query1URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            //Assign values to lat and lon
            lat = (data[0].lat).toFixed(2);
            lon = (data[0].lon).toFixed(2);
            console.log(data);
            var nameOfCity = data[0].name;
            console.log(nameOfCity);

        //URL for database query
        var query2URL = "https://api.openweathermap.org/data/2.5/forecast?lat="+ lat +"&lon="+ lon +"&appid=" + APIKey;

        //Fetch weather data using lat and lon from previous fetch
        fetch(query2URL)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                //Apply function to manipulate data and push to HTML
                cityWeatherForecast(data,nameOfCity);
                console.log(data);
            })
        }); 
});


