/** This file includes function allows CRUD operation for task record type
	The suitescript type are Restlet.
	Create date 20,Oct, 2014
**/
function deleteTrialFit(datain){
	nlapiLogExecution('DEBUG','Request headertype','Delete');
	nlapiLogExecution('DEBUG','Content',JSON.stringify(datain));	
}

function getTrialFit(datain){
	nlapiLogExecution('DEBUG','Request headertype','GET');
	nlapiLogExecution('DEBUG','Content',JSON.stringify(datain));
	
	var output = {};
	//createSearch to get CustomerInternal ID
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('entityid', null, 'is',datain.id);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	//search filters
	var customerSearch = nlapiSearchRecord('customer',null,filters,columns);
	var customerInternalid ='';
	if (customerSearch != null){ 
		var customerInternalid = customerSearch[0].getId();
	}
	if (customerInternalid != ''){ // This part execute if the customer is found
		//search task record
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custeventtasktype',null,'anyof',2); // 2 is trial fitting
		filters[1] = new nlobjSearchFilter('entity','custevent1','anyof',customerInternalid); //name of sales order
		filters[2] = new nlobjSearchFilter('startdate',null,'onorafter','today');
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('internalid');
		columns[1] = new nlobjSearchColumn('custevent1');
		columns[2] = new nlobjSearchColumn('startdate');
		columns[3] = new nlobjSearchColumn('starttime');
		columns[4] = new nlobjSearchColumn('trandate','custevent1');
		columns[5] = new nlobjSearchColumn('custbodysummarymenshirt','custevent1');		
		columns[6] = new nlobjSearchColumn('custbodysummaryladyshirt','custevent1');		
		columns[7] = new nlobjSearchColumn('custbodysummarymenjacket','custevent1');
		columns[8] = new nlobjSearchColumn('custbodysummaryladyjacket','custevent1');
		columns[9] = new nlobjSearchColumn('custbodysummarytrouser','custevent1');
		columns[2].setSort();
		var taskSearch = nlapiSearchRecord('task',null,filters,columns);
		if (taskSearch != null){ //There is a upcoming trial fit
			output.isSuccess = true;
			var taskResult = taskSearch[0];
			var taskObj = {};
			taskObj.internalid = taskResult.getId();
			taskObj.startdate = taskResult.getValue(columns[2]);
			taskObj.starttime = taskResult.getValue(columns[3]).toLowerCase();
			output.task = taskObj;
			
			if (taskResult.getValue(columns[1]) != null && taskResult.getValue(columns[1]) != ''){
			//execute if the task contains a sales order
				var salesOrderObj = {};
				salesOrderObj.internalid = taskResult.getValue(columns[1]);
				salesOrderObj.tranid = taskResult.getText(columns[1]);
				salesOrderObj.trandate = taskResult.getValue(columns[4]);
				salesOrderObj.menshirt = taskResult.getValue(columns[5]);
				salesOrderObj.ladyshirt = taskResult.getValue(columns[6]);
				salesOrderObj.menjacket = taskResult.getValue(columns[7]);
				salesOrderObj.ladyjacket = taskResult.getValue(columns[8]);
				salesOrderObj.trouser = taskResult.getValue(columns[9]);
				output.salesOrder = salesOrderObj;
			}
		} else {
			output.isSuccess = false;
			var taskInternalid = null;
		}
	} else {
		output.isSuccess = false;
	}
	
	output.type = 'get';
	return output;
}
function getTrialFitByDate(date){
	nlapiLogExecution('AUDIT','Request Date',date.date);
	var vacancy = 2;
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custeventtasktype',null,'anyof',2); // 2 is trial fitting
	filters[1] = new nlobjSearchFilter('startdate',null,'on',date.date); //name of sales order
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('startdate',null,'group');
	columns[1] = new nlobjSearchColumn('starttime',null,'group');
	columns[2] = new nlobjSearchColumn('formulanumeric',null,'sum').setFormula(vacancy+"-sum(1)");
	columns[0].setSort();
	var taskSearch = nlapiSearchRecord('task',null,filters,columns);
	if (taskSearch != null){
		var output = {};
		for (var i = 0; i < taskSearch.length; i++){
			var searchResult = {};
			//searchResult.startdate = taskSearch[i].getValue(columns[0]);
			searchResult.starttime = taskSearch[i].getValue(columns[1]).toLowerCase();
			searchResult.vacancy = taskSearch[i].getValue(columns[2]);
			output[searchResult.starttime] = searchResult.vacancy;
		}
		nlapiLogExecution('DEBUG','Results in JSON',JSON.stringify(output));
		return output;
	}
	nlapiLogExecution('AUDIT','Search Results','No result is found');
	return;
}
function updateTrialFit(datain){
	//nlapiLogExecution('DEBUG','Request headertype','POST');
	//nlapiLogExecution('DEBUG','Content',JSON.stringify(datain));
	
	//update trial fit
	var task = nlapiLoadRecord('task',datain.taskid);
	task.setFieldValue('startdate',datain.startdate);
	task.setFieldValue('duedate',datain.startdate);
	task.setFieldValue('starttime',datain.starttime);
	task.setFieldValue('endtime',datain.endtime);
	var salesOrderId = task.getFieldValue('custevent1');
	nlapiSubmitRecord(task);
	nlapiLogExecution('AUDIT','Task updated',task.getId());
	//update sales order
	if (salesOrderId !=''){
		var salesOrder = nlapiLoadRecord('salesorder',salesOrderId);
		salesOrder.setFieldValue('custbodyfittingdate',datain.startdate);
		salesOrder.setFieldText('custbodyfittime',datain.starttime);
		salesOrder.setFieldText('custbodyfittimeto',datain.endtime);
		nlapiSubmitRecord(salesOrder);		
		nlapiLogExecution('AUDIT','Sales Order updated',"id:"+salesOrderId+", tranid:"+salesOrder.getFieldValue('tranid'));
	}
	
	var output = {};
	output.type = 'post';
	return output;
}

