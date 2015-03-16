/* Jason's common mashup code.
 *
 * Most of this code is related to maps, country and currency information.
 *
 * April 10, 2011
 */
 
var map, marker, geocoder, selectedCountryShort, selectedCountryLong, selectedProvinceShort, selectedProvinceLong, selectedCurrencyObj,layer, intersectionInfowindow;
var countryAppenders = [];


var high_countries = "''";
var med_countries = "''";
var low_countries = "''";

var low_state = "''";
var med_state = "''";
var hi_state = "''";

var drillLvl = 0;
var currentCountry;

var infowindow;
var lastLocation;

var returnBtn;

var ready = false;

/**
 * Initializes UI elements for easy access in Javascripts and registers some event handlers.
 */

function colourizeCountry(countryName,value)	{
	if(value >= 100000){
		high_countries = high_countries+",'"+countryName+"'";
		}
	else if(value >= 10000 && value < 100000){
		med_countries = med_countries+",'"+countryName+"'";
		}
	else{
		low_countries = low_countries+",'"+countryName+"'";
		}		
		
}

function filterStates(stateName, value) {

	if(value >= 3000){
		hi_state = hi_state+",'"+stateName+"'";
		}
	else if(value >= 1000 && value < 3000){
		med_state = med_state+",'"+stateName+"'";
		}
	else{
		low_state = low_state+",'"+stateName+"'";
		}
} 

/**
 * Initializes all the Google maps stuff.  Registers a map click listener.
 *
 * Uses globals: geocoder, map, map_canvas (div tag).
 */
function initializeMaps() {
	console.log("Initializing Google Maps");
    var latlng = new google.maps.LatLng(54.673831,-97.734375);
    geocoder = new google.maps.Geocoder();
    var myOptions = {
        zoom: 3,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
		panControl: false,
		streetViewControl: false,
		mapTypeControl: false,
		//scaleControl: false,
		//zoomControl: false
		//disableDoubleClickZoom: true,
		//draggable: false
    };    
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	
	generateBreadcrumb();
	
	//returnBtn = document.createElement('returnButton');
	//returnBtn.innerHTML = "<img src='images/back.png'/ onclick=\"drillBack()\">";

    google.maps.event.addListener(map, 'click', function(event) {
        findClickLocation(event);
    });
}


function generateBreadcrumb() {

	map.controls[google.maps.ControlPosition.TOP_LEFT].pop(); // Clear any existing breadcrumbs
	
	var controlDiv = document.createElement('controlDiv');
	controlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv)

  var controlUI = document.createElement('navigation');
  
  controlDiv.appendChild(controlUI);

  var controlText = document.createElement('navigation');
  var output = '<ul id="breadcrumb"><li><img src=/images/navigator.png \/></a></li>';
  
	if(drillLvl == 0){
		output+= '<li>World</li></ul>';
		} 
	else if(drillLvl == 1) {
		output+= '<li><a href="#" onclick="drillBack(); generateBreadcrumb();"title="Sample page 1">World</a></li><li>'+selectedCountryLong+'</li></ul>';
	} else if(drillLvl == 2) {
		output+= '<li><a href="#" onclick="drillBack(); drillBack(); generateBreadcrumb();" title="Sample page 1">'+selectedCountryLong+'</a></li><li><a href="#" title="Sample page 2">'+selectedProvinceLong+'</a></li><li>Winnipeg</li></ul>';
	}
  
  //output = output + '<li><a href="#" title="Sample page 1">Sample page 1</a></li><li><a href="#" title="Sample page 2">Sample page 2</a></li><li>Current page</li></ul>';
  //controlText.innerHTML = '<ul id="breadcrumb"><li><a href="#" title="Home"><img src="images/globe.png" alt="Home" class="home" /></a></li><li><a href="#" title="Sample page 1">Sample page 1</a></li><li><a href="#" title="Sample page 2">Sample page 2</a></li><li>Current page</li></ul>';
  controlText.innerHTML = output;
  controlUI.appendChild(controlText);

  google.maps.event.addDomListener(controlUI, 'click', function() {
      //controlText.innerHTML = "World > Canada > Manitoba > Winnipeg";
  });
}

function applyLayer(){	
	console.log("Applying world layer");
	map.setZoom(3);
	
	if(layer != null) {layer.setMap();}
	layer = new google.maps.FusionTablesLayer({
        query: {
          select: 'geometry',
          from: '1341386',
        },
		suppressInfoWindows: true,
		clickable: false,
		map: map,
        styles: [{
          polygonOptions: {
            fillColor: "#000000",
            fillOpacity: 0.3,
            
          }
        },{
          where: "Cntryname IN ("+high_countries+")",
          polygonOptions: {
            fillColor: "#FF0000"
          }
        },{
          where: "Cntryname IN ("+med_countries+")",
          polygonOptions: {
            fillColor: "#FFDD00"
			}
       },{
          where: "Cntryname IN ("+low_countries+")",
          polygonOptions: {
            fillColor: "#00FF00"
          }
        },{
            where: "Cntryname IN ''",
            polygonOptions: {
              fillColor: "#FF00E1",
              strokeColor: "FF0000"
            }
          }]
      });
      layer.setMap(map);
}

function drillDown() {
	drillLvl++;
	
	if(drillLvl == 1){
		currentCountry = selectedCountryLong;
		applyCountryLayer();
	}
	if(drillLvl == 2){
		applyStateLayer();
	}
	
	infowindow.close(); // Remove the marker from the map
	marker.setMap();
	
	generateBreadcrumb();

}

