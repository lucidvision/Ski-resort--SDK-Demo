var map, marker, geocoder, selectedCountryShort, selectedCountryLong, selectedProvinceShort, selectedProvinceLong, selectedCurrencyObj,worldLayer,provinceLayer, intersectionInfowindow;
var countryAppenders = [];

var drillLvl = 0;
var currentCountry;

var infowindow;
var lastLocation;

var returnBtn;

var ready = false;

var panorama;
var markers = [];
var mc;

var infoBox;

var weatherData;
var weatherOutput;
var weatherBox;

var hotelData;
var hotelOutput;
var hotelBox;

/**
 * Initializes all the Google maps stuff.  Registers a map click listener.
 */
function initializeMaps() {
	console.log("Initializing Google Maps");
    var latlng = new google.maps.LatLng(54.673831,-97.734375); // Set starting location of map
    geocoder = new google.maps.Geocoder();
	
	var styleArray = [ // Disable visual elements on the map such as labels, park names, roads, etc
	  {
		featureType: "water",
		elementType: "labels",
		stylers: [
		  { visibility: "off" }
		]
	  },{
		featureType: "administrative.neighborhood",
		elementType: "labels",
		stylers: [
		  { visibility: "off" }
		]
	  },{
		featureType: "administrative.locality",
		elementType: "labels",
		stylers: [
		  { visibility: "off" }
		]
	  },{
		featureType: "administrative.land_parcel",
		elementType: "labels",
		stylers: [
		  { visibility: "off" }
		]
	  },{
		featureType: "poi.park",
		elementType: "labels",
		stylers: [
		  { visibility: "off" }
		]
	  }
	];
	
    var myOptions = {
        zoom: 3,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
		panControl: false,
		streetViewControl: false,
		mapTypeControl: false,
		scaleControl: false,
		zoomControl: false,
		disableDoubleClickZoom: true,
		styles: styleArray,
		//draggable: false
    };    
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	
	var wundergroundLogo = document.createElement('div');
	wundergroundLogo.innerHTML = "<img src='/images/wundergroundLogo.png'/>";
	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(wundergroundLogo); // Places the Wunderground.com logo in the lower left corner
	
	generateBreadcrumb(); // Creates the breadcrumb in the upper left corner
	createInfobox(); // Creates the information box in the upper right corner
	createLegend(); // Creates the legend in the lower left corner
	refreshButton();
	
    google.maps.event.addListener(map, 'click', function(event) { // Listener for clicks/taps on the map
        findClickLocation(event);
    });
    
    google.maps.event.addListener(map, 'dblclick', function(event) { // Listener for double click/taps on the map, starts a drilldown
       if(drillLvl < 2){
    	   drillDown();
    	} else if(drillLvl == 2){
    		
    	}

    });
	
	
}

function drillDown() {
	drillLvl++;
	
	if(drillLvl == 1){ // If looking at a specific country
		currentCountry = selectedCountryLong;
		applyCountryLayer();
		createLegend();
	} else if(drillLvl == 2){ // If looking at a particular state or province
		applyStateLayer();
		//map.controls[google.maps.ControlPosition.RIGHT_TOP].pop();	
	}
	
	generateBreadcrumb(); // Update the breadcrumb

}

function drillBack() {
	drillLvl--;
	
	if(drillLvl == 1){ // If looking at a specific country
		while(markers.length > 0){
			markers.pop().setMap();
		}
		map.controls[google.maps.ControlPosition.RIGHT_TOP].pop(); // Removes the state/province data
		map.controls[google.maps.ControlPosition.RIGHT_TOP].push(infoBox); // and replaces it with country related data
		map.setZoom(4);
		
	} else if(drillLvl == 0){
		provinceLayer.setMap();
		applyWorldLayer();
		map.setZoom(3);
	}
	createLegend();
	
}

/**
 *	Places resort markers inside British Columbia
 */
