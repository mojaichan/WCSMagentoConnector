function suiteLet_getOpenInvoice(request, response){
	var customer_internalId = request.getParameter('custid');
	if (!customer_internalId){
		nlapiLogExecution('ERROR',"request","not custid argument");
		return;
	}
	var invoice_search = nlapiLoadSearch('transaction', 'customsearch_website_payment_status');
	var filters = invoice_search.getFilters();
	var someCriteria = new nlobjSearchFilter('entity',null, 'anyof', customer_internalId);
	invoice_search.addFilter(someCriteria);
	invoice_search.saveSearch();
	
	//multiple currency handling
	var invoice_currency = [];
	
	var invoice_searchResult = nlapiSearchRecord('transaction', 'customsearch_website_payment_status');
	if (invoice_searchResult != null){
		nlapiLogExecution('AUDIT',"Saved Search","Saved Search Executed. "+ invoice_searchResult.length +" results are returned.");
		var json_data = JSON.stringify(invoice_searchResult);
		/*** parse the search result and output as JSON ***/
		var invoices = new Array();
		for (var i = 0; i < invoice_searchResult.length; i++){
			invoices[i] = {};
			var json_data = JSON.stringify(invoice_searchResult[i]);
			var json_invoice = JSON.parse(json_data);
			invoices[i].tranid = json_invoice.columns.tranid;
			invoices[i].trandate = json_invoice.columns.trandate;
			invoices[i].createdfrom = {};
			
			if (json_invoice.columns.createdfrom && json_invoice.columns.createdfrom.type !== "undefined"){
			var tmp_string = json_invoice.columns.createdfrom.name.split("#");
			invoices[i].createdfrom.name = tmp_string[1];
			invoices[i].age = json_invoice.columns.formulanumeric;
			} else {
				invoices[i].createdfrom.name = '';
				invoices[i].age = '0';
			}
			var temp_currencyId = json_invoice.columns.currency.internalid;
			if (!(temp_currencyId in invoice_currency)){
				var recCurrency = nlapiLoadRecord('currency',temp_currencyId);
				invoice_currency[temp_currencyId] = recCurrency.getFieldValue('displaysymbol');
				if (temp_currencyId == '5'){ // British pound
					invoice_currency[temp_currencyId] = '&pound';
				}
			}
			invoices[i].currency = invoice_currency[temp_currencyId];
			invoices[i].exchangerate = json_invoice.columns.exchangerate;
			invoices[i].total = json_invoice.columns.total/invoices[i].exchangerate;
			invoices[i].amountpaid = json_invoice.columns.amountpaid/invoices[i].exchangerate;
			invoices[i].amountremaining = json_invoice.columns.amountremaining/invoices[i].exchangerate;
		}
		var output = JSON.stringify(invoices);
		response.write(output);
	} else {
		nlapiLogExecution('AUDIT',"Saved Search","Saved Search Executed. No result is found.");
	}
	invoice_search.setFilters(filters);
	invoice_search.saveSearch();
}

function suiteLet_getCustomerBalance(request, response){
	var customer_internalId = request.getParameter('custid');
	if (!customer_internalId){
		nlapiLogExecution('ERROR',"request","not custid argument");
		return;
	}
	var customer_record = nlapiLoadRecord('customer', customer_internalId);
		var customerBalances ={};
	customerBalances.balance = customer_record.getFieldValue('balance');
	customerBalances.depositbalance = customer_record.getFieldValue('depositbalance');
	customerBalances.overduebalance = customer_record.getFieldValue('overduebalance');
	customerBalances.displaysymbol = nlapiLoadRecord('currency',customer_record.getFieldValue('currency')).getFieldValue('displaysymbol');
	if (customer_record.getFieldValue('currency') == '5'){ //GBP
		customerBalances.displaysymbol = '&pound';
	}
	var output = JSON.stringify(customerBalances);
	response.write(output);
	nlapiLogExecution('AUDIT',"Success","Script run successfully on id "+customer_internalId);
}