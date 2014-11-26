function UE_BS_Connector_Item_Fabric(type){
	/*
	This is a user-event script function, deployed on items
	This will post saved fabric item to Magento if criteria is met.
	*/
	if (type == 'create'){
		//this script doesn't execute during item create
		return;
	}
	if (type == 'edit'){
		
		var isPostToMagento = nlapiGetFieldValue('custitem_fern_mage_ispost');
		if (!isPostToMagento || isPostToMagento == 'F'){ //exit if this item is not require to post
			return;
		}
		
		var isFabric = nlapiGetFieldValue('custitemfabric');
		if (!isFabric || isFabric == 'F'){ //exit if this item is not a fabric
			return;
		}
		
		var connectorAction = 'edit';
		var magentoId = nlapiGetFieldValue('custitem_fern_mage_itemid');
		if (!magentoId || magentoId == ''){
			connectorAction = 'create';
		} 
		nlapiLogExecution('DEBUG','connectorAction',connectorAction);
		var thisItemType = nlapiGetRecordType();
		var thisMatrixType = nlapiGetFieldValue('matrixtype');		
		//nlapiLogExecution('DEBUG','item type',thisItemType);
		//nlapiLogExecution('DEBUG','Matrix type',thisMatrixType);
		
		if (thisItemType == 'inventoryitem'){
			var thisItem = {};
			if (thisMatrixType == null || thisMatrixType =='child' || thisMatrixType == '') {
				
				//item info essential export
				thisItem = Lib_UE_getItemInformation(thisItem);
								
				//pricing export
				thisItem.prices = Lib_UE_getItemPrice();
				
				//attribute sets?
				thisItem = Lib_UE_getFabricInformation(thisItem);
				
				//image export checked
				var isExportImage = nlapiGetFieldValue('custitem_fern_mage_export_image');
				//nlapiLogExecution('DEBUG','isExportImage',isExportImage);
				if (isExportImage == 'T'){
					thisItem = Lib_UE_getItemImage(thisItem);
				}
				
				
				nlapiLogExecution('DEBUG','Request Body Json',JSON.stringify(thisItem));
			} else {
				nlapiLogExecution('DEBUG','Matrix if','this is a parent matrix');
			}
			//shoot HttpRequest for Catalog
			var url = "http://ec2-54-79-90-156.ap-southeast-2.compute.amazonaws.com/nsconnector/public/fabric";
			var headers = new Array();
			var requestBody = {};
			requestBody.action = connectorAction;
			requestBody.data = JSON.stringify(thisItem);
			var response = nlapiRequestURL(url,requestBody,headers,"POST");
			nlapiLogExecution('DEBUG','response item',response.getBody());
			//var jsonData = JSON.parse(output.getBody());
			var jsonData;
			try { 
				jsonData = JSON.parse(response.getBody()); 
			} catch (e) {
				return;
			}
			if (jsonData.id && connectorAction == 'create'){
				nlapiSetFieldValue('custitem_fern_mage_itemid',jsonData.id);
				thisItem.product_id = jsonData.id;
			}
			//shoot HttpRequest for Image if required
			if (isExportImage =='T'){
				var url = "http://ec2-54-79-90-156.ap-southeast-2.compute.amazonaws.com/nsconnector/public/fabricimage";
				var headers = new Array();
				var requestBody = {};
				requestBody.action = connectorAction;
				requestBody.data = JSON.stringify(thisItem);
				var response = nlapiRequestURL(url,requestBody,headers,"POST");
				nlapiLogExecution('DEBUG','response image',response.getBody());
				nlapiSetFieldValue('custitem_fern_mage_export_image','F');
			}
		}
		
	}
}

function Lib_UE_getItemImage(item){
	//image export
	item.image = {};
	var baseUrl = 'https://system.netsuite.com';
	var imageInternalId = nlapiGetFieldValue('storedisplayimage');
	nlapiLogExecution('DEBUG','image1 id',imageInternalId);
	if (imageInternalId != '' && imageInternalId != null){
		var file = nlapiLoadFile(imageInternalId);
		if (file.isOnline()){
			item.image.filename = file.getName();
			item.image.filetype = file.getType();
			item.image.url = baseUrl+ file.getURL();
		}
	}
	item.thumbnail ={};
	var thumbInternalId = nlapiGetFieldValue('storedisplaythumbnail');
	if (thumbInternalId != '' && thumbInternalId != null){
		var file = nlapiLoadFile(thumbInternalId);
		if (file.isOnline()){
			item.thumbnail.filename = file.getName();
			item.thumbnail.filetype = file.getType();
			item.thumbnail.url = baseUrl+ file.getURL();
		}
	}
	return item;
}

function Lib_UE_getItemInformation(item){
	/*	Used in UE
		Argument: [Javascript object] item to be updated
		Return value: [Javascript object] updated "item" object
	*/
	item.product_id = nlapiGetFieldValue('custitem_fern_mage_itemid');
	item.sku = nlapiGetFieldValue('itemid');
	item.product_name = nlapiGetFieldValue('displayname');
	item.product_description = nlapiGetFieldValue('salesdescription');
	item.product_type = nlapiGetFieldText('custitemfinalgoodtype');
	
	return item;
}
function Lib_UE_getItemPrice(){
	/*	Used in UE
		Argument: N/A because it takes the current Netsuite item Id
		Return value: [Javascript object] self-formatted price object
	*/
	var price = {};
	var priceID = 'price1'; //base currency of the account
	var normalPriceLevel = 5; // 5 is system-default online price
	//var specialPriceLevel = 16;	//online price
	var quantityLevels = nlapiGetMatrixCount(priceID, 'price');
	var priceLevels = nlapiGetLineItemCount(priceID);
	var normalPriceLineNum = 1;
	for (var i=1;i <= priceLevels;i++){ //search for target price level line in price sublist
		if (nlapiGetLineItemValue(priceID,'pricelevel',i) == normalPriceLevel){
			normalPriceLineNum = i;
			break;
		}
	}
	var onlinePrice = nlapiGetLineItemMatrixValue(priceID,'price',normalPriceLineNum,1);
	//var specialPrice = nlapiGetLineItemMatrixValue(priceID,'price',specialPriceLevel,1);
	//nlapiLogExecution('DEBUG','levels','quantity: '+quantityLevels+', prices:'+priceLevels);
	price.normal_price = onlinePrice;
	//price.special_price = specialPrice;
	return price;
}
function Lib_UE_getFabricInformation(item){
	item.history_code = nlapiGetFieldValue('custitemhistorycode');
	item.fabric_brand = nlapiGetFieldText('custitem_brand');
	item.fabric_color = nlapiGetFieldText('custitem_maincolor');
	item.material = nlapiGetFieldText('custitem_materials');
	item.fabric_pattern = nlapiGetFieldText('custitem_patternstyle');
	return item;
}