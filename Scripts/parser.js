	function parseStateData(array){
		usaData = {};
		canData = {};
		
		for(i=0; i<array.length;i++){
			var tempJSON = $.parseJSON(array[i].attributes.datapath.value);
			var country = tempJSON[0].v;
			var state = tempJSON[1].v;
			var numberResorts = tempJSON[2].v;
			if(country == "Canada"){
				canData[state] = {};
				canData[state].Province = state;
				canData[state].Resorts = numberResorts;
			}
			else{
				usaData[state] = {};
				usaData[state].Province = state;
				usaData[state].Resorts = numberResorts;
			}
			filterStates(state,numberResorts)
		}
		

	}
	
	function parseCountryData(array){
		worldData = {};
		for(i=0; i<array.length;i++){
			var tempJSON = $.parseJSON(rctxArray[i].attributes.datapath.value);
			var countryName = tempJSON[0].v;
			var resorts = tempJSON[1].v;
		
			worldData[countryName] = {};
			worldData[countryName].Country = countryName;
			worldData[countryName].Resorts = resorts;
			
			colourizeCountry(countryName,resorts);
		}
		applyWorldLayer();
		

	}
	
	function parseResorts(array){
		usDetData = {};
		bcData = {};
		
		for(i=0; i<array.length;i++){
			var tempJSON = $.parseJSON(rctxArray[i].attributes.datapath.value);
			var countryName = tempJSON[0].v;
		
			if(countryName == "Canada"){
				bcData[i] = {};
				bcData[i].Latitude = tempJSON[4].v;
				bcData[i].Longitude = tempJSON[5].v;
				bcData[i].Name = tempJSON[2].v;
				bcData[i].Availability = tempJSON[6].v;
			} else{
				usDetData[i] = {};
				usDetData[i].State = tempJSON[1].v;
				usDetData[i].Ski_Resort = tempJSON[2].v;
				usDetData[i].Score = tempJSON[3].v;
				usDetData[i].Availability = tempJSON[6].v;
			}
		}
	}