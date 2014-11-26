/** Written by David@Fern for WCS website functions.
 *  This is for the actions on 'customer' entity.
 */

function updatePassword(datain){

	var email = datain.cust_email;
	//search on customer;
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('email', null, 'is', email );
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	var customerSearch = nlapiCreateSearch('customer', filters, columns );
	var searchResults = customerSearch.runSearch();
	var searchResult = searchResults.getResults(0,1);
	if (searchResult[0] != null && typeof(searchResult[0]) != undefined){
		//some result
		var customerInternalId = searchResult[0].getId();
		nlapiLogExecution('AUDIT','result is found','customer internalid: '+customerInternalId+' is found on '+email);
	} else {
		nlapiLogExecution('AUDIT','no result','no result is found on'+email );
		var returnError = new Object();
		returnError.isSuccess = false;
		return returnError;
	}
	//load record
	var customer = {};
	var recCustomer = nlapiLoadRecord('customer',customerInternalId);
	customer.isSuccess = true;
	customer.firstname = recCustomer.getFieldValue('firstname');
	customer.lastname = recCustomer.getFieldValue('lastname');
	customer.email = email;
	customer.firstname = recCustomer.getFieldValue('firstname');
	var firstPassword = recCustomer.getFieldValue('custentity_first_time_pwd');
	if (firstPassword == null || firstPassword.length < 5){
		var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 8; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
		firstPassword = text;
	}
	customer.firstPassword = firstPassword;
	recCustomer.setFieldValue('giveaccess','T');
	recCustomer.setFieldValue('accessrole','14'); //standard customer centre
	recCustomer.setFieldValue('password',firstPassword);
	recCustomer.setFieldValue('password2',firstPassword);
	recCustomer.setFieldValue('custentity_first_time_pwd',firstPassword);
	nlapiSubmitRecord(recCustomer);
	return customer;
}

function getCustomer(datain){
	var customerInternalId = datain.custid;
	var recCustomer = nlapiLoadRecord('customer',customerInternalId);
	var customer = {};
	customer.firstname = recCustomer.getFieldValue('firstname');
	customer.lastname = recCustomer.getFieldValue('lastname');
	//customer.firstname = "yo";
	return customer;
}