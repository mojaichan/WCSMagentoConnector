function suitelet_getFulfillment(request, response){
	//constants for this function only
	var pickUpByCustomerID = '3';
	
	// verify if the request contains 'custid'. If not, output error
	var customer_internalId = request.getParameter('custid');
	if (!customer_internalId){
		nlapiLogExecution('ERROR',"request","not custid argument");	
		return;
	}	
	/* prepare and execute saved search */
	var fulfillment_search = nlapiLoadSearch('transaction', 'customsearch_website_ship_status_main');
	var filters = fulfillment_search.getFilters();
	var someCriteria = new nlobjSearchFilter('entity',null, 'anyof', customer_internalId);
	fulfillment_search.addFilter(someCriteria);
	fulfillment_search.saveSearch();
	var fulfillment_searchResult = nlapiSearchRecord('transaction', 'customsearch_website_ship_status_main');
	fulfillment_search.setFilters(filters);
	fulfillment_search.saveSearch();
	
	if (fulfillment_searchResult != null){
		var fulfillments = new Array();
		var resultSize = Math.min(10,fulfillment_searchResult.length);
		//response.write(JSON.stringify(fulfillment_searchResult[0]));
		//response.write("has" + fulfillment_searchResult.length+" result. result size = "+resultSize+" <br />");
		for (var i = 0; i < resultSize; i++){
			fulfillments[i] = {};
			var json_data = JSON.stringify(fulfillment_searchResult[i]);
			var json_fulfillment = JSON.parse(json_data);
			fulfillments[i].internalid = json_fulfillment.id;
			fulfillments[i].trandate = json_fulfillment.columns.trandate;
			fulfillments[i].tranid = json_fulfillment.columns.tranid;
			fulfillments[i].createdfrom = json_fulfillment.columns.createdfrom.name;
			fulfillments[i].deliverymode = {};
			fulfillments[i].deliverymode.name = json_fulfillment.columns.custbody4.name;
			fulfillments[i].deliverymode.internalid = json_fulfillment.columns.custbody4.internalid;
			if (fulfillments[i].deliverymode.internalid != pickUpByCustomerID){ //3 stands for pickup by customer
				fulfillments[i].shipaddress = json_fulfillment.columns.shipaddress;
			} else {
				fulfillments[i].shipaddress = '';
			}
			
			if (json_fulfillment.columns.custbody_website_received == true){
				fulfillments[i].custbody_website_received = 'Yes';
			} else {
				fulfillments[i].custbody_website_received = 'No';
			}
		
			fulfillments[i].custbodytrackingnumber = json_fulfillment.columns.custbodytrackingnumber;
			
			/* load line-item detail, requested by WCS on 9/7/2014 */
			fulfillments[i].itemdescriptions = "";
			var recFulfillment = nlapiLoadRecord('itemfulfillment',fulfillments[i].internalid);
			for (var j = 1; j <= recFulfillment.getLineItemCount('item'); j++){
				var itemtype = recFulfillment.getLineItemValue('item','itemtype',j);
				var quantity = recFulfillment.getLineItemValue('item','quantity',j);
				var itemdescription = recFulfillment.getLineItemValue('item','itemdescription',j);	
				if ((quantity != null && quantity != 'null' && quantity != '') && (itemtype == 'InvtPart' || itemtype == 'NonInvtPart')){
					fulfillments[i].itemdescriptions += quantity ;
					fulfillments[i].itemdescriptions += ' x ' ;
					fulfillments[i].itemdescriptions += itemdescription;
					fulfillments[i].itemdescriptions += '\n';
				}
			}
			//response.write(JSON.stringify(fulfillments[i]) + "<br /><br />");
		}
		response.write(JSON.stringify(fulfillments));
		nlapiLogExecution('AUDIT',"Saved Search","Executed on customer internalid: "+ customer_internalId +". "+resultSize+" results returned.");
	} else {
		nlapiLogExecution('AUDIT',"Saved Search","Executed on customer internalid: "+ customer_internalId +". No result is found.");
	}
}


function markFulfillmentReceived(datain){
	/** Restlet function
	 *  error codes
	 *  RCRD_DSNT_EXIST : thrown by nlapiLoadRecord if loading a non-exist record
	 *  MISSING_ARGUMENT : not enough argument from request JSON
	 */
	var output = {};
	//getRequestID - so_internalid & custid
	var customer_internalId = datain.custid;
	var fulfillment_internalId = datain.fulfillment_internalid;
	nlapiLogExecution('DEBUG','Paramter','custid = '+customer_internalId+ ' fulfillment_id = ', fulfillment_internalId);
	if (!customer_internalId || !fulfillment_internalId){
		output.isSuccess = false;
		output.err_code = 'MISSING_ARGUMENT';
		return output;
	}
	try { //throw error if the sales order's internalid is not valid
		var recFulfillment = nlapiLoadRecord('itemfulfillment',fulfillment_internalId);
		nlapiLogExecution('DEBUG',"Record Loaded","Loaded fulfillment "+fulfillment_internalId);
	}
	catch (err){
		if (err instanceof nlobjError){	
			output.isSuccess = false;
			output.err_code = err.getCode();
			return output;
		}
	}
	//validate so_internalid matches custid
	var fulfillment_custid = recFulfillment.getFieldValue('entity');
	if (fulfillment_custid != customer_internalId){
		output.isSuccess = false;
		output.err_code = "INVALID_CUSTOMER_ID";
		return output;
	}
	
	//update field
	recFulfillment.setFieldValue('custbody_website_received','T');
	nlapiSubmitRecord(recFulfillment);
	nlapiLogExecution('AUDIT',"Success","Marked received on fulfillment internal ID:"+fulfillment_internalId);
	output.isSuccess = true;
	output.id = fulfillment_internalId;
	
	//check if SO need to update
	var recSO = nlapiLoadRecord('salesorder',recFulfillment.getFieldValue('createdfrom'));
	var SO_status = recSO.getFieldValue('status');
	nlapiLogExecution('DEBUG','SO status',SO_status);
	if (SO_status == 'Billed' || SO_status == 'Closed'){
		recSO.setFieldValue('custbody_website_received','T');
		nlapiSubmitRecord(recSO);
		nlapiLogExecution('AUDIT','Update SO status',recSO.getFieldValue('tranid') + 'is set to be received');
	}
	return output;
}