function placeCAResortMarkers(node)	{
	 
		var coordinates = new google.maps.LatLng(node.Latitude,node.Longitude);
	    var resortMarker = new google.maps.Marker({map:map, position: coordinates,title:node.Name});
	    if(node.Name == "Whistler Blackcomb (Garibaldi Lift Co.)"){ // Gives the Whistler marker a listener as well as infobox information.
	    	coordinates = new google.maps.LatLng(50.096062,-122.900351);
	    	var panoramaOptions = {
	    			  position: coordinates,
					  visible: false,
	    			  enableCloseButton: true,
	    			  pov: {
	    				heading: -192.38655426539614,
	    				pitch: -1.2105664997650587,
	    				zoom: 1
	    			  }
	    			};
	    	google.maps.event.addListener(resortMarker, 'click', function() { // If Whistler marker is clicked, open up its infobox
		    	panorama = new google.maps.StreetViewPanorama(document.getElementById("map_canvas"),panoramaOptions);
				getWeatherData(resortMarker.getPosition());
				document.getElementById("header").innerHTML = resortMarker.getTitle();
				createStreetViewImg();	
	    	});
	    } else {
		    google.maps.event.addListener(resortMarker, 'click', function() { // Else if marker is not Whistler, show the title of the resort in the upper right corner
		    	map.panTo(resortMarker.getPosition());
				getWeatherData(resortMarker.getPosition());
		    	document.getElementById("header").innerHTML = resortMarker.getTitle();
		    });
	    }
	    
	    markers.push(resortMarker);
}

/**
 *	Creates a div that contains the thumbnail of Whistler Blackomb street view and appends it to the infobox
 */
function createStreetViewImg() {
				var streetView = document.createElement('img');
				streetView.src = "/images/streetview.png";
				streetView.style.cssText = "border:solid 2px #000000;padding:1px;display: block;margin-left: auto;margin-right: auto"
				streetView.setAttribute("onclick","panorama.setVisible(true)");
				infoBox.appendChild(streetView);
}

/**
 *	Places resort markers inside the selected US state
 */
function placeUSResortMarkers(node) {
	geocoder.geocode( { 'address': node.Ski_Resort}, function(results, status){
		if (status == google.maps.GeocoderStatus.OK) {
			var output = "<b>"+node.Ski_Resort+"<br>(Rating "+node.Score+"%)</b><br><br>";
			
			// Colour codes for markers
			var hexColor;
			if(node.Availability == 0)
				hexColor = 'FF0000';
			else if(node.Availability < 7)
				hexColor = 'FFFF00';
			else (hexColor = '33FF00');
			
			var resortMarker = new google.maps.Marker({map: map, position: results[0].geometry.location, title: output,icon:'http://chart.apis.google.com/chart?chst=d_map_pin_letter_withshadow&chld='+node.Availability+'|'+hexColor+'|000000'});
			markers.push(resortMarker);
			
	    	google.maps.event.addListener(resortMarker, 'click', function() {
				$('#infoBox').animate({height:"50px"});
	    		document.getElementById("header").innerHTML = resortMarker.getTitle();
				getWeatherData(resortMarker.getPosition());	    
				getNearbyLodging(resortMarker.getPosition());
	    		
				$('#infoBox').css("border-bottom-right-radius","15px"); // Give the infoBox rounded corners
				$('#infoBox').css("border-bottom-left-radius","15px");
				$('#infoBox').animate({height:"340px"});
	    	});
	    	
		}else{if(status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT){ // Google has an upper limit to query requests per second
			console.log(status);
			setTimeout(function(){placeUSResortMarkers(node)},200); // Wait 200ms and retry
			}
		}
	});
}


/**
 *	Sends an AJAX request to Wunderground.com for a four day weather forecast and stores the data inside a <div> element
 */