function drillBack() {
	
	if(drillLvl == 2){					// Clear the intersection markers in Winnipeg
		while(markers.length > 0){
			markers.pop().setMap();
		}
	}

	drillLvl--;
	
	if(drillLvl == 1){
		applyCountryLayer();
	} 
	else if(drillLvl == 0){
		applyLayer();
	}
	
}

var panorama;
var markers = [];

function placeStreetMarkers(intersection) {

    geocoder.geocode( { 'address': intersection.Street_Name}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        //map.setCenter(results[0].geometry.location);
		
		intersectionInfowindow = new google.maps.InfoWindow();
		
        var intersectionMarker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
        });
		
		markers.push(intersectionMarker);
		
		var panoramaOptions = {
		  position: results[0].geometry.location,
		  enableCloseButton: true,
		  pov: {
			heading: 34,
			pitch: 10,
			zoom: 1
		  }
		};
		
		google.maps.event.addListener(intersectionMarker, 'click', function() {
			panorama = new google.maps.StreetViewPanorama(document.getElementById("map_canvas"),panoramaOptions);
				panorama.setPov({
				heading: 270,
				pitch: 0,
				zoom: 1
			});
			
			panorama.setVisible(true);
			
			/*intersectionInfowindow.setContent(	"<b>"+intersection.Street_Name+
									"</b><br>"+"Road accidents: "+intersection.of_crashes+
									'<img src="images/drilldown.png" style="vertical-align:bottom;" onClick="alert()"/>');
									*/
			intersectionInfowindow.open(map,intersectionMarker);
		});
      }
    });
}

function applyStateLayer() {

	layer.setMap();
	map.panTo(new google.maps.LatLng(49.895519,-97.145233));
	map.setZoom(12);
	
	console.log("Applying markers to map");

	for (i=0;i<=9;i++){
		placeStreetMarkers(winData[i]);
	}
		
	
}


function applyCountryLayer()	{
	var database;
	var columnName;
	
	if(selectedCountryShort == 'CA'){
		console.log("Using Canadian overlay database");
		database = '1083794';
		columnName = 'Province';
		map.setCenter(new google.maps.LatLng(60.877,-96.03125));
		map.setZoom(4);
	}
	
	if(selectedCountryShort == 'US'){
		console.log("Using USA overlay database");
		database = '2603691';
		columnName = 'name';
		var southwest = new google.maps.LatLng(29.382175,-122.871094);
		var northeast = new google.maps.LatLng(48.980217,-68.291016);
		var bounds = new google.maps.LatLngBounds(southwest, northeast);
		
		map.panToBounds(bounds);
		map.fitBounds(bounds);
		//map.setZoom(4);
	}
		
	layer.setMap();
	
	console.log("Applying overlays to map");
	layer = new google.maps.FusionTablesLayer({
        query: {
          select: 'geometry',
          from: database
        },
		suppressInfoWindows: true,
		clickable: false,
		map: map,
        styles: [{
          polygonOptions: {
            fillColor: "#000000",
            fillOpacity: 0.3
          }
        },{
          where: columnName+" IN ("+hi_state+")",
          polygonOptions: {
            fillColor: "#FF0000"
          }
        },{
          where: columnName+" IN ("+med_state+")",
          polygonOptions: {
            fillColor: "#FFDD00"
			}
       },{
          where: columnName+" IN ("+low_state+")",
          polygonOptions: {
            fillColor: "#00FF00"
          }
        }]
      });
	  
      layer.setMap(map);

}

/**
 * Does a reverse geocode lookup on Google's service to find the country for a given lat/long.  When
 * the country is found, looks-up currency information for that country. Indirectly causes
 * a UI update by calling GetCurrencyData().
 * 
 * Uses globals: selectedCountryShort, selectedCountryLong, selectedCountryInEU
 */
function codeAddress(latlng) {

	lastLocation = latlng; // Store the latest queried coordinates
	
    geocoder.geocode( {'latLng': latlng}, function(results, status) {
    	console.log(status);
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
                        console.log('selectedCountryShort:'+selectedCountryShort);
                        console.log('selectedCountryLong:'+selectedCountryLong);
                        break;                        
                    } else if(type = "administrative_area_level_1"){ // administrative_area_level_1 indicates a first-order civil entity below the country level. Within the United States, these administrative levels are states. Not all nations exhibit these administrative levels
                        selectedProvinceShort = ac.short_name;
                        selectedProvinceLong = ac.long_name;
                        console.log('selectedProvinceShort:'+selectedProvinceShort);
                        console.log('selectedProvinceLong:'+selectedProvinceLong);
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
        	if(drillLvl == 0 || (drillLvl > 0 && currentCountry == selectedCountryLong)) {	 // If statement to prevent markers from being placed outside of country
        		marker = new google.maps.Marker({
        			position: location, 
        			map: map
        		});
        		
        		displayInfoView();
        		
        	} else if(drillLvl > 0 && currentCountry != selectedCountryLong) {
        		drillBack();
        		}
        } else {
            //alert("Geocode was not successful for the following reason: " + status);
        }
    });
	

    
}

function displayInfoView(country){
	var contents;

	if(drillLvl > 0){
		contents = DisplayCanadaData(selectedProvinceLong);
	} else { contents = DisplayWBData(selectedCountryLong); }

	infowindow = new google.maps.InfoWindow({
		content: contents
		});
	infowindow.open(map,marker);
}

function KeyOn(propName, list) {
    var map = {};
    for (var item in list) {
        map[list[item][propName]] = list[item];
		if(propName == "Country"){
			colourizeCountry(list[item].Country,list[item].Accidents);
		} else if(propName == "State"){
			filterStates(list[item].State,list[item].Collisions);
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