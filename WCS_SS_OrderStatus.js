function getWebOrderStatus(status_internalid,received,sentdate){
	switch(status_internalid){
	//'pendingFulfillment' fullyBilled pendingApproval partiallyFulfilled pendingBilling pendingBillingPartFulfilled closed
		case 'pendingApproval':
		case 'Pending Approval':
			return 'Order in progress';
			break;
		case 'pendingFulfillment':
		case 'Pending Fulfillment':
		case 'partiallyFulfilled':
		case 'Partially Fulfilled':
		case 'pendingBillingPartFulfilled':
		case 'Pending Billing/Partially Fulfilled':
			return 'Production in progress';
			break;
		case 'pendingBilling':
		case 'Pending Billing':
		case 'fullyBilled':
		case 'Billed':
			if (received == true || received == 'T'){
				return 'Completed';
			}
			if (received == false || received == 'F'){
				return 'Delivery in progress';
			}
			return 'undefined';
		case 'closed':
			//empty sent date means no fulfillment is required
			if (received == true || received == 'T' || sentdate ==''){
				return 'Completed';
			}
			if (received == false || received == 'F'){
				return 'Delivery in progress';
			}
			return 'undefined';
			break;
		default:
			return 'undefined';
	}
}


function suitelet_getOpenSalesOrder(request, response){
	//constants for this function only
	var pickUpByCustomerID = '3';
	
	// verify if the request contains 'custid'. If not, output error
	var customer_internalId = request.getParameter('custid');
	if (!customer_internalId){
		nlapiLogExecution('ERROR',"request","not custid argument");	
		return;
	}	
	/* prepare and execute saved search */
	var salesorder_search = nlapiLoadSearch('transaction', 'customsearch_website_order_status_main');
	var filters = salesorder_search.getFilters();
	var someCriteria = new nlobjSearchFilter('entity',null, 'anyof', customer_internalId);
	salesorder_search.addFilter(someCriteria);
	salesorder_search.saveSearch();
	var salesorder_searchResult = nlapiSearchRecord('transaction', 'customsearch_website_order_status_main');
	salesorder_search.setFilters(filters);
	salesorder_search.saveSearch();
	if (salesorder_searchResult != null){
		var salesorders = new Array();
		var resultSize = Math.min(10,salesorder_searchResult.length);
		//response.write(JSON.stringify(salesorder_searchResult[0]));
		//response.write("has" + salesorder_searchResult.length+" result. result size = "+resultSize+" <br />");
		for (var i = 0; i < resultSize; i++){
			salesorders[i] = {};
			var json_data = JSON.stringify(salesorder_searchResult[i]);
			var json_salesorder = JSON.parse(json_data);
			salesorders[i].internalid = json_salesorder.id;
			salesorders[i].trandate = json_salesorder.columns.trandate;
			salesorders[i].tranid = json_salesorder.columns.tranid;
			salesorders[i].deliverymode = {};
			salesorders[i].deliverymode.name = json_salesorder.columns.custbody4.name;
			salesorders[i].deliverymode.internalid = json_salesorder.columns.custbody4.internalid;
			if (salesorders[i].deliverymode.internalid != pickUpByCustomerID){ //3 stands for pickup by customer
				salesorders[i].shipaddress = json_salesorder.columns.shipaddress;
			} else {
				salesorders[i].shipaddress = '';
			}
			salesorders[i].custbody_website_received = json_salesorder.columns.custbody_website_received;
			salesorders[i].custbody_website_tracking_number = json_salesorder.columns.custbody_website_tracking_number;
			if (json_salesorder.columns.custbody_website_sent_date && json_salesorder.columns.custbody_website_sent_date.type !== "undefined"){
				salesorders[i].custbody_website_sent_date = json_salesorder.columns.custbody_website_sent_date;
			} else {
				salesorders[i].custbody_website_sent_date = '';
			}
			salesorders[i].status = getWebOrderStatus(json_salesorder.columns.statusref.internalid,salesorders[i].custbody_website_received,salesorders[i].custbody_website_sent_date);
			//response.write(JSON.stringify(salesorders[i]) + "<br /><br />");
		}
		response.write(JSON.stringify(salesorders));
	//	nlapiLogExecution('AUDIT',"Saved Search","Executed on customer internalid: "+ customer_internalId +". "+resultSize+" results returned.");
	} else {
		//nlapiLogExecution('AUDIT',"Saved Search","Executed on customer internalid: "+ customer_internalId +". No result is found.");
	}
}

