	function exportReport(docId,reportId,type,refresh){
			console.log("Exporting");
			$("#map_canvas").mask("Loading...");
			var x = docId;
			var y = reportId;
			var t = type;
			
			
			
			ajaxRequest = $.ajax({url: server + '/biprws/raylight/v1/documents/'+x+'/reports/'+y+'/export/', type: 'get',
			complete: function(xhr) {
					response = $.parseXML(xhr.responseText);
					$rctxArray = $(response);
					rctxArray = $rctxArray.find("rctx");
					
					if(reportId == 2){
						parseCountryData(rctxArray);
					} else if(reportId == 3){
						parseStateData(rctxArray)
					} else if(reportId == 1){
						parseResorts(rctxArray);
						if(refresh)
							applyStateLayer();
						console.log("Done parsing");
						$("#map_canvas").unmask();
					}

				 },
				 beforeSend: function(xhr) { 
						if(t = "xml"){
							xhr.setRequestHeader('Accept', 'text/xml');
						}else{
							xhr.setRequestHeader('Accept', 'text/html');
						}
						xhr.setRequestHeader('X-SAP-LogonToken', logonToken);
						}
		});
	}
	
	function logout(){
			console.log("Logging out");
			$.ajax({url: server + '/biprws/logoff', type: 'POST', contentType: 'application/xml',
				dataType: 'xml',
				complete: function(xhr, status){
					
				},
				error: 		function(xhr, textStatus, errorThrown){ 	
					console.log("Error sending logout");	
				},
					
				success: 	function(xhr, textStatus, errorThrown){ 	
					console.log("Successfully logged out off the BOE server. Logon token invalidated.");
					$(userCredentials).css("display","block");
					$(buttonBar).css("display","none");
				},
					
				beforeSend: function(xhr){ 	
					xhr.setRequestHeader('Accept', 'application/xml');
					xhr.setRequestHeader('X-SAP-LogonToken', logonToken);
				}	
				});
	}
	
	function refresh()	{
		
		ajaxRequest = $.ajax({url: server + '/biprws/raylight/v1/documents/'+docID+'/parameters/', type: 'put',
			// Data payload for reports with no parameters is not required in builds higher than 666, uncomment below line to enable data payload
			//data: '<parameters><parameter><id>0</id><answer><values><value id=""/></values></answer></parameter></parameters>',
			success: function(xhr) {
				exportReport(docID,1,'xml',true);
			},
				 beforeSend: function(xhr) {
						$("#map_canvas").mask("Refreshing data");
						xhr.setRequestHeader('Accept', 'application/xml');
						xhr.setRequestHeader('Content-Type', 'application/xml');
						xhr.setRequestHeader('X-SAP-LogonToken', logonToken);
						//xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
						}
		});
	}
	
	