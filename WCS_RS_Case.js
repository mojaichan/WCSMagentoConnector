/** Developed by David@Fern for William Cheng & Son during 2014
 *  Functions called by website to retrieve information from Netsuite.
 */

function getCustomerInfo(datain){
	//getRequestID - custid
	var output ='';
	if (!datain.custid){
		output.isSuccess = false;
		output.err_code = 'MISSING_ARGUMENT';
		nlapiLogExecution('ERROR','MISSING_ARGUMENT','No argument custid');
		return output;
	}
	var recCustomer = nlapiLoadRecord('customer',datain.custid);
	var Customer = new Object();
	Customer.entityid = recCustomer.getFieldValue('entityid');
	Customer.name = recCustomer.getFieldValue('firstname') + " " + recCustomer.getFieldValue('lastname');
	Customer.email = recCustomer.getFieldValue('email');
	Customer.phone = recCustomer.getFieldValue('phone');
	if (Customer.phone === null){
		Customer.phone = '';
	}
	var shippingLine = recCustomer.findLineItemValue('addressbook','defaultshipping','T');
	Customer.shipaddress = recCustomer.getLineItemValue('addressbook','addrtext',shippingLine);
	Customer.isSuccess = true;
	nlapiLogExecution('AUDIT','Complete Run','Data fetched by customer id: '+ datain.custid);
	return Customer;
}