function suitelet_getHistoricalSalesOrder(request, response){
	//constants for this function only
	var pickUpByCustomerID = '3';
	
	// verify if the request contains 'custid'. If not, output error
	var customer_internalId = request.getParameter('custid');
	if (!customer_internalId){
		nlapiLogExecution('ERROR',"request","not custid argument");	
		return;
	}	
	/* prepare and execute saved search */
	var salesorder_search = nlapiLoadSearch('transaction', 'customsearch_website_order_history');
	var filters = salesorder_search.getFilters();
	var someCriteria = new nlobjSearchFilter('entity',null, 'anyof', customer_internalId);
	salesorder_search.addFilter(someCriteria);
	salesorder_search.saveSearch();
	var salesorder_searchResult = nlapiSearchRecord('transaction', 'customsearch_website_order_history');
	salesorder_search.setFilters(filters);
	salesorder_search.saveSearch();
	if (salesorder_searchResult != null){
		var salesorders = new Array();
		var resultSize = Math.min(10,salesorder_searchResult.length);
		//response.write(JSON.stringify(salesorder_searchResult[0]));
		//response.write("has" + salesorder_searchResult.length+" result. result size = "+resultSize+" <br />");
		for (var i = 0; i < resultSize; i++){
			salesorders[i] = {};
			var json_data = JSON.stringify(salesorder_searchResult[i]);
			var json_salesorder = JSON.parse(json_data);
			salesorders[i].internalid = json_salesorder.id;
			salesorders[i].trandate = json_salesorder.columns.trandate;
			salesorders[i].tranid = json_salesorder.columns.tranid;
			salesorders[i].deliverymode = {};
			salesorders[i].deliverymode.name = json_salesorder.columns.custbody4.name;
			salesorders[i].deliverymode.internalid = json_salesorder.columns.custbody4.internalid;
			if (salesorders[i].deliverymode.internalid != pickUpByCustomerID){ //3 stands for pickup by customer
				salesorders[i].shipaddress = json_salesorder.columns.shipaddress;
			} else {
				salesorders[i].shipaddress = '';
			}
			salesorders[i].custbody_website_received = json_salesorder.columns.custbody_website_received;
			salesorders[i].custbody_tracking_number = json_salesorder.columns.custbody_tracking_number;
			if (json_salesorder.columns.custbody_website_sent_date && json_salesorder.columns.custbody_website_sent_date.type !== "undefined"){
				salesorders[i].custbody_website_sent_date = json_salesorder.columns.custbody_website_sent_date;
			} else {
				salesorders[i].custbody_website_sent_date = '';
			}
			salesorders[i].status = getWebOrderStatus(json_salesorder.columns.statusref.internalid,salesorders[i].custbody_website_received,salesorders[i].custbody_website_sent_date);
			//response.write(JSON.stringify(salesorders[i]) + "<br /><br />");
		}
		response.write(JSON.stringify(salesorders));
		nlapiLogExecution('AUDIT',"Saved Search","Executed on customer internalid: "+ customer_internalId +". "+resultSize+" results returned.");
	} else {
		nlapiLogExecution('AUDIT',"Saved Search","Executed on customer internalid: "+ customer_internalId +". No result is found.");
	}
}

