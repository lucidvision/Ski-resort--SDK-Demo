var high_country_value = 200;
var medium_country_value = 100;
var high_countries = "''";
var med_countries = "''";
var low_countries = "''";

var high_state_value = 30;
var medium_state_value = 10;
var low_state = "''";
var med_state = "''";
var hi_state = "''";

function colourizeCountry(countryName,value)	{
	if(value >= high_country_value){
		high_countries = high_countries+",'"+countryName+"'";
		}
	else if(value >= medium_country_value && value < high_country_value){
		med_countries = med_countries+",'"+countryName+"'";
		}
	else if(value > 0 && value < medium_country_value){
		low_countries = low_countries+",'"+countryName+"'";
		}		
		
}

function filterStates(stateName, value) {

	if(value >= high_state_value){
		hi_state = hi_state+",'"+stateName+"'";
		}
	else if(value >= medium_state_value && value < high_state_value){
		med_state = med_state+",'"+stateName+"'";
		}
	else if(value > 0 && value < 100){
		low_state = low_state+",'"+stateName+"'";
		}
}

function applyWorldLayer(){
	
	if(provinceLayer != null){
		provinceLayer.setMap(); // Clear the province layer (if drill back)
	}
	
	console.log("Applying world layer");
	map.setZoom(3);
	
	if(worldLayer != null) {worldLayer.setMap();}
	worldLayer = new google.maps.FusionTablesLayer({
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
            fillOpacity: 0.6,
            strokeColor: "FFFFFF",
            strokeWeight: 1
            
          }
        },{
          where: "Cntryname IN ("+high_countries+")",
          polygonOptions: {
            fillColor: "#FF6A00",
            strokeColor: "FFFFFF",
            strokeWeight: 1
          }
        },{
          where: "Cntryname IN ("+med_countries+")",
          polygonOptions: {
            fillColor: "#FFE100",
            strokeColor: "FFFFFF",
            strokeWeight: 1
			}
       },{
          where: "Cntryname IN ("+low_countries+")",
          polygonOptions: {
            fillColor: "#BAB972",
            strokeColor: "FFFFFF",
            strokeWeight: 1
          }
        },{
            where: "Cntryname IN ''",
            polygonOptions: {
                fillColor: "#15FF00",
              strokeColor: "000000",
              strokeWeight: 2
            }
          }]
      });
	worldLayer.setMap(map);
}

function applyStateLayer() {
	console.log("Applying state layer");
	//provinceLayer.setMap();
	if(currentCountry == "Canada"){
		var southwest = new google.maps.LatLng(49.253465,-129.550781);
		var northeast = new google.maps.LatLng(58.054632,-110.170898);
		var bounds = new google.maps.LatLngBounds(southwest, northeast); // Bounds to British Columbia

		map.panToBounds(bounds);
		map.fitBounds(bounds);
		//map.setZoom(12);
		
		console.log("Applying markers to map");

		for(i in bcData){
				placeCAResortMarkers(bcData[i]);
				
		}
		/*
		var mcOptions = {gridSize: 100, maxZoom: 7};
		mc = new MarkerClusterer(map, markers, mcOptions);
		google.maps.event.addListener(mc, 'clusterclick', function(cluster) { }); 
		*/
		
	} else if(currentCountry == "United States"){
		
		/*var southwest = new google.maps.LatLng(42.065607,-117.004395);
		var northeast = new google.maps.LatLng(48.980217,-104.106445);
		var bounds = new google.maps.LatLngBounds(southwest, northeast); // Bounds to Montana
		map.panToBounds(bounds);
		map.fitBounds(bounds);
		*/
		map.panTo(lastLocation);
		map.setZoom(5);
		
		while(markers.length > 0){
			markers.pop().setMap();
		}
		
		console.log("Adding markers");
		for(i in usDetData){
			if(usDetData[i].State == selectedProvinceLong){
				placeUSResortMarkers(usDetData[i]);
			}
		}
		
		
		
	}
}

function applyCountryLayer()	{
	
	worldLayer.setMap(); // Clear the world layer
	
	
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
		
	
	
	console.log("Applying overlays to map");
	provinceLayer = new google.maps.FusionTablesLayer({
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
            fillOpacity: 0.5,
            strokeColor: "FFFFFF",
            strokeWeight: 1
          }
        },{
          where: columnName+" IN ("+hi_state+")",
          polygonOptions: {
            fillColor: "#FF8400",
            strokeColor: "FFFFFF",
            strokeWeight: 1
          }
        },{
          where: columnName+" IN ("+med_state+")",
          polygonOptions: {
            fillColor: "#FFE100",
            strokeColor: "FFFFFF",
            strokeWeight: 1
			}
       },{
          where: columnName+" IN ("+low_state+")",
          polygonOptions: {
            fillColor: "#BAB972",
            strokeColor: "FFFFFF",
            strokeWeight: 1
          }
        },{
            where: columnName+" IN ''",
            polygonOptions: {
            fillColor: "#15FF00",
            //fillOpacity: 0.1
            strokeColor: "#000000",
            	strokeWeight: 2
            }
          }]
      });
	  
	provinceLayer.setMap(map);

}