function createCase(datain){
	var recCase = nlapiCreateRecord('supportcase');
	//var recCase = nlapiLoadRecord('supportcase','5781');
	if (!datain.custid || !datain.case_subtype){
		return;
	}
	recCase.setFieldValue('company',datain.custid);
	recCase.setFieldValue('email',datain.email);
	recCase.setFieldValue('phone',datain.phone);
	recCase.setFieldValue('category',datain.case_type);
	recCase.setFieldValue('custevent_case_submenu',datain.case_subtype);
	recCase.setFieldValue('title',datain.title);
	switch(datain.case_subtype){ //before submit codes
		case "13":
			recCase.setFieldValue('customform','53'); //custom form id for place order
			recCase.setFieldValue('custevent_case_photo1',datain.custevent_case_photo1);
			recCase.setFieldValue('custevent_case_photo2',datain.custevent_case_photo2);
			recCase.setFieldValue('custevent_case_photo3',datain.custevent_case_photo3);
			recCase.setFieldValue('custevent_case_upload_file',datain.custevent_case_upload_file);
			
			break;
		case "1":
			recCase.setFieldValue('customform','54'); //customform id for request swatches
			recCase.setFieldValue('custevent_case_product_type',datain.custevent_case_product_type);
			recCase.setFieldValue('custevent_case_swatches_color',datain.custevent_case_swatches_color);
			recCase.setFieldValue('custevent_case_swatches_pattern',datain.custevent_case_swatches_pattern);
			recCase.setFieldValue('custevent_case_swatches_material',datain.custevent_case_swatches_material);
			recCase.setFieldValue('custevent_case_swatches_brand',datain.custevent_case_swatches_brand);
			recCase.setFieldValue('custevent_case_swatch_type',datain.custevent_case_swatch_type);
			recCase.setFieldValue('custevent_case_other_desc',datain.custevent_case_other_desc);
			recCase.setFieldValue('custevent_case_catalogue_mail_address',datain.custevent_case_catalogue_mail_address);
			recCase.setFieldValue('custevent_case_catalogue_name',datain.custevent_case_catalogue_name);
			break;
		case "14":
			recCase.setFieldValue('customform','52'); //customform id for order progress
			recCase.setFieldValue('custeventcasedetails',datain.custeventcasedetails);
			recCase.setFieldValue('custevent_case_other_desc',datain.custevent_case_other_desc);
			break;
		case "15":
			recCase.setFieldValue('customform','64'); //customform id for alteration with no amend
			break;
		case "18":
			recCase.setFieldValue('customform','5'); //customform id for general inquiry
			recCase.setFieldValue('custeventcasedetails',datain.custeventcasedetails);
			break;
		case "21":
			recCase.setFieldValue('customform','61'); //customform id for complaint
			recCase.setFieldValue('custevent_case_complaint_type',datain.custevent_case_complaint_type);
			recCase.setFieldValue('custevent_case_request',datain.custevent_case_request);
			recCase.setFieldValue('custevent_case_complaint_detail',datain.custevent_case_complaint_detail);
			recCase.setFieldValue('custevent_case_photo1',datain.custevent_case_photo1);
			recCase.setFieldValue('custevent_case_photo2',datain.custevent_case_photo2);
			recCase.setFieldValue('custevent_case_photo3',datain.custevent_case_photo3);
			break;
		case "22":
			recCase.setFieldValue('customform','67'); //customform id for change measurement
			recCase.setFieldValue('custevent_case_chmeas_increase_decrease',datain.custevent_case_chmeas_increase_decrease);
			recCase.setFieldValue('custevent_case_chmeas_weight_change',datain.custevent_case_chmeas_weight_change);
			recCase.setFieldValue('custevent_case_chmeas_change_neck',datain.custevent_case_chmeas_change_neck);
			recCase.setFieldValue('custevent_case_chmeas_neck_inch',datain.custevent_case_chmeas_neck_inch);
			recCase.setFieldValue('custevent_case_chmeas_change_chest',datain.custevent_case_chmeas_change_chest);
			recCase.setFieldValue('custevent_case_chmeas_chest_inch',datain.custevent_case_chmeas_chest_inch);
			recCase.setFieldValue('custevent_case_chmeas_change_waist',datain.custevent_case_chmeas_change_waist);
			recCase.setFieldValue('custevent_case_chmeas_waist_inch',datain.custevent_case_chmeas_waist_inch);
			recCase.setFieldValue('custevent_case_chmeas_change_hip',datain.custevent_case_chmeas_change_hip);
			recCase.setFieldValue('custevent_case_chmeas_hip_inch',datain.custevent_case_chmeas_hip_inch);
			recCase.setFieldValue('custevent_case_photo1',datain.custevent_case_photo1);
			recCase.setFieldValue('custevent_case_photo2',datain.custevent_case_photo2);
			recCase.setFieldValue('custevent_case_photo3',datain.custevent_case_photo3);
			
			break;
		default:
			nlapiLogExecution('DEBUG','casesubtype',datain.case_subtype);
			break;
	}
	var recId = nlapiSubmitRecord(recCase, true);
	recCase = nlapiLoadRecord('supportcase',recId);
	switch(datain.case_subtype){ //after submit codes, required for sublists..
		case "13":
			for (var i=0;i<datain.order_req.length;i++){
				recCase.selectNewLineItem('recmachcustrecord_parent_case_no');
				recCase.setCurrentLineItemValue('recmachcustrecord_parent_case_no','custrecord_orderreq_producttype',datain.order_req[i].custrecord_orderreq_producttype);
				recCase.setCurrentLineItemValue('recmachcustrecord_parent_case_no','custrecord_orderreq_quantity',datain.order_req[i].custrecord_orderreq_quantity);
				recCase.setCurrentLineItemValue('recmachcustrecord_parent_case_no','custrecord_orderreq_fabric_number',datain.order_req[i].custrecord_orderreq_fabric_number);				
				recCase.setCurrentLineItemValue('recmachcustrecord_parent_case_no','custrecord_orderreq_fabricbrand',datain.order_req[i].custrecord_orderreq_fabricbrand);
				recCase.setCurrentLineItemValue('recmachcustrecord_parent_case_no','custrecord_orderreq_fabriccolor',datain.order_req[i].custrecord_orderreq_fabriccolor);
				recCase.setCurrentLineItemValue('recmachcustrecord_parent_case_no','custrecord_orderreq_fabric_pattern',datain.order_req[i].custrecord_orderreq_fabric_pattern);
				recCase.setCurrentLineItemValue('recmachcustrecord_parent_case_no','custrecord_orderreq_fabricmaterial',datain.order_req[i].custrecord_orderreq_fabricmaterial);
				recCase.setCurrentLineItemValue('recmachcustrecord_parent_case_no','custrecord_orderreq_otherreq',datain.order_req[i].custrecord_orderreq_otherreq);
				recCase.setCurrentLineItemValue('recmachcustrecord_parent_case_no','custrecord_orderreq_expdate',datain.order_req[i].custrecord_orderreq_expdate);
				recCase.commitLineItem('recmachcustrecord_parent_case_no');
			}
			nlapiSubmitRecord(recCase, true);
			break;
		case "15":
		case "21":
			for (var i=0;i<datain.complaint_item.length;i++){
				recCase.selectNewLineItem('recmachcustrecord_case_id');
				recCase.setCurrentLineItemValue('recmachcustrecord_case_id','custrecord_com_product',datain.complaint_item[i].custrecord_com_product);
				recCase.setCurrentLineItemValue('recmachcustrecord_case_id','custrecord_com_quantity',datain.complaint_item[i].custrecord_com_quantity);
				recCase.setCurrentLineItemValue('recmachcustrecord_case_id','custrecord_com_problem_part',datain.complaint_item[i].custrecord_com_problem_part);
				recCase.setCurrentLineItemValue('recmachcustrecord_case_id','custrecord_com_mea_change',datain.complaint_item[i].custrecord_com_mea_change);
				recCase.setCurrentLineItemValue('recmachcustrecord_case_id','custrecord_com_others',datain.complaint_item[i].custrecord_com_others);
				recCase.setCurrentLineItemValue('recmachcustrecord_case_id','custrecord_com_so_num',datain.complaint_item[i].custrecord_com_so_num);
				recCase.commitLineItem('recmachcustrecord_case_id');
			}
			nlapiSubmitRecord(recCase, true);
			break;
	}
	if (recId !== null && recId !== undefined){
		var dataout = {};
		dataout.isSuccess = true;
		dataout.casenumber = recCase.getFieldValue('casenumber');
		nlapiLogExecution('AUDIT','Created a case','Customer Id: '+datain.custid+' has created a case '+dataout.casenumber);
		return dataout;
	}
	return datain;
}