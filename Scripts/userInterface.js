/**
 * Enables the information box in the upper right corner
 *
 */
function createInfobox() {
	var output = '<div id="infoBox">  RESTful web services demo</div>';
	
	infoBox = document.createElement('div');
	infoBox.id = "infoBox";
	var header = "<div id=\"header\"><img src=\"images/logo_delta_small.png\"/></div>";
	infoBox.innerHTML = header;	
	
	
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(infoBox);

}


/**
 * Enables the legend box in the lower left corner
 *
 */

function createLegend()	{
	map.controls[google.maps.ControlPosition.LEFT_BOTTOM].pop();
	var legend = document.createElement('legend');
	legend.index = 1;
	map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

	var legendUI = document.createElement('legendContent');
  
	legend.appendChild(legendUI);

  var legendText = document.createElement('legendContent');
  
  var high_lowerBound;
  var medium_lowerBound;
  if(drillLvl == 0){
	  high_lowerBound = high_country_value;
	  medium_lowerBound = medium_country_value;
  } else if(drillLvl == 1){
	  high_lowerBound = high_state_value;
	  medium_lowerBound = medium_state_value;
  }
  var output = "<div id=\"legend\"><div><div style=\"width:20px; height:20px; background-color: #FF6A00; opacity:0.6; position:absolute;\"></div><div style=\"width:100%; height:30px; position:relative;left:25px\" >"+high_lowerBound+"+</div></div><div><div style=\"width:20px; height:20px; background-color: #FFE100; opacity:0.6; position:absolute;\"></div><div style=\"width:100%; height:30px; position:relative;left:25px\" >"+medium_lowerBound+" - "+high_lowerBound+"</div></div><div><div style=\"width:20px; height:20px; background-color: #BAB972; opacity:0.6; position:absolute;\"></div><div style=\"width:100%; height:30px; position:relative;left:25px\" > 1 - "+medium_lowerBound+"</div></div><div><div style=\"width:20px; height:20px; background-color: #000000; opacity:0.6; position:absolute;\"></div><div style=\"width:100%; height:30px; position:relative;left:25px\" >No resorts</div></div></div>";
  legendText.innerHTML = output;
  legendUI.appendChild(legendText);
}

/**
 * Enables navigation breadcrumb in the  upper left corner.
 * This function is called every time a drilldown/drillback function is called: Updates the breadcrumb.
 *
 */

function generateBreadcrumb() {

	map.controls[google.maps.ControlPosition.TOP_LEFT].pop(); // Clear any existing breadcrumbs
	
	var controlDiv = document.createElement('controlDiv');
	controlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv)

  var controlUI = document.createElement('navigation');
  
  controlDiv.appendChild(controlUI);

  var controlText = document.createElement('navigation');
  var output = '<ul id="breadcrumb" style="padding-right:5px;"><li><img src=images/navigator.png \/></a></li>';
  
	if(drillLvl == 0){
		output+= '<li>World</li></ul>';
		} 
	else if(drillLvl == 1) {
		output+= '<li><a onclick="drillBack(); generateBreadcrumb();">World</a></li><li>'+selectedCountryLong+' </li></ul>';
	} else if(drillLvl == 2) {
		output+= '<li><a onclick="drillBack(); drillBack(); generateBreadcrumb();">World</a></li><li><a onclick="drillBack(); generateBreadcrumb();">'+selectedCountryLong+'</a></li><li>'+selectedProvinceLong+' </li></ul>';
	}
  
  controlText.innerHTML = output;
  controlUI.appendChild(controlText);
	
}

function refreshButton(){
	var button = document.createElement('div');
	button.innerHTML = '<button type="submit" onclick="refresh()">Refresh</button>';

	map.controls[google.maps.ControlPosition.LEFT_TOP].push(button);
	
}