function getWeatherData(coordinates)	{
	if(weatherBox != null){ // If hotelBox currentl has data in it
		weatherBox.parentNode.removeChild(weatherBox); // Clear the data by removing the <div> element
	}

	var url = 'http://api.wunderground.com/api/761eeda3c8bed63d/geolookup/forecast/q/'+coordinates.lat()+','+coordinates.lng()+'.json';
	console.log("Retrieve weather data from:"+url);
	$.ajax({url: url,
				async:false, type:'get',crossDomain:true, 
				dataType:'jsonp', 
				success:function(data){
					weatherData = data['forecast'];
					weatherBox = document.createElement("div");
					weatherBox.id = "weatherBox";
					
					// Sets up the next four day forecast in individual divs
					var dayOne = document.createElement('div');
					dayOne.innerHTML = "<div style=\"width:24%;font:13px Calibri;margin-left:7px;float:left;\"><b>"+weatherData['simpleforecast']['forecastday'][0].date.weekday+"</b><br><img style=\"border:solid 1px #cacaca;width:22px;height:22px;margin-top:5px;margin-right:9px;vertical-align:-7px\" src='"+weatherData['simpleforecast']['forecastday'][0].icon_url+"'/>"+weatherData['simpleforecast']['forecastday'][0].low.celsius+"&#176;C</img><div style=\"position:relative;\">"+weatherData['simpleforecast']['forecastday'][0].conditions+"</div></div>";
					dayOne.id = "dayOne";
					
					var dayTwo = document.createElement('div');
					dayTwo.id = "dayTwo";
					dayTwo.innerHTML = "<div style=\"width:24%;padding-left:3px;background-image:url('/images/tickDownMed.png');background-repeat:no-repeat;font:13px Calibri;float:left;\"><b>"+weatherData['simpleforecast']['forecastday'][1].date.weekday+"</b><br><img style=\"border:solid 1px #cacaca;width:22px;height:22px;margin-top:5px;margin-right:9px;vertical-align:-7px\" src='"+weatherData['simpleforecast']['forecastday'][0].icon_url+"'>"+weatherData['simpleforecast']['forecastday'][1].low.celsius+"&#176;C<div style=\"position:relative\">"+weatherData['simpleforecast']['forecastday'][1].conditions+"</div></div>";
					
					var dayThree = document.createElement('div');
					dayThree.id = "dayThree";
					dayThree.innerHTML = "<div style=\"width:24%;padding-left:3px;background-image:url('/images/tickDownMed.png');background-repeat:no-repeat;font:13px Calibri;float:left;\"><b>"+weatherData['simpleforecast']['forecastday'][2].date.weekday+"</b><br><img style=\"border:solid 1px #cacaca;width:22px;height:22px;margin-top:5px;margin-right:9px;vertical-align:-7px\" src='"+weatherData['simpleforecast']['forecastday'][0].icon_url+"'/>"+weatherData['simpleforecast']['forecastday'][2].low.celsius+"&#176;C<div style=\"position:relative\">"+weatherData['simpleforecast']['forecastday'][2].conditions+"</div></div>";
					
					var dayFour = document.createElement('div');
					dayFour.id = "dayFour";
					dayFour.innerHTML = "<div style=\"width:24%;padding-left:3px;background-image:url('/images/tickDownMed.png');background-repeat:no-repeat;font:13px Calibri;float:left;\"><b>"+weatherData['simpleforecast']['forecastday'][3].date.weekday+"</b><br><img style=\"border:solid 1px #cacaca;width:22px;height:22px;margin-top:5px;margin-right:9px;vertical-align:-7px\" src='"+weatherData['simpleforecast']['forecastday'][0].icon_url+"'>"+weatherData['simpleforecast']['forecastday'][3].low.celsius+"&#176;C<div style=\"position:relative\">"+weatherData['simpleforecast']['forecastday'][3].conditions+"</div></div>";

					weatherBox.appendChild(dayOne);
					weatherBox.appendChild(dayTwo);
					weatherBox.appendChild(dayThree);
					weatherBox.appendChild(dayFour);
					
					weatherBox.style.height = "80px";
					weatherBox.style.borderBottom = "solid 1px #cacaca";
					document.getElementById("infoBox").appendChild(weatherBox);
					
					//$("#infoBox").animate({height:Number($("#infoBox").height() + weatherBox.style.height)});
					},
				error:function(xhr,textStatus,errorThrown){	console.log(textStatus);}
				
			});		
}


/**
 *	Sends an AJAX request to Yahoo for hotel information and stores the data inside a <div> element.
 */