function markOrderReceived(datain){
	/** Restlet function
	 *  error codes
	 *  RCRD_DSNT_EXIST : thrown by nlapiLoadRecord if loading a non-exist record
	 *  MISSING_ARGUMENT : not enough argument from request JSON
	 */
	var output = {};
	//getRequestID - so_internalid & custid
	var customer_internalId = datain.custid;
	var so_internalId = datain.so_internalid;
	if (!customer_internalId || !so_internalId){
		output.isSuccess = false;
		output.err_code = 'MISSING_ARGUMENT';
		return output;
	}
	try { //throw error if the sales order's internalid is not valid
		var recSO = nlapiLoadRecord('salesorder',so_internalId);
	}
	catch (err){
		if (err instanceof nlobjError){	
			output.isSuccess = false;
			output.err_code = err.getCode();
			return output;
		}
	}
	//validate so_internalid matches custid
	var so_custid = recSO.getFieldValue('entity');
	if (so_custid != customer_internalId){
		output.isSuccess = false;
		output.err_code = "INVALID_CUSTOMER_ID";
		return output;
	}
	
	//update field
	recSO.setFieldValue('custbody_website_received','T');
	nlapiSubmitRecord(recSO);
	nlapiLogExecution('AUDIT',"Success","Marked received on SO internal ID:"+so_internalId);
	output.isSuccess = true;
	output.id = so_internalId;
	return output;
}
function loadStyle(){	
	/* prepare and execute saved search */
	
	var salesorder_searchResult = nlapiSearchRecord('customrecordstylelist', '_web_orderstatus_stylelist');
	if (salesorder_searchResult != null){
		/*var styleLists = new Array();
		for (var i = 0; i < resultSize; i++){
			salesorders[i] = {};
			var json_data = JSON.stringify(salesorder_searchResult[i]);
			var json_salesorder = JSON.parse(json_data);
			salesorders[i].internalid = json_salesorder.id;
			salesorders[i].trandate = json_salesorder.columns.trandate;
			salesorders[i].tranid = json_salesorder.columns.tranid;
			salesorders[i].deliverymode = {};
			salesorders[i].deliverymode.name = json_salesorder.columns.custbody4.name;
			salesorders[i].deliverymode.internalid = json_salesorder.columns.custbody4.internalid;
			if (salesorders[i].deliverymode.internalid != pickUpByCustomerID){ //3 stands for pickup by customer
				salesorders[i].shipaddress = json_salesorder.columns.shipaddress;
			} else {
				salesorders[i].shipaddress = '';
			}
			salesorders[i].custbody_website_received = json_salesorder.columns.custbody_website_received;
			salesorders[i].custbody_tracking_number = json_salesorder.columns.custbody_tracking_number;
			if (json_salesorder.columns.custbody_website_sent_date && json_salesorder.columns.custbody_website_sent_date.type !== "undefined"){
				salesorders[i].custbody_website_sent_date = json_salesorder.columns.custbody_website_sent_date;
			} else {
				salesorders[i].custbody_website_sent_date = '';
			}
			salesorders[i].status = getWebOrderStatus(json_salesorder.columns.statusref.internalid,salesorders[i].custbody_website_received,salesorders[i].custbody_website_sent_date);
			//response.write(JSON.stringify(salesorders[i]) + "<br /><br />");
		}
		response.write(JSON.stringify(salesorders));*/
	//	nlapiLogExecution('AUDIT',"Saved Search","Executed on customer internalid: "+ customer_internalId +". "+resultSize+" results returned.");
		return salesorder_searchResult;
	} else {
		nlapiLogExecution('DEBUG',"Searched","This search returned null");
	}
}
function viewOrder(datain){
	/** Restlet function
	 *  error codes
	 *  RCRD_DSNT_EXIST : thrown by nlapiLoadRecord if loading a non-exist record
	 *  MISSING_ARGUMENT : not enough argument from request JSON
	 */
	//constants for this function only
	var pickUpByCustomerID = '3';
	
	var output = {};
	//getRequestID - so_internalid & custid
	var customer_internalId = datain.custid;
	var so_internalId = datain.so_internalid;
	if (!customer_internalId || !so_internalId){
		output.isSuccess = false;
		output.err_code = 'MISSING_ARGUMENT';
		return output;
	}
	//try { //throw error if the sales order's internalid is not valid
		var recSO = nlapiLoadRecord('salesorder',so_internalId);
	/*}
	catch (err){
		if (err instanceof nlobjError){	
			output.isSuccess = false;
			output.err_code = err.getCode();
			return output;
		}
	}*/
	//validate so_internalid matches custid
	var so_custid = recSO.getFieldValue('entity');
	if (so_custid != customer_internalId){
		output.isSuccess = false;
		output.err_code = "INVALID_CUSTOMER_ID";
		return output;
	}
	/*** prepare response ***/
	var salesOrderObj = new Object();
	salesOrderObj.internalid = recSO.getFieldValue('id');
	salesOrderObj.trandate = recSO.getFieldValue('trandate');
	salesOrderObj.tranid = recSO.getFieldValue('tranid');
	salesOrderObj.deliverymode = recSO.getFieldText('custbody4');
	salesOrderObj.deliverymode_id = recSO.getFieldValue('custbody4');
	if (salesOrderObj.deliverymode_id != pickUpByCustomerID){ //3 stands for pickup by customer
		salesOrderObj.shipaddress = recSO.getFieldValue('shipaddress');
	} else {
		salesOrderObj.shipaddress = '';
	}

	salesOrderObj.custbody_website_received = recSO.getFieldValue('custbody_website_received');
	salesOrderObj.custbody_tracking_number = recSO.getFieldValue('custbody_website_tracking_number');
	salesOrderObj.custbody_tracking_number = '';
	salesOrderObj.custbody_website_sent_date = recSO.getFieldValue('custbody_website_sent_date');
	//nlapiLogExecution('DEBUG',"Status","1."+recSO.getFieldText('orderstatus')+" + "+salesOrderObj.custbody_website_received+" + "+salesOrderObj.custbody_website_sent_date);
	salesOrderObj.status = getWebOrderStatus(recSO.getFieldText('orderstatus'),salesOrderObj.custbody_website_received,salesOrderObj.custbody_website_sent_date);
	salesOrderObj.custbodyalteration = recSO.getFieldText('custbodyalteration');
	//producing item sublist
	salesOrderObj.item = [];
	var numItems = recSO.getLineItemCount('item');
	for (var i=1;i <= numItems;i++){
		salesOrderObj.item[i] = new Object();
		salesOrderObj.item[i].item = {};
		salesOrderObj.item[i].item.id = recSO.getLineItemValue('item','item',i);
		salesOrderObj.item[i].item.name = recSO.getLineItemText('item','item',i);
		salesOrderObj.item[i].item.itemtype = recSO.getLineItemValue('item','itemtype',i);
		salesOrderObj.item[i].description = recSO.getLineItemValue('item','description',i);
		salesOrderObj.item[i].quantity = recSO.getLineItemValue('item','quantity',i);
		salesOrderObj.item[i].custcolfabric = {};
		salesOrderObj.item[i].custcolfabric.id = recSO.getLineItemValue('item','custcolfabric',i);
		salesOrderObj.item[i].custcolstyle = {};
		salesOrderObj.item[i].custcolstyle.id = recSO.getLineItemValue('item','custcolstyle',i);
		//detect product type
		if (salesOrderObj.item[i].item.itemtype == 'InvtPart'){
			var recItem = nlapiLoadRecord('inventoryitem',salesOrderObj.item[i].item.id);
			salesOrderObj.item[i].item.custitemfinalgoodtype = recItem.getFieldText('custitemfinalgoodtype');
		}
			//nlapiLogExecution('DEBUG',"fabricselect","Fabric Select"+JSON.stringify(fabricSelect));
		//load fabric
		if	(salesOrderObj.item[i].custcolfabric.id !== null){
			var fabricSelect = nlapiLoadRecord('customrecordfabricselection',salesOrderObj.item[i].custcolfabric.id);
			var fabricId = fabricSelect.getLineItemValue('recmachcustrecordfabricselectid','custrecordfabricselectfabric',1);
			salesOrderObj.item[i].custcolfabric.name = nlapiLoadRecord('inventoryitem',fabricId).getFieldValue('custitemhistorycode');
		} else {
			salesOrderObj.item[i].custcolfabric.id = '';
			salesOrderObj.item[i].custcolfabric.name = '';
		}
		//load styles
		/*if (salesOrderObj.item[i].custcolstyle.id !== null){
			//check finish good type
			var recStyleList = nlapiLoadRecord('customrecordstylelist',salesOrderObj.item[i].custcolstyle.id);
			//shirt attributes
			salesOrderObj.item[i].custcolstyle.fields = {};
			var collarId = recStyleList.getFieldValue('custrecord41');
			if (collarId != null){
				salesOrderObj.item[i].custcolstyle.fields.collar = nlapiLoadRecord('customrecord19',collarId).getFieldValue('custrecordshirtstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.collar =='';
			}
			var frontId = recStyleList.getFieldValue('custrecord50');
			if (frontId != null){
				salesOrderObj.item[i].custcolstyle.fields.front = nlapiLoadRecord('customrecord19',frontId).getFieldValue('custrecordshirtstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.front = '';
			}
			var cuffId = recStyleList.getFieldValue('custrecord53');
			if (cuffId != null){
				salesOrderObj.item[i].custcolstyle.fields.cuff = nlapiLoadRecord('customrecord19',cuffId).getFieldValue('custrecordshirtstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.cuff = '';
			}
			var pocketId = recStyleList.getFieldValue('custrecord49');
			if (pocketId != null){
				salesOrderObj.item[i].custcolstyle.fields.pocket = nlapiLoadRecord('customrecord19',pocketId).getFieldValue('custrecordshirtstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.pocket = '';
			}
			salesOrderObj.item[i].custcolstyle.fields.monoIni = recStyleList.getFieldValue('custrecord192');
			if (salesOrderObj.item[i].custcolstyle.fields.monoIni == null){
				salesOrderObj.item[i].custcolstyle.fields.monoIni = '';
			}
			var monoPosId = recStyleList.getFieldValue('custrecord61');
			if (monoPosId != null){
				salesOrderObj.item[i].custcolstyle.fields.monoPos = nlapiLoadRecord('customrecord19',monoPosId).getFieldValue('custrecordshirtstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.monoPos = '';
			}
			var monoColorId = recStyleList.getFieldValue('custrecord62');
			if (monoColorId != null){
				salesOrderObj.item[i].custcolstyle.fields.monoColor = nlapiLoadRecord('customrecord19',monoColorId).getFieldValue('custrecordshirtstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.monoColor = '';
			}
			var buttonId = recStyleList.getFieldValue('custrecord63');
			if (buttonId != null){
				salesOrderObj.item[i].custcolstyle.fields.button = nlapiLoadRecord('customrecord19',buttonId).getFieldValue('custrecordshirtstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.button = 'Standard';
			}
			var backPleatId = recStyleList.getFieldValue('custrecord54');
			if (backPleatId != null){
				salesOrderObj.item[i].custcolstyle.fields.backPleat = nlapiLoadRecord('customrecord19',backPleatId).getFieldValue('custrecordshirtstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.backPleat = '';
			}
			var fittingId = recStyleList.getFieldValue('custrecord66');
			if (fittingId != null){
				salesOrderObj.item[i].custcolstyle.fields.fitting = nlapiLoadRecord('customrecord19',fittingId).getFieldValue('custrecordshirtstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.fitting = '';
			}
			//suit attributes
			var jacketFrontId = recStyleList.getFieldValue('custrecord77');
			if (jacketFrontId != null){
				salesOrderObj.item[i].custcolstyle.fields.jacketFront = nlapiLoadRecord('customrecord26',jacketFrontId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.jacketFront = '';
			}
			var lapelStyleId = recStyleList.getFieldValue('custrecord80');
			if (lapelStyleId != null){
				salesOrderObj.item[i].custcolstyle.fields.lapelStyle = nlapiLoadRecord('customrecord26',lapelStyleId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.lapelStyle = '';
			}
			var ventId = recStyleList.getFieldValue('custrecord78');
			if (ventId != null){
				salesOrderObj.item[i].custcolstyle.fields.vent = nlapiLoadRecord('customrecord26',ventId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.vent = '';
			}
			var lowerPocketId = recStyleList.getFieldValue('custrecord78');
			if (lowerPocketId != null){
				salesOrderObj.item[i].custcolstyle.fields.lowerPocket = nlapiLoadRecord('customrecord26',lowerPocketId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.lowerPocket = '';
			}
			var jacketCuffId = recStyleList.getFieldValue('custrecord84');
			if (jacketCuffId != null){
				salesOrderObj.item[i].custcolstyle.fields.jacketCuff = nlapiLoadRecord('customrecord26',jacketCuffId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.jacketCuff = '';
			}
			var jacketFittingId = recStyleList.getFieldValue('custrecord94');
			if (jacketFittingId != null){
				salesOrderObj.item[i].custcolstyle.fields.jacketFitting = nlapiLoadRecord('customrecord26',jacketFittingId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.jacketFitting = '';
			}
			var trousersFrontId = recStyleList.getFieldValue('custrecord86');
			if (trousersFrontId != null){
				salesOrderObj.item[i].custcolstyle.fields.trousersFront = nlapiLoadRecord('customrecord26',trousersFrontId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.trousersFront = '';
			}
			var waistBandId = recStyleList.getFieldValue('custrecord85');
			if (waistBandId != null){
				salesOrderObj.item[i].custcolstyle.fields.waistBand = nlapiLoadRecord('customrecord26',waistBandId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.waistBand = '';
			}
			var trousersFrontPocketId = recStyleList.getFieldValue('custrecord87');
			if (trousersFrontPocketId != null){
				salesOrderObj.item[i].custcolstyle.fields.trousersFrontPocket = nlapiLoadRecord('customrecord26',trousersFrontPocketId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.trousersFrontPocket = '';
			}
			var trousersRearPocketId = recStyleList.getFieldValue('custrecord89');
			if (trousersRearPocketId != null){
				salesOrderObj.item[i].custcolstyle.fields.trousersRearPocket = nlapiLoadRecord('customrecord26',trousersRearPocketId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.trousersRearPocket = '';
			}
			var trousersBottomId = recStyleList.getFieldValue('custrecord90');
			if (trousersBottomId != null){
				salesOrderObj.item[i].custcolstyle.fields.trousersBottom = nlapiLoadRecord('customrecord26',trousersBottomId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.trousersBottom = '';
			}
			var trousersFittingId = recStyleList.getFieldValue('custrecord95');
			if (trousersFittingId != null){
				salesOrderObj.item[i].custcolstyle.fields.trousersFitting = nlapiLoadRecord('customrecord26',trousersFittingId).getFieldValue('custrecordsuitstylenameeng');
			} else {
				salesOrderObj.item[i].custcolstyle.fields.trousersFitting = '';
			}
		}*/
	}
	
	return salesOrderObj;
	//return recSO;
}