/** Written by David@Fern for WCS website functions.
 *  Rest API for Task record in Netsuite.
 */
 
 function createAppointment(datain){
	/* 
		This is RestLET function which receives JSON data from Magento.
		It creates a task record in Netsuite 
	*/
	if (!datain.booking_id){
		return false;
	}
	var recTask = nlapiCreateRecord('task');
	//var recTask = nlapiLoadRecord('task','9305');
	recTask.setFieldValue('timedevent','T');
	recTask.setFieldValue('assigned',61155);	// assign to specific calendar
	recTask.setFieldValue('custeventtasktype',1); //appointment type
	recTask.setFieldValue('title', datain.first_name +' '+datain.last_name + '(Appointment)');
	recTask.setFieldValue('startdate',datain.booking_date);
nlapiLogExecution('DEBUG','datain:booking',datain.booking_date);
nlapiLogExecution('DEBUG','GET date',recTask.getFieldValue('startdate'));
	recTask.setFieldValue('starttime',datain.booking_time_from);
	recTask.setFieldValue('endtime',datain.booking_time_to);
	recTask.setFieldValue('message',datain.message_us);
	recTask.setFieldValue('custevent_fern_connector_magentoid',datain.booking_id);
	recTask.setFieldValue('custevent_fern_booking_delete_url',datain.delete_url);
	nlapiLogExecution('DEBUG','Delete URL',datain.delete_url);
	var customerRec = nlapiSearchRecord('customer', null, new nlobjSearchFilter('entityid', null, 'is', datain.customer_id));
	if (customerRec != null){
		recTask.setFieldValue('company',customerRec[0].getId());
		
	nlapiLogExecution('DEBUG','Customer Internal ID',customerRec[0].getId());
	}
	nlapiLogExecution('DEBUG','Customer ID',datain.customer_id);
	var taskId = nlapiSubmitRecord(recTask);
	nlapiLogExecution('AUDIT','Task Created','tasking ID: '+ taskId);
	var task = {};
	task.code = "200";
	task.id = taskId;
	return task;
 }
 function getAppointment(datain){
	nlapiLogExecution('AUDIT','Task GET','tasking ID '+ datain.netsuite_internalid + ' is deleted');
 }
 function deleteAppointment(datain){
	/* 
		This is RestLET function which receives JSON data from Magento.
		It delete a record in Netsuite.
	*/
	nlapiLogExecution('DEBUG','Enter Delete',JSON.stringify(datain));
	if (datain.netsuite_internalid){
		nlapiLogExecution('AUDIT','Task Delete','tasking ID '+ datain.netsuite_internalid + ' is deleted');
	nlapiLogExecution('AUDIT','Delete Booking','Magento Appointment '+datain.booking_id +' is deleted');
	nlapiDeleteRecord('task',datain.netsuite_internalid);
	}	
 }
 
 function createMagnetoBooking_AS(type){
	/*
		This is a Netsuite user event - after submit function.
		When a task is saved and has met specific criteria, this scripts calls external URI to create booking in Magento
	*/
	if (type == 'create' || type =='edit'){
		if (nlapiGetFieldValue('custevent_fern_post_magento') == 'T' && nlapiGetFieldValue('custevent_fern_post_magento') !== "" ){
			var url = "http://ec2-54-79-90-156.ap-southeast-2.compute.amazonaws.com/wcs_magento/testapi.php";
			var headers = new Array();
			var booking = {};
			
			booking.netsuite_internalid = nlapiGetRecordId();
			booking.booking_date = nlapiGetFieldValue('startdate');
			booking.booking_time = nlapiGetFieldValue('starttime');
			booking.message_us =nlapiGetFieldValue('message');
			var customerInternalid = nlapiGetFieldValue('company');
			var customer = nlapiLoadRecord('customer',customerInternalid);
			booking.customer_id = customer.getFieldValue('entityid');
			booking.first_name =customer.getFieldValue('firstname');
			booking.last_name =customer.getFieldValue('lastname');
			
			var output = nlapiRequestURL(url,booking,headers,"POST");
			nlapiLogExecution('DEBUG','date',booking.booking_date);
			nlapiLogExecution('DEBUG','response',output.getBody());
			if (output.getBody() != ""){
				var jsonData = JSON.parse(output.getBody());
				// set Task record field
				var thisrecord = nlapiLoadRecord('task',nlapiGetRecordId());
				thisrecord.setFieldValue('custevent_fern_connector_magentoid',jsonData.booking_id);
				thisrecord.setFieldValue('custevent_fern_booking_delete_url',jsonData.delete_url);
				nlapiSubmitRecord(thisrecord);
			}
		}
		
	}
 }