function getNearbyLodging(coordinates) {
	if(hotelBox != null){ // If hotelBox currentl has data in it from previous lookup
		hotelBox.parentNode.removeChild(hotelBox); // then clear the data by removing the <div> element
	}
	var url = 'http://local.yahooapis.com/LocalSearchService/V3/localSearch?appid=YahooDemo&query=hotel&latitude='+coordinates.lat()+'&longitude='+coordinates.lng()+'&=results=3&output=json&callback=?';
	console.log("Retrieve lodging data from:"+url);
	$.ajax({url: url,
				async:false, type:'get',crossDomain:true, 
				dataType:'json', 
				success:function(data){
				
				hotelData = data.ResultSet;
				hotelBox = document.createElement("div");
				hotelBox.id = "hotelBox";
				
				var tableContainer = document.createElement('table');
					tableContainer.style.cssText = "width:100%;border:1px; border-collapse:collapse";
					
				var headerRow = document.createElement('tr');
					headerRow.style.cssText = "height:30px;background-image:url('/images/bc_bg.png')";
					
						var ratingCell = document.createElement('td');
						ratingCell.style.cssText = "text-align:center;border:solid 1px #cacaca";
						ratingCell.innerHTML = "Rating";
						
						var hotelCell = document.createElement('td');
						hotelCell.style.cssText = "text-align:center;width:200px;border:solid 1px #cacaca";
						hotelCell.innerHTML = "Hotel name";
						
						var distanceCell = document.createElement('td');
						distanceCell.style.cssText = "text-align:center;border:solid 1px #cacaca";
						distanceCell.innerHTML = "Distance";
				
				tableContainer.appendChild(headerRow);
					headerRow.appendChild(ratingCell);
					headerRow.appendChild(hotelCell);
					headerRow.appendChild(distanceCell);
					
					if(hotelData.totalResultsAvailable >= 5){
					 var limit = 5;
					} else { limit = hotelData.totalResultsAvailable;}
					
					for(i=0;i<limit;i++){
						var newRow = document.createElement('tr');
							newRow.style.cssText = "height:30px";
						
							var newRank = document.createElement('td');
								newRank.innerHTML = String(parseRating(hotelData.Result[i].Rating.AverageRating));
								newRank.style.cssText = "text-align:center;border:solid 1px #cacaca";
								
							var newHotel = document.createElement('td');
								newHotel.innerHTML = String(hotelData.Result[i].Title);
								newHotel.style.cssText = "width:200px;border:solid 1px #cacaca;background-image:url('images/bc_separator2.png');background-repeat:no-repeat;background-position:right;";
								if(hotelData.Result[i].BusinessClickUrl){
									newHotel.setAttribute("onclick","window.open('"+hotelData.Result[i].BusinessClickUrl+"')");}
								
							var newDistance = document.createElement('td');
								newDistance.innerHTML = hotelData.Result[i].Distance+"km";
								newDistance.style.cssText = "text-align:center;border:solid 1px #cacaca";
							
						newRow.appendChild(newRank);
						newRow.appendChild(newHotel);
						newRow.appendChild(newDistance);
						
						tableContainer.appendChild(newRow);
					}
				
				
					hotelBox.appendChild(tableContainer);
					document.getElementById("infoBox").appendChild(hotelBox);
					//$("#infoBox").animate({height:Number($("#infoBox").height() + $("#hotelBox").height())});
					},
				error:function(xhr,textStatus,errorThrown){
					console.log("Error getting lodging data: "+(textStatus));}
				
			});	
}

function parseRating(data) {
	if(data == "NaN"){
		return "-";
	} else return data;
}

/**
 * Does a reverse geocode lookup on Google's service to find the country for a given lat/long.
 */
