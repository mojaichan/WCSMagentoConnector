function Connector_Export_Customer_Magento_AS(type){
	/*
		This is a Netsuite user event - after submit function.
		When a  customer is saved and has met specific criteria, this scripts calls external URI to create customer in Magento
	*/
	if (type == 'create' || type =='edit'){
		
		/*	criteria for posting to magento
			1. Post to Magento Flag is true
			2. Password is not empty
			3. Customer is not inactive
		*/
		if (nlapiGetFieldValue('custentity_fern_post_magento') == 'T' && nlapiGetFieldValue('custentity_first_time_pwd') != '' && nlapiGetFieldValue('isinactive') == 'F'){
			
			//var url = "http://ec2-54-79-90-156.ap-southeast-2.compute.amazonaws.com/wcs_magento/testapi.php";
			var url = "http://ec2-54-79-90-156.ap-southeast-2.compute.amazonaws.com/nsconnector/public/customer";
			var headers = new Array();
			var customer = {};
			
			if (nlapiGetFieldValue('custentity_fern_magento_id') == ""){
				var actionType = 'create';
				customer.custentity_fern_magento_id = '';
			} else {
				var actionType = 'edit';
				customer.custentity_fern_magento_id = nlapiGetFieldValue('custentity_fern_magento_id');
			}
		
			customer = setCustomerData(customer);
			customer = setCustomerAddressData(customer);
			
			var requestBody = {};
			requestBody.customer = JSON.stringify(customer);
			requestBody.action = actionType;
			nlapiLogExecution('DEBUG','request data',requestBody.customer);		
			nlapiLogExecution('DEBUG','request action',requestBody.action);
			
			var output = nlapiRequestURL(url,requestBody,headers,"POST");
			nlapiLogExecution('DEBUG','response',output.getBody());
			var jsonData = JSON.parse(output.getBody());
			
			if (actionType == 'create' && !jsonData.faultcode){ //only update magento id if an record is created.
				var thisrecord = nlapiLoadRecord('customer',nlapiGetRecordId());
				thisrecord.setFieldValue('custentity_fern_magento_id',jsonData.magento_id);
				nlapiSubmitRecord(thisrecord);
			}
		}
	}
}
 
function setCustomerData(customer){
	/*	used in User Event
		Read fields in current customer record and saved into "customer" object"
	*/
	customer.netsuite_internalid = nlapiGetRecordId();
	customer.salutation = nlapiGetFieldValue('salutation');
	customer.firstname = nlapiGetFieldValue('firstname');
	customer.lastname = nlapiGetFieldValue('lastname');
	customer.companyname = nlapiGetFieldValue('companyname');
	customer.email = nlapiGetFieldValue('email');
	customer.password = nlapiGetFieldValue('custentity_first_time_pwd');
	customer.ispostmagento = nlapiGetFieldValue('custentity_fern_post_magento');
	customer.gender = nlapiGetFieldValue('custentitymorf');
	
	//custom fieldsets
	customer.customer_id = nlapiGetFieldValue('entityid');
	customer.phone = nlapiGetFieldValue('phone');
	customer.referred_by = nlapiGetFieldValue('comments');
	customer.height = nlapiGetFieldValue('custentity_height');
	customer.weight = nlapiGetFieldValue('custentity_weight');
	customer.dob = nlapiGetFieldValue('custentity_dateofbirth');
	customer.year_of_customer = nlapiGetFieldValue('custentity_year_customer');
	
	return customer;
}
 
function setCustomerAddressData(customer){
	var customerAddresses = new Array();
	var gotBilling = false;
	var gotShipping = false;
	var addressTotal = nlapiGetLineItemCount('addressbook');
	nlapiLogExecution('DEBUG','no address', addressTotal);
	for (i = 1; i <= addressTotal; i++){
		nlapiSelectLineItem('addressbook',i);
		var addressLine = {};
		if (nlapiGetCurrentLineItemValue('addressbook','defaultshipping') == 'T' || nlapiGetCurrentLineItemValue('addressbook','defaultbilling') == 'T'){
			if (nlapiGetCurrentLineItemValue('addressbook','defaultshipping') == 'T'){
				gotShipping = true;
				addressLine.is_default_shipping = true;
			} else {
				addressLine.is_default_shipping = false;
			}
			if (nlapiGetCurrentLineItemValue('addressbook','defaultbilling') == 'T'){
				gotBilling = true;
				addressLine.is_default_billing = true;
			} else {
				addressLine.is_default_billing = false;
			}
			addressLine.addr1 = nlapiGetCurrentLineItemValue('addressbook','addr1');
			addressLine.addr2 = nlapiGetCurrentLineItemValue('addressbook','addr2');
			addressLine.city = nlapiGetCurrentLineItemValue('addressbook','city');
			addressLine.state = nlapiGetCurrentLineItemValue('addressbook','state');
			addressLine.zip = nlapiGetCurrentLineItemValue('addressbook','zip');
			addressLine.phone = nlapiGetCurrentLineItemValue('addressbook','phone');
			if (addressLine.phone == ""){
				addressLine.phone = customer.phone;
			}
			addressLine.country = nlapiGetCurrentLineItemValue('addressbook','country');
			
			customerAddresses.push(addressLine);
		}
	}
	if (addressTotal > 0){
		customer.addresses = customerAddresses;
	}
	return customer;
}