function codeAddress(latlng) {

	lastLocation = latlng; // Store the latest queried coordinates
	
    geocoder.geocode( {'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {        
            var r = results[5].address_components;
            for (componentIndex in r) {
                var ac = r[componentIndex];
                for (typeIndex in ac.types) {
                    var type = ac.types[typeIndex];
                    //console.log(ac);
                    if (type == "country") {
                        selectedCountryShort = ac.short_name;
                        selectedCountryLong = ac.long_name;
                        break;                        
                    } else if(type = "administrative_area_level_1"){ // administrative_area_level_1 indicates a first-order civil entity below the country level. Within the United States, these administrative levels are states. Not all nations exhibit these administrative levels
                        selectedProvinceShort = ac.short_name;
                        selectedProvinceLong = ac.long_name;
						break;
						}
                }
                ready = true;
            }        
        } else {
            //alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

/**
 * Uses globals: marker, map.
 */
function findClickLocation(evt) {

    var location = evt.latLng;        
    if (marker != null) { // If a marker exists on the map then remove it
        marker.setMap(null);
    }

	lastLocation = location; // Store the latest queried coordinates

    geocoder.geocode( {'latLng': location}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var r = results[1].address_components;

            for (componentIndex in r) {
                var ac = r[componentIndex];
                for (typeIndex in ac.types) {
                    var type = ac.types[typeIndex];
                    if (type == "country") {
                        selectedCountryShort = ac.short_name;
                        selectedCountryLong = ac.long_name;
                        break;                        
                    } else if(type = "administrative_area_level_1"){ // administrative_area_level_1 indicates a first-order civil entity below the country level. Within the United States, these administrative levels are states. Not all nations exhibit these administrative levels
                        selectedProvinceShort = ac.short_name;
                        selectedProvinceLong = ac.long_name;
						break;
						}
                }
                ready = true;
            }
        	if(drillLvl == 0 || (drillLvl > 0 && currentCountry == selectedCountryLong)) {    		
        		displayInfoView();
        		
        	} else if(drillLvl > 0 && currentCountry != selectedCountryLong) {
        		drillBack();
        		}
        } else {
            console.log("Geocode was not successful for the following reason: " + status);
        }
    });
	

    
}

function displayInfoView(country){
	var contents;

	if(drillLvl == 1){
		document.getElementById("header").innerHTML = displayStateData(selectedProvinceLong);
			if(currentCountry == "United States"){
				provinceLayer.styles[4].where = "name IN '"+selectedProvinceLong+"'";
			} else if(currentCountry == "Canada"){
				provinceLayer.styles[4].where = "Province IN '"+selectedProvinceLong+"'";
			}
		provinceLayer.setMap(map);
	} else if(drillLvl == 0){ 	
				document.getElementById("header").innerHTML = displayCountryData(selectedCountryLong);
				worldLayer.styles[4].where = "Cntryname IN '"+selectedCountryLong+"'";
				worldLayer.setMap(map);}
}

function displayStateData(province) {
	var dataSrc;
		
	if 		(currentCountry == 'Canada')	   {dataSrc = canData;}
	else if (currentCountry == 'United States'){dataSrc = usaData;}
		
	if (province != null && dataSrc != null && dataSrc[province] != null) {
		output = '<b>'+province+'</b> has <b>'+Number(dataSrc[province].Resorts).toFixed(0)+'</b> resorts';
				
		return output;
	}
}

function displayCountryData(country) {
        	var numberOfResorts = 0
        	var plural = "s";
        	if(worldData[country] != null){
        		numberOfResorts = Number(worldData[country].Resorts).toFixed(0);
        		if(numberOfResorts == 1){ // If only one resort change the wording to singular
            		var plural = "";
            	}
        	}
        	
			output = '<b>'+country+'</b> has <b>'+numberOfResorts+'</b> resort'+plural; // Wrap number of resorts with HTML code in the upper right corner
				
            return output;
}
function KeyOn(propName, list) {
    var map = {};
    for (var item in list) {
        map[list[item][propName]] = list[item];
		if(propName == "Country"){
			colourizeCountry(list[item].Country,list[item].Resorts);
		} else if(propName == "Province"){
			filterStates(list[item].Province,Number(list[item].Resorts));
		} else if(propName == "State"){
			filterStates(list[item].State,Number(list[item].Resorts));
		}
	}
    return map;
}

function PushArray(dest, source) {
    for (i = 0; i < source.length; i++) {
        dest.push(source[i]);
    }
    return dest.length;
}
