///<reference path="MfsNsIntelliSense.min.js"/> 
/*****************************************************
    This function is a module to add a button for launching the 
    Pacejet Sales Order Integration Workflow
*/
var bundleversion = '6.3.1';
var currentContext = nlapiGetContext();
var scripttype = 'so';

//#region Properties
var custscript_pacejet_useparentshipto = 'custscript_pacejet_' + scripttype + '_squseparentship';
var custscript_pacejet_defaultdeclaredvalue = 'custscript_pacejet_' + scripttype + '_sqdefdeclaredvalue';
var custscript_pacejet_defaultpackagenumber = 'custscript_pacejet_' + scripttype + '_spdefpackage';
var custscript_pacejet_location = 'custscript_pacejet_' + scripttype + '_location';
var custscript_pacejet_upsref1 = 'custscript_pacejet_' + scripttype + '_upsref1';
var custscript_pacejet_upsref2 = 'custscript_pacejet_' + scripttype + '_upsref2';
var custscript_pacejet_fedexcustref = 'custscript_pacejet_' + scripttype + '_fedexcustref';
var custscript_pacejet_fedexponum = 'custscript_pacejet_' + scripttype + '_fedexponum';
var custscript_pacejet_fedexinvnum = 'custscript_pacejet_' + scripttype + '_fedexinvnum';
var custscript_pacejet_useassemblyitems = 'custscript_pacejet_' + scripttype + '_useassemblyitems'
var custscript_pacejet_defquantityuom = 'custscript_pacejet_' + scripttype + '_defquantityuom';
var custscript_pacejet_defweightuom = 'custscript_pacejet_' + scripttype + '_defweightuom';
var custscript_pacejet_includeitemtypes = 'custscript_pacejet_' + scripttype + '_includeitemtypes';
var custscript_pacejet_excludeitemtypes = 'custscript_pacejet_' + scripttype + '_excludeitemtypes';
var custscript_pacejet_defshipfromloc = 'custscript_pacejet_' + scripttype + '_defshipfromloc';
var custscript_pacejet_locationfield = 'custscript_pacejet_' + scripttype + '_locationfield';
var custscript_pacejet_customitemflds = 'custscript_pacejet_' + scripttype + '_customitemflds';
var custscript_pacejet_customtransflds = 'custscript_pacejet_' + scripttype + '_customtransflds';
var custscript_pacejet_customitmflds = 'custscript_pacejet_' + scripttype + '_customitmflds';
var custscript_pacejet_customtranflds = 'custscript_pacejet_' + scripttype + '_customtranflds';
var custscript_pacejet_windowname = 'custscript_pacejet_' + scripttype + '_windowname';
var custscript_pacejet_sso = 'custscript_pacejet_' + scripttype + '_sso';
var custscript_pacejet_openconnector_url = 'custscript_pacejet_openconnector_url';
var custscript_pacejet_usewms = 'custscript_pacejet_' + scripttype + '_useebiz';
var custscript_pacejet_license = 'custscript_pacejet_' + scripttype + '_license';
var custscript_pacejet_useuom = 'custscript_pacejet_' + scripttype + '_useuom';
var custscript_pacejet_setcustoverride = 'custscript_pacejet_' + scripttype + '_setcustoverride';

var cache = {};

var recordType = null;
var URLSetting;

//Deployment Parameters
var useassemblyitems = 'F';
var defunituom = 'EA';
var defweightuom = 'LB';
var includeitemtypes = '';
var excludeitemtypes = '';
var defshipfromloc = 'Netsuite_Static';
var defupsref1 = 'memo';
var defupsref2 = 'salesorder.tranid';
var deffedexcustref = 'memo';
var deffedexponum = 'salesorder.otherrefnum';
var deffedexinvnum = 'salesorder.tranid';
var defdeclaredvalue = 'CALCULATE';
var defpackagenumber = null;
var deflocation = '';
var deflocationfield = 'location';
var defuseparentshipto = 'F';
var defnamedwindow = 'F';
var defgetcustomitemfields = 'F';
var defgetcustomtransfields = 'F';
var defcustomitemfields = '';
var defcustomtranfields = '';
var defusewms = 'F';
var license = '';
var useUOMs = 'F';
var orderType = '';
var addr = null;

var custominventoryfields = null;
var record = null;
var createdFrom = null;
var inventoryitems = null;
var UOMs = null;
var Location = '';

var UOMfeature = currentContext.getFeature('unitsofmeasure');
var barcodesFeature = currentContext.getFeature('barcodes');
var SerializedFeature = currentContext.getFeature('serializedinventory') || currentContext.getFeature('lotnumberedinventory');
var AssemblyFeature = currentContext.getFeature('assemblies') || currentContext.getFeature('matrixitems');
var OneWorld = currentContext.getFeature('subsidiaries');
//#endregion Properties

function customizeUI_SalesOrderBeforeLoad(type, form) {
    try {
        currentContext = nlapiGetContext();
        URLSetting = parseUri(currentContext.getSetting('SCRIPT', custscript_pacejet_openconnector_url));
        var URL = URLSetting.protocol + '://' + URLSetting.host + '/OpenConnector/ClientIntegrationMain-JSONPEndpoint.asmx/ImportDataViaImportEntityXmlPost';

        //Import JS file
        form.setScript(getScriptID('jQuery'));
        form.setScript(getScriptID('Pacejet Button Click'));

        //Execute the logic only when viewing an Item Fulfillment with the browser UI
        if (type == 'view' && currentContext.getExecutionContext() == 'userinterface') {

            var currentId = nlapiGetRecordId();
            recordType = nlapiGetRecordType();

            var orderStatus = nlapiLookupField('salesorder', currentId, 'status');

            var buttonId = null;
            var buttonLabel = null;
            var buttonScript = null;
            var xml = null;

            defnamedwindow = getSetting(custscript_pacejet_windowname, defnamedwindow);
            defgetcustomitemfields = getSetting(custscript_pacejet_customitemflds, defgetcustomitemfields);
            defgetcustomtransfields = getSetting(custscript_pacejet_customtransflds, defgetcustomtransfields);
            defcustomitemfields = getSetting(custscript_pacejet_customitmflds, defcustomitemfields);
            defcustomtranfields = getSetting(custscript_pacejet_customtranflds, defcustomtranfields);

            defunituom = getSetting(custscript_pacejet_defquantityuom, defunituom);
            defweightuom = getSetting(custscript_pacejet_defweightuom, defweightuom);
            includeitemtypes = getSetting(custscript_pacejet_includeitemtypes, includeitemtypes);
            excludeitemtypes = getSetting(custscript_pacejet_excludeitemtypes, excludeitemtypes);
            defshipfromloc = getSetting(custscript_pacejet_defshipfromloc, defshipfromloc);
            deflocationfield = getSetting(custscript_pacejet_locationfield, deflocationfield);
            defusewms = getSetting(custscript_pacejet_usewms, defusewms);
            license = getSetting(custscript_pacejet_license, license);
            useUOMs = getSetting(custscript_pacejet_useuom, useUOMs);

            Location = getSetting(custscript_pacejet_location, deflocation);
            var ssourl = (getSetting(custscript_pacejet_sso) == 'T' ? nlapiOutboundSSO('customsso_pacejet').replace('[PORTAL]', getSetting(custscript_pacejet_location, deflocation)) : '');

            //Create and Add Freight Quote button
            if (currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_show_freightquote') === 'T') {

                buttonLabel = currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_freightquote_text');
                buttonId = 'custpage_pacejet_rate_integration';

                if (currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_speedintegration') == 'T') {

                    xml = getXmlRecord("FreightQuoteImport", nlapiGetRecordType(), nlapiGetRecordId());
                    buttonScript = "pj_ButtonClickSpeedInt(this, '" + URL + "','" + escape(xml) + "', true, " + (defnamedwindow == 'T' ? 'true' : 'false') + ", '" + ssourl + "', '" + Location + "', " + currentId + ", false, '" + license + "')";
                } else {
                    buttonScript = "pj_ButtonClick(this,'" + currentContext.getSetting('SCRIPT', 'custscript_pacejet_openconnector_url') + "Method=FreightQuoteImport&SubMethod=SalesOrder&TransactionID=" + currentId + "&ExternalTransactionID=" + currentId + "',true, " + (defnamedwindow == 'T' ? 'true' : 'false') + ", '" + Location + "', " + currentId + ", false, '" + license + "')";
                }
                form.addButton(buttonId, buttonLabel, buttonScript);
            }

            if (orderStatus.toUpperCase().indexOf('FULFILL') != -1) {

                //Create and Add Ship Button
                if (currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_show_ship') === 'T') {
                    buttonId = 'custpage_pacejet_ship_integration';
                    buttonLabel = currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_ship_text');

                    if (currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_speedintegration') == 'T') {
                        xml = getXmlRecord("ShipImport", nlapiGetRecordType(), nlapiGetRecordId());
                        buttonScript = "pj_ButtonClickSpeedInt(this, '" + URL + "','" + escape(xml) + "', true, " + (defnamedwindow == 'T' ? 'true' : 'false') + ", '" + ssourl + "', '" + Location + "', " + currentId + ", false, '" + license + "')";
                    } else {
                        buttonScript = "pj_ButtonClick(this,'" + currentContext.getSetting('SCRIPT', 'custscript_pacejet_openconnector_url') + "Method=ShipImport&SubMethod=SalesOrder&Action=&TransactionID=&ExternalTransactionID=" + currentId + "', false, " + (defnamedwindow == 'T' ? 'true' : 'false') + ", '" + Location + "', " + currentId + ", false, '" + license + "')";
                    }

                    form.addButton(buttonId, buttonLabel, buttonScript);
                }

                //Create and Add Push Button
                if (currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_show_push') === 'T') {
                    buttonId = 'custpage_pacejet_ship_integration_push';
                    buttonLabel = currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_push_text');

                    if (currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_speedintegration') == 'T') {
                        xml = getXmlRecord("ShipImport", nlapiGetRecordType(), nlapiGetRecordId(), 'Push');
                        buttonScript = "pj_ButtonClickSpeedInt(this, '" + URL + "','" + escape(xml) + "', true, " + (defnamedwindow == 'T' ? 'true' : 'false') + ", '" + ssourl + "', '" + Location + "', " + currentId + ", false, '" + license + "')";
                    } else {
                        buttonScript = "pj_ButtonClick(this,'" + currentContext.getSetting('SCRIPT', 'custscript_pacejet_openconnector_url') + "Method=ShipImport&SubMethod=SalesOrder&Action=Push&TransactionID=&ExternalTransactionID=" + currentId + "', true, " + (defnamedwindow == 'T' ? 'true' : 'false') + ", '" + Location + "', " + currentId + ", false, '" + license + "')";
                    }

                    form.addButton(buttonId, buttonLabel, buttonScript);
                }

                //Create and Add AutoShip Button
                if (currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_show_autoship') === 'T') {
                    buttonId = 'custpage_pacejet_ship_integration_auto';
                    buttonLabel = currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_autoship_text');

                    if (currentContext.getSetting('SCRIPT', 'custscript_pacejet_' + scripttype + '_speedintegration') == 'T') {
                        xml = getXmlRecord("ShipImport", nlapiGetRecordType(), nlapiGetRecordId(), 'AutoShip');
                        buttonScript = "pj_ButtonClickSpeedInt(this, '" + URL + "','" + escape(xml) + "', true, " + (defnamedwindow == 'T' ? 'true' : 'false') + ", '" + ssourl + "', '" + Location + "', " + currentId + ", true, '" + license + "')";
                    } else {
                        buttonScript = "pj_ButtonClick(this,'" + currentContext.getSetting('SCRIPT', 'custscript_pacejet_openconnector_url') + "Method=ShipImport&SubMethod=SalesOrder&Action=AutoShip&TransactionID=&ExternalTransactionID=" + currentId + "', true, " + (defnamedwindow == 'T' ? 'true' : 'false') + ", '" + Location + "', " + currentId + ", true, '" + license + "')";
                    }

                    form.addButton(buttonId, buttonLabel, buttonScript);
                }

                if (xml != null) {
                    form.addField('custpage_pacejet_xml', 'longtext', 'Xml', null).setDisplayType('hidden');
                    nlapiSetFieldValue('custpage_pacejet_xml', xml);
                }
            }
        }

        // Adding in support for new customer driven transaction record to populate PJ fields that are over ridden by custome record.
        // ESS (12/23/2016)
        if (type == 'create' && nlapiGetFieldValue('entity') != null) {
            if (getSetting(custscript_pacejet_setcustoverride)==='T') {
                try {

                    var customerOverrideRec = nlapiLoadRecord('customer', nlapiGetFieldValue('entity'));
                    var shipvia_override = customerOverrideRec.getFieldValue('custentity_pacejet_shipvia_override');
                    var freight_term_override = customerOverrideRec.getFieldValue('custentity_pacejet_freight_term_override');
                    var freight_acct_override = customerOverrideRec.getFieldValue('custentity_pacejet_freightacctoverride');

                    if (nlapiGetFieldValue('shipmethod') == null) {

                        if (shipvia_override != null && shipvia_override != '') {
                            nlapiSetFieldValue('custbody_pacejet_sps_updated', 'F');
                            nlapiSetFieldValue('shipcarrier', 'nonups', true);
                            nlapiSetFieldValue('shipmethod', shipvia_override);
                        }
                    }

                    if (nlapiGetFieldValue('custbody_pacejet_freight_terms') == null) {
                        if (freight_term_override != null && freight_term_override != '') {
                            nlapiSetFieldValue('custbody_pacejet_freight_terms', freight_term_override);
                        }
                    }
                    if (nlapiGetFieldValue('custbody_pacejet_freightacctoverride') == null) {
                        if (freight_acct_override != null) {
                            nlapiSetFieldValue('custbody_pacejet_freightacctoverride', freight_acct_override);
                        }
                    }

                } catch (error) {
                    nlapiLogExecution('ERROR', "BeforeLoad Error", JSON.stringify(error));
                }
            }

        }
    } catch (e) {
        err = getErrorDetails(e);
        nlapiLogExecution('ERROR', 'Sales Order Exception', JSON.stringify(err));
    }
}

function getScriptID(script_name) {
    //Add script to UI
    var scriptID = 0;
    var filters = new Array();
    filters.push(new nlobjSearchFilter('name', null, 'is', script_name));
    var file = nlapiSearchRecord('script', null, filters, null);
    if (file != null) {
        scriptID = file[0].getId()
        return scriptID;
    }
    return null;
}

function getXmlRecord(method, recordType, currentId, action) {
    if (record == null)
        record = nlapiLoadRecord(recordType, currentId);

    if (createdFrom == null) {
        orderType = record.getFieldValue('ordertype');
        switch (orderType) {
            case 'TrnfrOrd':
                orderType = 'transferorder';
                break;
            case 'SalesOrd':
                orderType = 'salesorder';
                break;
            default:
                if (recordType == 'purchaseorder') {
                    orderType = 'salesorder';
                }

        }
        createdFrom = (record.getFieldValue('createdfrom') != null ? nlapiLoadRecord((recordType == 'salesorder' ? 'estimate' : orderType), record.getFieldValue('createdfrom')) : null);
    }

    if (custominventoryfields == null && defgetcustomitemfields == 'T') {
        custominventoryfields = new Array();
        inventoryrecord = nlapiCreateRecord('inventoryitem');
        inventoryfields = inventoryrecord.getAllFields();
        for (var i = 0; i < inventoryfields.length; i++) {
            var inventoryfield = inventoryfields[i];
            if ((defcustomitemfields == '' && inventoryfield != null && inventoryfield.substring(0, 8) == 'custitem' && inventoryfield.indexOf('subtab') == -1) || defcustomitemfields.split(',').indexOf(inventoryfield) > -1) {
                custominventoryfields.push(inventoryfield);
            }
        }
    }

    if (UOMfeature && useUOMs == 'T')
        getUOMs();

    //set the salesOrderRecord to itself if this is a Sales Order or Estimate otherwise, use the original createdFrom (item fulfillment)
    var salesOrderRecord = createdFrom;
    if (recordType == 'salesorder' || recordType == 'estimate' || (recordType == 'purchaseorder' && createdFrom == null)) {
        salesOrderRecord = record;
    }

    var UseParentShipToIfAvailable = getSetting(custscript_pacejet_useparentshipto, defuseparentshipto) == 'T';
    var DefaultDeclaredValue = getSetting(custscript_pacejet_defaultdeclaredvalue, defdeclaredvalue);
    var defaultPackageNumber = getSetting(custscript_pacejet_defaultpackagenumber, defpackagenumber);

    var upsRef1 = getSetting(custscript_pacejet_upsref1, defupsref1);
    var upsRef2 = getSetting(custscript_pacejet_upsref2, defupsref2);
    var fedexcustref = getSetting(custscript_pacejet_fedexcustref, deffedexcustref);
    var fedexponum = getSetting(custscript_pacejet_fedexponum, deffedexponum);
    var fedexinvnum = getSetting(custscript_pacejet_fedexinvnum, deffedexinvnum);

    var TransactionGUID = (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());

    var sLocationID = getTransactionField(deflocationfield, record, salesOrderRecord, true);

    var xmlHeader = '<?xml version="1.0" encoding="utf-8"?><ImportEntity>';
    if (recordType == 'salesorder' && method == 'ShipImport')
        xmlHeader += '<TransactionID></TransactionID>';
    else
        xmlHeader += '<TransactionID>' + currentId + '</TransactionID>';
    xmlHeader += '<ExternalTransactionID>' + currentId + '</ExternalTransactionID>';
    xmlHeader += '<Method>' + method + '</Method>';
    xmlHeader += '<SubMethod>' + recordType + '</SubMethod>';
    xmlHeader += '<TransactionGUID>' + TransactionGUID + '</TransactionGUID>';
    if (action == null)
        xmlHeader += '<Action/>';
    else
        xmlHeader += '<Action>' + action + '</Action>';
    xmlHeader += '<Location>' + Location + '</Location>';
    xmlHeader += '<ContextKey>NetSuite ' + method + ' ' + recordType + ' suitescript ' + currentContext.getExecutionContext() + ' ' + bundleversion + '</ContextKey>';

    var xmlDestination = '<Destination>';
    xmlDestination += '<LocationType>Customer</LocationType>';
    xmlDestination += '<LocationSite>MAIN</LocationSite>';

    var defaultEmail = null;
    var defaultPhone = null;
    var cust = null;
    var vendor = null;
    var freightAccountOverride = record.getFieldValue('custbody_pacejet_freightacctoverride');
    addr = null;

    try {
        cust = nlapiLoadRecord('customer', record.getFieldValue('entity'));
    } catch (e) {
      /*
        //ASS 1 - Siempre son customers, cargables
        if (orderType != 'transferorder' && recordType != 'purchaseorder')
            cust = nlapiLoadRecord('job', record.getFieldValue('entity'));
        else if (recordType == 'purchaseorder') {

            vendor = getAddressBookByType('vendor', record.getFieldValue('entity'), null);

            if (record.getFieldValue('specord') == null && record.getFieldValue('dropshipso') == null) {
                var companyInfo = nlapiLoadConfiguration('companyinformation');
                defaultEmail = companyInfo.getFieldValue('email');
                defaultPhone = companyInfo.getFieldValue('phone');
                if (record.getFieldValue('location') != null) {
                    sLocationID = record.getFieldValue('location');
                    xmlDestination = xmlDestination.replace('<LocationType>Customer</LocationType>', '<LocationType>Facility</LocationType>')
                    var loc = nlapiLoadRecord('location', record.getFieldValue('location'));
                    defaultPhone = loc.getFieldValue('addrphone');
                } else {
                    addr = new Object();
                    addr.internalid = "Company_Address";
                    addr.attention = companyInfo.getFieldValue('email');
                    addr.addressee = companyInfo.getFieldValue('email');
                    addr.phone = defaultPhone;
                    addr.addr1 = companyInfo.getFieldValue('shippingaddress1');
                    addr.addr2 = companyInfo.getFieldValue('shippingaddress2');
                    addr.addr3 = companyInfo.getFieldValue('shippingaddress3');
                    addr.city = companyInfo.getFieldValue('shippingcity');
                    addr.state = companyInfo.getFieldValue('shippingstate');
                    addr.zip = companyInfo.getFieldValue('shippingzip');
                    addr.country = companyInfo.getFieldValue('shippingcountry');
                    addr.isresidential = false;
                    addr.email = defaultEmail;
                }
            } else {
                cust = nlapiLoadRecord('customer', salesOrderRecord.getFieldValue('entity'));
                defaultEmail = cust.getFieldValue('email');
            }

        } else {
            cust = nlapiLoadRecord('location', record.getFieldValue('transferlocation'));
            defaultPhone = cust.getFieldValue('addrphone');
        }*/
    }

    //ASS 2 - Tienen siempre teléfono y mail las addresses.
    //defaultEmail = defaultEmail == null ? record.getFieldValue('email') != null ? record.getFieldValue('email') : cust.getFieldValue('email') : defaultEmail;
    //defaultPhone = defaultPhone == null && cust != null ? cust.getFieldValue('phone') : defaultPhone;


    //ASS 3 - Tienen siempre teléfono y mail las addresses.
    var cust_parent_link = record.getFieldValue('custbody_pacejet_cust_parent_link') != null ? record.getFieldValue('custbody_pacejet_cust_parent_link') : (recordType == 'purchaseorder') ? salesOrderRecord.getFieldValue('custbody_pacejet_cust_parent_link') : null;

    //ASS 4- Se usa la current shipping address. Nada de parent shipping

    /*
    if (UseParentShipToIfAvailable && cust_parent_link != null) {
        var customer_parent = new Object();
        customer_parent = nlapiLoadRecord('customer', cust_parent_link);

        if (customer_parent != null) {
            var numberOfAddresses = customer_parent.getLineItemCount('addressbook');

            for (var i = 1; i <= numberOfAddresses; i++) {

                if (customer_parent.getLineItemValue('addressbook', 'defaultshipping', i) == 'T') {
                    addr = new Object();
                    addr.internalid = customer_parent.getLineItemValue('addressbook', 'internalid', i);
                    addr.attention = customer_parent.getLineItemValue('addressbook', 'attention', i);
                    addr.addressee = customer_parent.getLineItemValue('addressbook', 'addressee', i);
                    addr.phone = customer_parent.getLineItemValue('addressbook', 'phone', i);
                    if (addr.phone == null || addr.phone == '')
                        addr.phone = defaultPhone;
                    addr.addr1 = customer_parent.getLineItemValue('addressbook', 'addr1', i);
                    addr.addr2 = customer_parent.getLineItemValue('addressbook', 'addr2', i);
                    addr.addr3 = customer_parent.getLineItemValue('addressbook', 'addr3', i);
                    addr.city = customer_parent.getLineItemValue('addressbook', 'city', i);
                    addr.state = customer_parent.getLineItemValue('addressbook', 'state', i);
                    addr.zip = customer_parent.getLineItemValue('addressbook', 'zip', i);
                    addr.country = customer_parent.getLineItemValue('addressbook', 'country', i);
                    addr.isresidential = customer_parent.getLineItemValue('addressbook', 'isresidential', i);
                    addr.email = customer_parent.getFieldValue('email');
                    break;
                }
            }
            xmlDestination += '<LocationCode>' + addr.internalid + '</LocationCode>';
            xmlDestination += '<CompanyName>' + stringIt(addr.addressee) + '</CompanyName>';
            xmlDestination += '<ContactName>' + stringIt(addr.attention) + '</ContactName>';
            xmlDestination += '<Phone>' + stringIt(addr.phone) + '</Phone>';
            xmlDestination += '<Email>' + stringIt(addr.email) + '</Email>';
            xmlDestination += '<Address1>' + stringIt(addr.addr1) + '</Address1>';
            if (addr.addr2 != null)
                xmlDestination += '<Address2>' + stringIt(addr.addr2) + '</Address2>';
            if (addr.addr3 != null)
                xmlDestination += '<Address3>' + stringIt(addr.addr3) + '</Address3>';
            xmlDestination += '<City>' + stringIt(addr.city) + '</City>';
            xmlDestination += '<StateOrProvinceCode>' + stringIt(addr.state) + '</StateOrProvinceCode>';
            xmlDestination += '<PostalCode>' + stringIt(addr.zip) + '</PostalCode>';
            xmlDestination += '<CountryName>' + stringIt(addr.country) + '</CountryName>';
            xmlDestination += '<Residential>' + (addr.isresidential == 'T') + '</Residential>';
        }
    } else if (record.getFieldValue('shipaddresslist') != null) {

        try {
            if (recordType != 'purchaseorder')
                addr = getAddressBookByType('customer', record.getFieldValue('entity'), record.getFieldValue('shipaddresslist'));
            else {
                if (record.getFieldValue('shipto') != null) {
                    addr = getAddressBookByType('customer', salesOrderRecord.getFieldValue('shipto'));
                } else {
                    addr = getAddressBookByType('customer', salesOrderRecord.getFieldValue('entity'), record.getFieldValue('shipaddresslist'));
                }
            }
        } catch (e) {
            var err = getErrorDetails(e);
            nlapiLogExecution('DEBUG', 'Pacejet : Error', JSON.stringify(err));
            try {
                addr = getAddressBookByType('job', record.getFieldValue('entity'), record.getFieldValue('shipaddresslist'));
            } catch (e) {}

            if (addr == null) {
                try {
                    addr = getAddressBookByType('customer', salesOrderRecord.getFieldValue('entity'), record.getFieldValue('shipaddresslist'));
                } catch (e) {
                    addr = new Object();
                    addr.internalid = currentId;
                    addr.attention = record.getFieldValue('shipattention');
                    if (recordType != 'itemfulfillment')
                        addr.addressee = record.getFieldValue('shipaddressee');
                    else
                        addr.addressee = record.getFieldValue('shipcompany');
                    addr.phone = record.getFieldValue('shipphone');
                    if (addr.phone == null || addr.phone == '')
                        addr.phone = defaultPhone;
                    addr.addr1 = record.getFieldValue('shipaddr1');
                    addr.addr2 = record.getFieldValue('shipaddr2');
                    addr.addr3 = record.getFieldValue('shipaddr3');
                    addr.city = record.getFieldValue('shipcity');
                    addr.state = record.getFieldValue('shipstate');
                    addr.zip = record.getFieldValue('shipzip');
                    addr.country = record.getFieldValue('shipcountry');
                    addr.isresidential = record.getFieldValue('shipisresidential');
                    addr.email = cust.getFieldValue('email');
                }
            }
        }

        if (addr != null && addr.isvalid) {
            xmlDestination += '<LocationCode>' + addr.internalid + '</LocationCode>';
            xmlDestination += '<CompanyName>' + stringIt(addr.addressee) + '</CompanyName>';
            xmlDestination += '<ContactName>' + stringIt(addr.attention) + '</ContactName>';
            xmlDestination += '<Phone>' + stringIt(addr.phone) + '</Phone>';
            xmlDestination += '<Email>' + stringIt(addr.email) + '</Email>';
            xmlDestination += '<Address1>' + stringIt(addr.addr1) + '</Address1>';
            if (addr.addr2 != null)
                xmlDestination += '<Address2>' + stringIt(addr.addr2) + '</Address2>';
            if (addr.addr3 != null)
                xmlDestination += '<Address3>' + stringIt(addr.addr3) + '</Address3>';
            xmlDestination += '<City>' + stringIt(addr.city) + '</City>';
            xmlDestination += '<StateOrProvinceCode>' + stringIt(addr.state) + '</StateOrProvinceCode>';
            xmlDestination += '<PostalCode>' + stringIt(addr.zip) + '</PostalCode>';
            xmlDestination += '<CountryName>' + stringIt(addr.country) + '</CountryName>';
            xmlDestination += '<Residential>' + (addr.isresidential == 'T') + '</Residential>';
        } else {
            xmlDestination += getDestinationXmlByRecordFields(recordType, defaultPhone, defaultEmail);
        }
    } else {

        //Check to see if they entered in a custom address and use that.
        if (recordType == 'purchaseorder' && (record.getFieldValue('specord') == 'T' || (record.getFieldValue('specord') == null && record.getFieldValue('dropshipso') == null))) {
            xmlDestination += '<LocationCode>' + (sLocationID == null ? '' : sLocationID) + '</LocationCode>';
            xmlDestination = xmlDestination.replace('<LocationType>Customer</LocationType>', '<LocationType>Facility</LocationType>')
        } else if (record.getFieldValue('shipaddr1') != null) {
            xmlDestination += getDestinationXmlByRecordFields(recordType, defaultPhone, defaultEmail);
        } else if (recordType == 'purchaseorder' && cust != null) {
            addr = getAddressBookByType('customer', cust.getId(), null);
            xmlDestination += '<LocationCode>' + cust.getId() + '</LocationCode>';
            xmlDestination += '<CompanyName>' + stringIt(addr.addressee) + '</CompanyName>';
            xmlDestination += '<ContactName>' + stringIt(addr.attention) + '</ContactName>';
            xmlDestination += '<Phone>' + stringIt(addr.phone) + '</Phone>';
            xmlDestination += '<Email>' + stringIt(addr.email) + '</Email>';
            xmlDestination += '<Address1>' + stringIt(addr.addr1) + '</Address1>';
            if (addr.addr2 != null)
                xmlDestination += '<Address2>' + stringIt(addr.addr2) + '</Address2>';
            if (addr.addr3 != null)
                xmlDestination += '<Address3>' + stringIt(addr.addr3) + '</Address3>';
            xmlDestination += '<City>' + stringIt(addr.city) + '</City>';
            xmlDestination += '<StateOrProvinceCode>' + stringIt(addr.state) + '</StateOrProvinceCode>';
            xmlDestination += '<PostalCode>' + stringIt(addr.zip) + '</PostalCode>';
            xmlDestination += '<CountryName>' + stringIt(addr.country) + '</CountryName>';
            xmlDestination += '<Residential>' + (addr.isresidential == 'T') + '</Residential>';
        } else if (recordType == 'purchaseorder' && cust == null) {
            xmlDestination += '<LocationCode>' + sLocationID + '</LocationCode>';
        }
    }
    xmlDestination += '</Destination>';
*/



    /** ---------------------------------------- SHIPPING METHOD (NOT NEEDED FOR RATES) ---------------------------------------- */
    var xmlCarrierDetails = '';
    if (record.getFieldValue('shipmethod') != null) {
        xmlCarrierDetails += '<CarrierDetails>';

        if (cust != null && cust.getFieldValue('custentity_pacejet_shipvia_override') != null)
            xmlCarrierDetails += '<ShipXRef>' + cust.getFieldValue('custentity_pacejet_shipvia_override') + '</ShipXRef>';
        else
            xmlCarrierDetails += '<ShipXRef>' + record.getFieldValue('shipmethod') + '</ShipXRef>';
        xmlCarrierDetails += '</CarrierDetails>';
    }

    var xmlShipmentDetails = '<ShipmentDetail>';

    xmlShipmentDetails += '<ShipmentOptions>';

    if (record.getFieldValue('custbody_pj_sssdelivery') == 'T')
        xmlShipmentDetails += '<SaturdayDelivery>1</SaturdayDelivery>';

    if (record.getFieldValue('custbody_pj_sscod') == 'T')
        xmlShipmentDetails += '<COD><CODFlag>1</CODFlag><CollectionType>any</CollectionType><Currency>USD</Currency><Total>[CODTOTAL]</Total></COD>';

    if (record.getFieldValue('custbody_pj_sssigreq') == 'T') {
        var shipcarrier = '';
        if (cust.getFieldValue('custentity_pacejet_shipvia_override') != null)
            shipcarrier = cust.getFieldText('custentity_pacejet_shipvia_override')
        else
            shipcarrier = record.getFieldText('shipmethod');

        if (shipcarrier.toLowerCase().indexOf('ups') > -1)
            xmlShipmentDetails += '<SignatureType>adult_ups</SignatureType>';
        else if (shipcarrier.toLowerCase().indexOf('fedex') > -1)
            xmlShipmentDetails += '<SignatureType>adult_fedex</SignatureType>';
        else if (shipcarrier.toLowerCase().indexOf('usps') > -1)
            xmlShipmentDetails += '<SignatureType>usps</SignatureType>';
        else {
            xmlShipmentDetails += '<SignatureType>service_default</SignatureType>';
        }
    }


    xmlShipmentDetails += '</ShipmentOptions>';

    if (record.getFieldValue('custbody_pj_ssliftgate') == 'T') {
        xmlShipmentDetails += '<LTLOptions>';
        xmlShipmentDetails += '<LiftGate>1</LiftGate>';
        xmlShipmentDetails += '</LTLOptions>';
    }
    if (record.getFieldValue('custbody_pacejet_freight_service') != null)
        xmlShipmentDetails += '<MiscCharge>' + record.getFieldValue('custbody_pacejet_freight_service') + '</MiscCharge>';

    if (record.getFieldValue('memo') != null)
        xmlShipmentDetails += '<UserField1>' + stringIt(record.getFieldValue('memo')) + '</UserField1>';
    else if (salesOrderRecord.getFieldValue('memo') != null)
        xmlShipmentDetails += '<UserField1>' + stringIt(salesOrderRecord.getFieldValue('memo')) + '</UserField1>';

    if (salesOrderRecord.getFieldValue('tranid') != null)
        xmlShipmentDetails += '<UserField2>' + salesOrderRecord.getFieldValue('tranid') + '</UserField2>';

    if (salesOrderRecord.getFieldValue('otherrefnum') != null)
        xmlShipmentDetails += '<UserField3>' + stringIt(salesOrderRecord.getFieldValue('otherrefnum')) + '</UserField3>';

    if (record.getFieldValue('shippingcost') != null)
        xmlShipmentDetails += '<UserField13>' + record.getFieldValue('shippingcost') + '</UserField13>';

    if (record.getFieldValue('shipmethod') != null)
        xmlShipmentDetails += '<UserField14>' + record.getFieldValue('shipmethod') + '</UserField14>';

    if (record.getFieldValue('custbody_pacejet_batchid') != null)
        xmlShipmentDetails += '<UserField8>' + record.getFieldValue('custbody_pacejet_batchid') + '</UserField8>';

    if (recordType == 'itemfulfillment')
        if (salesOrderRecord.getFieldValue('tranid') != null)
            xmlShipmentDetails += '<UserField15>' + salesOrderRecord.getId() + '</UserField15>';

    xmlShipmentDetails += '<WeightUOM>' + defweightuom + '</WeightUOM>';
    xmlShipmentDetails += '</ShipmentDetail>';

    var messages = new Object();
    messages.MessageList = new Array();

    /** ---------------------------------------- END SHIPPING METHOD ---------------------------------------- */

    /** ---------------------------------------- MESSAGES (not needed for rates) ---------------------------------------- */

    if (recordType != 'estimate') {
        messages.MessageList.push(createMessage("FedEx_Reference_CUSTOMER_REFERENCE", getTransactionField(fedexcustref, record, salesOrderRecord)));
        messages.MessageList.push(createMessage("FedEx_Reference_P_O_NUMBER", getTransactionField(fedexponum, record, salesOrderRecord)));
        messages.MessageList.push(createMessage("FedEx_Reference_INVOICE_NUMBER", getTransactionField(fedexinvnum, record, salesOrderRecord)));
        messages.MessageList.push(createMessage("UPS_Reference_1", getTransactionField(upsRef1, record, salesOrderRecord)));
        messages.MessageList.push(createMessage("UPS_Reference_2", getTransactionField(upsRef2, record, salesOrderRecord)));
    }

    if (salesOrderRecord.getFieldValue('message') != null)
        messages.MessageList.push(createMessage("Message", salesOrderRecord.getFieldValue('message').substring(0, 100)));

    if (record.getFieldValue('custbody_pacejet_cust_parent_link') != null)
        messages.MessageList.push(createMessage("Ship_Group", record.getFieldValue('custbody_pacejet_cust_parent_link')));

    if (record.getFieldValue('custbody_pacejet_delivery_instructions') != null)
        messages.MessageList.push(createMessage("Delivery_Instructions", record.getFieldValue('custbody_pacejet_delivery_instructions')));


    if (salesOrderRecord.getFieldValue('location') != null)
        messages.MessageList.push(createMessage("NetSuite_Location", salesOrderRecord.getFieldValue('location')));

    /** ---------------------------------------- MESSAGES (not needed for rates) ---------------------------------------- */
    var xmlMessages = "<MessageList>";
    xmlMessages += json2xml.convert(messages, '');
    xmlMessages += "</MessageList>";

    var xmlPackages = '';
    var xmlBillingDetails = '';
    var xmlCustomFields = '';

    var orderitems = new Array();

    for (var i = 1; i <= record.getLineItemCount('item'); i++) {
        var lineitem = new Object();
       // lineitem.type = record.getLineItemValue('item', 'itemtype', i);
        //lineitem.internalid = record.getLineItemValue('item', 'item', i);
        //lineitem.orderline = (orderType == 'transferorder' ? parseInt(record.getLineItemValue('item', 'orderline', i)) - 1 : parseInt(record.getLineItemValue('item', 'orderline', i)));
        //lineitem.line = parseInt(record.getLineItemValue('item', 'line', i));
        //lineitem.description = record.getLineItemValue('item', 'description', i);
        lineitem.onhand = record.getLineItemValue('item', 'onhand', i);
        lineitem.quantity = record.getLineItemValue('item', 'quantity', i);
        lineitem.quantitybackordered = record.getLineItemValue('item', 'quantitybackordered', i);
        //lineitem.amount = record.getLineItemValue('item', 'amount', i);
       // lineitem.rate = record.getLineItemValue('item', 'rate', i);
        lineitem.createdpo = record.getLineItemValue('item', 'createpo', i);

        if (UOMfeature) {
            lineitem.unit = record.getLineItemValue('item', 'units', i);
            lineitem.unitdisplay = record.getLineItemText('item', 'units', i) != null ? record.getLineItemText('item', 'units', i) : record.getLineItemValue('item', 'unitsdisplay', i);
            lineitem.unitconversion = record.getLineItemValue('item', 'unitconversionrate', i) != null ? record.getLineItemValue('item', 'unitconversionrate', i) : 1;
        }
        lineitem.serialnumbers = new Array();
        if (currentContext.getFeature('serializedinventory') || currentContext.getFeature('lotnumberedinventory')) { // if they have serialized inventory
            lineitem.serialnumbers = new Array();
            if (recordType == 'purchaseorder')
                lineitem.serialnumbers = (record.getLineItemValue('item', 'serialnumbers', i) != null) ? record.getLineItemValue('item', 'serialnumbers', i) : null;
            else
                lineitem.serialnumbers = (record.getLineItemValues('item', 'serialnumbers', i) != null) ? record.getLineItemValues('item', 'serialnumbers', i) : null;
            lineitem.isserial = (record.getLineItemValue('item', 'isserialorlotitem', i) == 'T');
            lineitem.isvalidserialnumber = (record.getLineItemValue('item', 'serialnumbersvalid', i) == 'T' || (lineitem.serialnumbers && lineitem.serialnumbers.length > 0));
        } else {
            lineitem.serialnumbers = null;
            lineitem.isvalidserialnumber = true;
        }

        if (record.getLineItemValue('item', 'location', i) != null) {
            lineitem.location = new Object();
            lineitem.location.internalid = record.getLineItemValue('item', 'location', i);
            lineitem.location.name = record.getLineItemText('item', 'location', i);

            if (sLocationID == null) {
                sLocationID = lineitem.location.internalid;
            } else if (sLocationID != lineitem.location.internalid) {
                nlapiCreateError('LOCATION_ERROR', 'All items are required to be from the same location/warehouse', true);
            }
        }
        lineitem.item = new Object();
        lineitem.item.internalid = record.getLineItemValue('item', 'item', i);
        lineitem.item.name = record.getLineItemText('item', 'item', i);
        if (lineitem.item.name.indexOf(' : ') > -1)
            lineitem.item.name = lineitem.item.name.split(' : ')[lineitem.item.name.split(' : ').length - 1];

        if (defgetcustomitemfields == 'T') {
            for (var c = 0; c < record.getAllLineItemFields('item').length; c++) {
                var column = record.getAllLineItemFields('item')[c];
                if ((column.indexOf('custcol') > -1) || ((defcustomitemfields == '' && column.indexOf('custcol') > -1) || defcustomitemfields.split(',').indexOf(column) > -1)) {
                    lineitem[column] = record.getLineItemValue('item', column, i);
                }
            }
        }
        if ((lineitem.createdpo != null && lineitem.createdpo.toLowerCase() == 'specord') || lineitem.createdpo == null || recordType == 'itemfulfillment') {
            orderitems.push(lineitem);
        }
    }

    if (inventoryitems == null)
        inventoryitems = getInventoryItems(orderitems);

    //ASS 5: No Assemblies partidos
    /** ---------------------------------------- MESSAGES (not needed for rates) ---------------------------------------- */

    if (useassemblyitems == 'T') {
        //Remember the parent items of assembly items to remove them later
        var memberparents = new Array();
        var lineNumber = (orderitems[orderitems.length - 1].line ? orderitems[orderitems.length - 1].line : orderitems[orderitems.length - 1].orderline);

        for (var i = 0; i <= inventoryitems.length - 1; i++) {
            var item = inventoryitems[i];

            if (item.ismember) {
                var newItem = new Object();
                for (var property in item) {
                    if (item.hasOwnProperty(property)) {
                        newItem[property] = item[property];
                    }
                }

                newItem.line = lineNumber++;
                newItem.ismember = true;
                memberparents.push(item.memberparentid);

                var newItemTotalQuantity = 0;
                for (var x = 0; x <= orderitems.length - 1; x++) {
                    if (orderitems[x].internalid == item.memberparentid) {
                        newItemTotalQuantity += parseInt(orderitems[x].quantity) * parseInt(newItem.quantity);
                    }
                }
                newItem.quantity = newItemTotalQuantity;
                orderitems.push(newItem);

            }
        }
    }

    for (var i = orderitems.length - 1; i >= 0; i--) {
        if (memberparents != null && memberparents.length > 0) {
            //Parent of assembly items need removed from list of rec.items (item in transaction record)
            for (var j = 0; j < memberparents.length; j++) {
                if (memberparents[j] == orderitems[i].internalid) {
                    orderitems.splice(i, 1);
                }
            }
        }

        if (orderitems[i].serialnumbers != null && orderitems[i].serialnumbers.length > 0) {
            try {
                orderitems[i].serialnumbers = orderitems[i].serialnumbers.join(' ').substring(0, 99);
            } catch (e) {
                orderitems[i].serialnumbers = String(orderitems[i].serialnumbers).substring(0, 99);
            }

        }
    }

    if (orderitems.length > 0) {

        var itemInternalIds = new Array();
        for (var i = 1; i <= inventoryitems.length; i++) {
            itemInternalIds.push(inventoryitems[i - 1].internalid);
        }

        var salesOrderItems = new Array();
        for (var i = 1; i <= salesOrderRecord.getLineItemCount('item'); i++) {
            var saleitem = new Object();
            saleitem.type = salesOrderRecord.getLineItemValue('item', 'itemtype', i);
            saleitem.internalid = salesOrderRecord.getLineItemValue('item', 'item', i);
            saleitem.orderline = salesOrderRecord.getLineItemValue('item', 'orderline', i);
            saleitem.line = parseInt(salesOrderRecord.getLineItemValue('item', 'line', i));
            saleitem.description = salesOrderRecord.getLineItemValue('item', 'description', i);
            saleitem.amount = salesOrderRecord.getLineItemValue('item', 'amount', i);
            saleitem.rate = salesOrderRecord.getLineItemValue('item', 'rate', i);
            saleitem.createdpo = salesOrderRecord.getLineItemValue('item', 'createpo', i);

            if (defgetcustomitemfields == 'T') {
                for (var c = 0; c < record.getAllLineItemFields('item').length; c++) {
                    var column = record.getAllLineItemFields('item')[c];

                    if ((defcustomitemfields == '' && column.indexOf('custcol') > -1) || defcustomitemfields.split(',').indexOf(column) > -1) {
                        saleitem[column] = record.getLineItemValue('item', column, i);
                    }

                }
            }

            if ((saleitem.createdpo != null && saleitem.createdpo.toLowerCase() == 'dropship') || saleitem.createdpo == null) {
                salesOrderItems.push(saleitem);
            }
        }

        var containers = (itemInternalIds.length > 0 ? getContainerProfiles(itemInternalIds) : "");

        var PackageDetails = new Object();
        var packages = new Array();
        var packageDetailsList = new Object();
        packageDetailsList.PackageDetails = new Array();

        if (defaultPackageNumber != null && defaultPackageNumber != '')
            PackageDetails.PackageNumber = defaultPackageNumber;

        PackageDetails.IsDefault = true;
        PackageDetails.ItemQuantity = 0;
        PackageDetails.PackageOptions = new Object();
        PackageDetails.PackageOptions.DeclaredValue = new Object();
        PackageDetails.PackageOptions.DeclaredValue.Amount = 0;
        PackageDetails.ProductDetailsList = new Object();
        PackageDetails.ProductDetailsList.productDetailsList = new Array();
        PackageDetails.PackageOptions.DeclaredValue.Currency = "USD";

        var CODTotal = 0;

        xmlPackages += '<PackageDetailsList>';

        for (var i = 0; i < orderitems.length; i++) {
            var item = null;
            for (var x = 0; x < inventoryitems.length; x++)
                if (inventoryitems[x].internalid == orderitems[i].internalid) {
                    item = inventoryitems[x];
                    break;
                }

            if (item != null) {

                var validitemtypes = new Array("inventoryitem", "noninventoryresaleitem", "noninventorysaleitem", "kititem", "assemblyitem", "serializedinventoryitem", "lotnumberedinventoryitem", "lotnumberedassemblyitem");

                if (includeitemtypes != null && includeitemtypes.length > 0) {
                    for (var x = 0; x < includeitemtypes.split(',').length; x++) {
                        validitemtypes.push(includeitemtypes.split(',')[x]);
                    }
                }

                if (excludeitemtypes != null && excludeitemtypes.length > 0) {
                    for (var x = 0; x < excludeitemtypes.split(',').length; x++) {
                        var j = validitemtypes.indexOf(excludeitemtypes.split(',')[x]);
                        validitemtypes.splice(j, 1);
                    }
                }

                if (validitemtypes.indexOf(item.recordtype) != -1) {
                    /*
                    var oProductDetails = new Object();
                    oProductDetails.Quantity = new Object();
                    oProductDetails.Price = new Object();
                    oProductDetails.Dimensions = new Object();
                    oProductDetails.Cost = new Object();

                    oProductDetails.Cost.Value = 0;
                    oProductDetails.Cost.Units = defunituom;

                    oProductDetails.Price.Amount = 0;

                    var currentItem = orderitems[i];*/

                    //oProductDetails.NetsuiteItemInternalId = oProductDetails.ExternalID = item.id;
                    //oProductDetails.Number = item.itemid;
                    //oProductDetails.Description = item.salesdescription;


                    //ASS X : No UOM
                    if ((item.weight != null && item.weight != '') && item.unitstype != '' && UOMs != null && useassemblyitems == 'F') {
                        unitstype = '_' + item.unitstype;
                        saleunit = currentItem.unitdisplay;
                        oProductDetails.Weight = convertWeight(item.weight, item.weightunit.name, UOMs[unitstype][saleunit]);
                    } else if (item.weight != null && item.weight != '')
                        //oProductDetails.Weight = convertWeight(item.weight, item.weightunit.name);

                    //oProductDetails.PackUIRmngItem = "N";
                    //itemUOM = null;

                    if (currentItem.unitdisplay != null && currentItem.unitdisplay != '') {
                        oProductDetails.Quantity.Units = currentItem.unitdisplay;
                    } else {
                        oProductDetails.Quantity.Units = (item.saleunit == null || stringIt(item.saleunit.name) == '' ? defunituom : item.saleunit.name);
                    }
                    //oProductDetails.Quantity.Value = currentItem.quantity;
                    //oProductDetails.UserField3 = currentItem.quantity;

                    if (recordType == 'itemfulfillment') {
                        /*
                        if (currentItem.ismember) {
                            oProductDetails.Price.Amount = item.cost;
                        } else
                            for (var si in salesOrderItems) {
                                var salesOrderItem = salesOrderItems[si];
                                if (salesOrderItem.line == currentItem.orderline) {
                                    if (salesOrderItem.rate != null)
                                        oProductDetails.Price.Amount = salesOrderItem.rate;
                                    else
                                        oProductDetails.Price.Amount = round2Fixed(parseFloat(salesOrderItem.amount) / parseInt(currentItem.quantity));

                                }
                            }

                        oProductDetails.Price.Currency = "";
*/
                    } else {
                        if (currentItem.rate != null)
                            oProductDetails.Price.Amount = currentItem.rate;
                        else
                            oProductDetails.Price.Amount = round2Fixed(currentItem.amount == null ? currentItem.cost : parseFloat(currentItem.amount / parseInt(currentItem.quantity)));
                        oProductDetails.Price.Currency = "";
                    }

                    //if (item.custitem_pacejet_commodity_name != null)
                    //    oProductDetails.CommodityName = item.custitem_pacejet_commodity_name;
                    //if (item.custitem_pacejet_upc_code != null || (item.upccode != null && item.upccode != ''))
                    //    oProductDetails.UPCCode = (item.upccode != null && item.upccode != '') ? item.upccode : item.custitem_pacejet_upc_code;
                    //if (item.custitem_pacejet_producer_number != null)
                    //    oProductDetails.ProducerNumber = item.custitem_pacejet_producer_number;

                    //Custom uses WMS inventory management and wants to use the values from there rather than Pacejet fields

                    //ASS X: No WMS inventory

                    if (defusewms == 'T') {
                        /*var dims = getEBizDimensionsMemoize(item.internalid);

                        if (dims.height != null)
                            oProductDetails.Dimensions.Height = dims.height;
                        if (dims.width != null)
                            oProductDetails.Dimensions.Width = dims.width;
                        if (dims.length != null)
                            oProductDetails.Dimensions.Length = dims.length;
                        if (dims.weight != null)
                            oProductDetails.Weight = convertWeight(dims.weight, 'lb');

                        oProductDetails.AutoPack = dims.autopack;
                        */
                    } else {

                        /*if (item.custitem_pacejet_item_height != null)
                            oProductDetails.Dimensions.Height = item.custitem_pacejet_item_height;
                        if (item.custitem_pacejet_item_width != null)
                            oProductDetails.Dimensions.Width = item.custitem_pacejet_item_width;
                        if (item.custitem_pacejet_item_length != null)
                            oProductDetails.Dimensions.Length = item.custitem_pacejet_item_length;
                        //if (item.custitem_pacejet_item_autopack != null)*/
                        //    oProductDetails.AutoPack = (item.custitem_pacejet_item_autopack.toLowerCase() == "t");
                    }

                    oProductDetails.UserField1 = currentItem.line;

                    if (currentItem.serialnumbers != null) {
                        oProductDetails.UserField2 = currentItem.serialnumbers.replace(/\W+/g, " ");
                    }

                    //if (item.cost != null)
                      //  oProductDetails.Cost.Value = item.cost;

                    //oProductDetails.Cost.Units = oProductDetails.Quantity.Units;

                    /* ASS X: Custom Fields Functionality not available */
                    /*
                    var CustomFields = new Array();
                    for (var property in item) {
                        if (item.hasOwnProperty(property) && defgetcustomitemfields == 'T') {
                            if (((defcustomitemfields == '' && property.indexOf('custitem') > -1) || defcustomitemfields.split(',').indexOf(property) > -1)) {
                                var customField = new Object();
                                if (item[property] != null && item[property] != '') {
                                    customField.CustomField = new Object();
                                    customField.CustomField.Name = property;
                                    customField.CustomField.Value = item[property];
                                    CustomFields.push(customField);
                                }
                            }
                        }
                    }


                    for (var property in orderitems[i]) {
                        if (orderitems[i].hasOwnProperty(property) && defgetcustomitemfields == 'T') {
                            if (((defcustomitemfields == '' && property.indexOf('custcol') > -1) || defcustomitemfields.split(',').indexOf(property) > -1)) {
                                var customField = new Object();
                                if (orderitems[i][property] != null && orderitems[i][property] != '') {
                                    customField.CustomField = new Object();
                                    customField.CustomField.Name = property;
                                    customField.CustomField.Value = orderitems[i][property];
                                    CustomFields.push(customField);
                                }
                            }
                        }
                    }

                    if (CustomFields.length > 0) {
                        oProductDetails.CustomFields = new Object();
                        oProductDetails.CustomFields.CustomFields = CustomFields;
                    }
                     */

                    PackageDetails.ItemQuantity += parseInt(currentItem.quantity);
                    if (DefaultDeclaredValue.toLowerCase() == 'calculate') {
                        PackageDetails.PackageOptions.DeclaredValue.Amount += round2Fixed(parseFloat(oProductDetails.Price.Amount * currentItem.quantity).toFixed(2));
                    } else {
                        PackageDetails.PackageOptions.DeclaredValue.Amount += parseFloat(DefaultDeclaredValue);
                    }

                    if (record.getFieldValue('custbody_pj_sscod') == 'T') {
                        if (DefaultDeclaredValue.toLowerCase() == 'calculate') {
                            CODTotal += round2Fixed(parseFloat(oProductDetails.Price.Amount * currentItem.quantity));
                        } else {
                            CODTotal += parseFloat(DefaultDeclaredValue);
                        }
                    }

                    var ProductDetails = new Object();
                    ProductDetails.ProductDetails = oProductDetails;

                    PackageDetails.ProductDetailsList.productDetailsList.push(ProductDetails);

                }
            }
        }

        xmlShipmentDetails = xmlShipmentDetails.replace('[CODTOTAL]', CODTotal);

        var packageDetails = new Object();
        packageDetails.PackageDetails = PackageDetails;
        packageDetailsList.PackageDetails.push(packageDetails);
        xmlPackages += json2xml.convert(packageDetailsList, '');

        xmlPackages += '</PackageDetailsList>';
    }

    var thirdpartyaccounts = null;
    var shippingId = record.getFieldValue('shipaddresslist') != null ? record.getFieldValue('shipaddresslist') : currentId;

    if (record.getFieldValue('custbody_pacejet_freightacctoverride') != null) {
        thirdpartyaccounts = getThirdPartyMemoize(record.getFieldValue('custbody_pacejet_freightacctoverride'), null);
        shippingId = currentId;
    } else {
        if (record.getFieldValue('shipaddresslist') != null)
            thirdpartyaccounts = getThirdPartyMemoize(record.getFieldValue('entity'), record.getFieldValue('shipaddresslist'));
        else
            thirdpartyaccounts = getThirdPartyMemoize(record.getFieldValue('entity'), null);

    }

    if (record.getFieldValue('custbody_pacejet_freight_terms') != null || (OneWorld && record.getFieldValue('subsidiary') != null)) {

        if (record.getFieldValue('custbody_pacejet_freight_terms') != null) {
            var sFreightTermsCode = record.getFieldText('custbody_pacejet_freight_terms');
            var billingaddresslist = null;

            if (recordType == 'salesorder') {
                if (salesOrderRecord.getFieldValue('billaddresslist') != null) {
                    billingaddresslist = getAddressBookByType('customer', salesOrderRecord.getFieldValue('entity'), salesOrderRecord.getFieldValue('billaddresslist'));
                } else if (salesOrderRecord.getFieldValue('shipaddresslist') != null) {
                    billingaddresslist = getAddressBookByType('customer', salesOrderRecord.getFieldValue('entity'), salesOrderRecord.getFieldValue('shipaddresslist'));
                } else {
                    billingaddresslist = null;
                }
            }

        }

        xmlBillingDetails += '<BillingDetails>';
        if (OneWorld && record.getFieldValue('subsidiary') != null)
            xmlBillingDetails += '<Subsidiary>' + record.getFieldValue('subsidiary') + '</Subsidiary>';

        if (record.getFieldValue('custbody_pacejet_freight_terms') != null) {
            xmlBillingDetails += '<AccountNumber>' + shippingId + '</AccountNumber>';
            xmlBillingDetails += '<Name>' + stringIt(String((addr.addressee != null ? addr.addressee : cust.getFieldValue('name'))).trim().substring(0, 60)) + '</Name>';

            xmlBillingDetails += '<FreightTermsCode>' + sFreightTermsCode + '</FreightTermsCode>';

            if (billingaddresslist != null) {
                xmlBillingDetails += '<ZipPostalCode>' + billingaddresslist.zip + '</ZipPostalCode>';
                xmlBillingDetails += '<CountryName>' + billingaddresslist.country + '</CountryName>';
            } else {
                xmlBillingDetails += '<ZipPostalCode>' + record.getFieldValue('shipzip') + '</ZipPostalCode>';
                xmlBillingDetails += '<CountryName>' + record.getFieldValue('shipcountry') + '</CountryName>';
            }

            if (thirdpartyaccounts != null) {
                xmlBillingDetails += '<BillingAccountList>';

                for (var i = 0; i < thirdpartyaccounts.length; i++) {
                    var acct = thirdpartyaccounts[i];
                    xmlBillingDetails += '<BillingAccount>';
                    xmlBillingDetails += '<FreightChargeAccountNumber>' + acct.accountnumber + '</FreightChargeAccountNumber>';
                    xmlBillingDetails += '<ShipXRef>' + acct.carrier + '</ShipXRef>';
                    if (acct.address) {
                        xmlBillingDetails += '<Address1>' + stringIt(acct.address.addr1) + '</Address1>';
                        if (acct.address.addr2 != null)
                            xmlBillingDetails += '<Address2>' + stringIt(acct.address.addr2) + '</Address2>';
                        if (acct.address.addr3 != null)
                            xmlBillingDetails += '<Address3>' + stringIt(acct.address.addr3) + '</Address3>';
                        xmlBillingDetails += '<City>' + stringIt(acct.address.city) + '</City>';
                        xmlBillingDetails += '<ContactName>' + stringIt(String(acct.address.attention != null ? acct.address.attention : '').trim().substring(0, 60)) + '</ContactName>';
                        xmlBillingDetails += '<CompanyName>' + stringIt(acct.address.addressee) + '</CompanyName>';
                        xmlBillingDetails += '<StateOrProvinceCode>' + stringIt(acct.address.state) + '</StateOrProvinceCode>';
                        xmlBillingDetails += '<PostalCode>' + stringIt(acct.address.zip) + '</PostalCode>';
                        xmlBillingDetails += '<CountryCode>' + stringIt(acct.address.country) + '</CountryCode>';
                        xmlBillingDetails += '<Residential>' + (acct.address.isresidential == true ? 'true' : 'false') + '</Residential>';
                        xmlBillingDetails += '<Phone>' + stringIt(acct.address.phone) + '</Phone>';
                    }
                    xmlBillingDetails += '</BillingAccount>';
                }
                xmlBillingDetails += '</BillingAccountList>';
            }
        }
        xmlBillingDetails += '</BillingDetails>';
    }

    xmlCustomFields += '<CustomFields>';

    for (var i = 1; i <= 10; i++) {
        if (record.getFieldValue('custbody_pacejet_customfield' + i) != null && record.getFieldValue('custbody_pacejet_customfield' + i)) {
            xmlCustomFields += '<CustomField>';
            xmlCustomFields += '<Name>customfield' + i + '</Name>';
            if (record.getField('custbody_pacejet_customfield' + i).getType() == 'multiselect')
                xmlCustomFields += '<Value>' + stringIt(record.getFieldTexts('custbody_pacejet_customfield' + i).join()) + '</Value>';
            else
                xmlCustomFields += '<Value>' + stringIt(record.getFieldText('custbody_pacejet_customfield' + i)) + '</Value>';
            xmlCustomFields += '</CustomField>';
        }
    }

    //Some standard custom fields we may want at some point
    xmlCustomFields += '<CustomField><Name>DefaultDeclaredValue</Name><Value>' + DefaultDeclaredValue + '</Value></CustomField>'
    xmlCustomFields += '<CustomField><Name>UseParentShipToIfAvailable</Name><Value>' + UseParentShipToIfAvailable + '</Value></CustomField>'
    xmlCustomFields += '<CustomField><Name>DefaultPackageNumber</Name><Value>' + defaultPackageNumber + '</Value></CustomField>'
    xmlCustomFields += '<CustomField><Name>TranId</Name><Value>' + record.getFieldValue('tranid') + '</Value></CustomField>'

    //Netsuite Containers
    xmlCustomFields += '<CustomField><Name>Containers</Name><Value>' + JSON.stringify(containers) + '</Value></CustomField>'

    //Get customfields or nah
    if (defgetcustomtransfields == 'T') {

        var currentrecordflds = record.getAllFields();
        var baserecordflds = salesOrderRecord.getAllFields();

        if (defcustomtranfields != '') {
            for (var j = 0; j < defcustomtranfields.split(',').length; j++) {
                xmlCustomFields += '<CustomField><Name>' + defcustomtranfields.split(',')[j] + '</Name><Value>' + stringIt(getTransactionField(defcustomtranfields.split(',')[j], record, salesOrderRecord)) + '</Value></CustomField>';
            }
        } else {
            for (var i = 0; i < currentrecordflds.length; i++) {
                var fld = currentrecordflds[i];

                if ((fld.substring(0, 'cust'.length) == 'cust' && fld.substring(0, 'customer_parent'.length) != 'customer_parent')) {

                    if (record.getFieldValue(fld) != null && record.getFieldValue(fld).length > 0 && record.getFieldValue(fld).length <= 255)
                        xmlCustomFields += '<CustomField><Name>' + fld + '</Name><Value>' + stringIt(record.getFieldValue(fld)) + '</Value></CustomField>';

                }

            }
        }
    }

    xmlCustomFields += '</CustomFields>';
    var xmlFooter = '</ImportEntity>';

    if (record.getFieldValue('custbody_pacejet_ship_from_override') != null)
        sLocationID = record.getFieldValue('custbody_pacejet_ship_from_override');

    var xmlOrigin = '<Origin>';

    if (recordType == 'purchaseorder') {
        xmlOrigin += '<LocationType>Customer</LocationType>';
        xmlOrigin += '<LocationCode>' + stringIt(vendor.internalid) + '</LocationCode>';
        xmlOrigin += '<CompanyName>' + stringIt(vendor.addressee) + '</CompanyName>';
        xmlOrigin += '<ContactName>' + stringIt(vendor.attention) + '</ContactName>';
        xmlOrigin += '<Address1>' + stringIt(vendor.addr1) + '</Address1>';
        xmlOrigin += '<Address2>' + stringIt(vendor.addr2) + '</Address2>';
        xmlOrigin += '<City>' + stringIt(vendor.city) + '</City>';
        xmlOrigin += '<StateOrProvinceCode>' + stringIt(vendor.state) + '</StateOrProvinceCode>';
        xmlOrigin += '<PostalCode>' + stringIt(vendor.zip) + '</PostalCode>';
        xmlOrigin += '<CountryCode>' + stringIt(vendor.country) + '</CountryCode>';
        xmlOrigin += '<Phone>' + stringIt(vendor.phone) + '</Phone>';
        xmlOrigin += '<Email>' + stringIt(record.getFieldValue('email')) + '</Email>';

    } else {
        xmlOrigin += '<LocationType>Facility</LocationType>';
        xmlOrigin += '<LocationSite>MAIN</LocationSite>';
        xmlOrigin += '<LocationCode>' + (sLocationID != null ? sLocationID : defshipfromloc) + '</LocationCode>';
    }
    xmlOrigin += '</Origin>';

    var xmlWorkstation = "<WorkstationID>" + (record.getFieldValue('custbody_pacejet_workstation') != null ? record.getFieldValue('custbody_pacejet_workstation') : "") + "</WorkstationID>";
    var xml = xmlHeader + xmlOrigin + xmlDestination + xmlCarrierDetails + xmlShipmentDetails + xmlMessages + xmlPackages + xmlBillingDetails + xmlCustomFields + xmlWorkstation + xmlFooter;

    return xml;
}

function getInventoryItem(internalid) {
    var items = new Array()
    var ctx = nlapiGetContext();

    try {

        var columns = new Array();
        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('externalid'));
        columns.push(new nlobjSearchColumn('recordtype'));
        columns.push(new nlobjSearchColumn('created'));
        columns.push(new nlobjSearchColumn('modified'));
        columns.push(new nlobjSearchColumn('salesdescription'));
        columns.push(new nlobjSearchColumn('weight'));
        columns.push(new nlobjSearchColumn('weightunit'));
        if (UOMfeature) {
            columns.push(new nlobjSearchColumn('saleunit'));
            columns.push(new nlobjSearchColumn('unitstype'));
        }
        if (barcodesFeature) {
            columns.push(new nlobjSearchColumn('upccode'));
        }
        columns.push(new nlobjSearchColumn('cost'));
        columns.push(new nlobjSearchColumn('averagecost'));
        columns.push(new nlobjSearchColumn('itemid'));
        // if (SerializedFeature)
        //     columns.push(new nlobjSearchColumn('serialnumber'));

        var item_custitemfields = 'custitem_pacejet_commodity_name,custitem_pacejet_upc_code,custitem_pacejet_producer_number,custitem_pacejet_item_height,custitem_pacejet_item_width,custitem_pacejet_item_length,custitem_pacejet_item_autopack';
        for (var i = 0; i < item_custitemfields.split(',').length; i++) {
            columns.push(new nlobjSearchColumn(item_custitemfields.split(',')[i]));
        }

        if (defgetcustomitemfields == 'T') {
            for (var i = 0; i < custominventoryfields.length; i++) {
                columns.push(new nlobjSearchColumn(custominventoryfields[i]));
            }
        }

        var fieldNames = new Array();
        for (var x = 0; x < columns.length; x++) {
            fieldNames.push(columns[x].getName());
        }
        var itemrecord = nlapiLookupField('item', internalid, fieldNames);
        var obj = new Object();

        for (var j = 0; j < columns.length; j++) {
            if (itemrecord[columns[j].getName()].length <= 100)
                obj[columns[j].getName()] = itemrecord[columns[j].getName()];
            else
                nlapiLogExecution('DEBUG', columns[j].getName(), 'Too Long: ' + itemrecord[columns[j].getName()].length);
        }

        obj.id = itemrecord.internalid;

        obj.internalid = itemrecord.internalid;
        obj.recordtype = itemrecord.recordtype;
        obj.itemid = itemrecord.itemid;
        if (obj.itemid.indexOf(' : ') > -1)
            obj.itemid = obj.itemid.split(' : ')[obj.itemid.split(' : ').length - 1];
        obj.serialnumber = itemrecord.serialnumber;
        obj.externalid = itemrecord.externalid;
        obj.createddate = itemrecord.created;
        obj.lastmodifieddate = itemrecord.modified;
        obj.salesdescription = itemrecord.salesdescription;

        obj.weight = itemrecord.weight;
        //if (itemrecord.custitem16 != null) {//UEC Case hack
        //    obj.weight = (obj.weight * itemrecord.custitem16);
        //}
        obj.weightunit = new Object();
        obj.weightunit.internalid = itemrecord.weightunit;
        obj.weightunit.name = getWeightUOM(itemrecord.weightunit, defweightuom);
        obj.saleunit = new Object();
        obj.saleunit.internalid = itemrecord.saleunit;
        //obj.saleunit.name = uom.abbreviation;
        obj.cost = itemrecord.cost != '' ? itemrecord.cost : itemrecord.averagecost != '' ? itemrecord.averagecost : 0;

        items.push(obj);

    } catch (e) {
        var nle = nlapiCreateError(e);
        err = {
            status: 'error',
            reasoncode: nle.getCode(),
            message: nle.getDetails()
        };
        if (nle != null && err.message != null && err.message.indexOf('An nlobjSearchColumn contains an invalid column, or is not in proper syntax:') > -1) {
            customField = e.message.split(': ')[1].replace('.', '');
            nlapiLogExecution('ERROR', 'GetInventoryItem Custom Field Error', 'The field, ' + customField + ', isn\'t able to be imported');
            if (custominventoryfields != null) {
                for (var j = 0; j < custominventoryfields.length; j++) {
                    if (custominventoryfields[j] == customField) {
                        custominventoryfields.splice(j, 1);
                    }
                }
            }
            return getInventoryItem(internalid);
        }
        nlapiLogExecution('DEBUG', 'Pacejet : GetInventoryItems Error', 'The error cause the search to not find the item.  Contact Pacejet Support');

    }

    return items;

}

function getInventoryItemAssembly(internalid) {
    var items = new Array();
    var ctx = nlapiGetContext();
    var UOMfeature = ctx.getFeature('unitsofmeasure'); // will return true if the Multiple Units of Measure feature is enabled, otherwise false
    var SerializedFeature = ctx.getFeature('serializedinventory'); // if they have serialized inventory
    var AssemblyFeature = ctx.getFeature('assemblies');

    try {
        var columns = new Array();
        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('externalid'));
        columns.push(new nlobjSearchColumn('created'));
        columns.push(new nlobjSearchColumn('modified'));
        columns.push(new nlobjSearchColumn('salesdescription'));
        columns.push(new nlobjSearchColumn('weight'));
        columns.push(new nlobjSearchColumn('weightunit'));
        if (UOMfeature) {
            columns.push(new nlobjSearchColumn('saleunit'));
            columns.push(new nlobjSearchColumn('unitstype'));
        }
        if (barcodesFeature) {
            columns.push(new nlobjSearchColumn('upccode'));
        }

        columns.push(new nlobjSearchColumn('cost'));
        columns.push(new nlobjSearchColumn('itemid'));
        if (SerializedFeature)
            columns.push(new nlobjSearchColumn('serialnumber'));

        columns.push(new nlobjSearchColumn('memberquantity'));
        columns.push(new nlobjSearchColumn('memberitem'));

        var item_custitemfields = 'custitem_pacejet_commodity_name,custitem_pacejet_upc_code,custitem_pacejet_producer_number,custitem_pacejet_item_height,custitem_pacejet_item_width,custitem_pacejet_item_length,custitem_pacejet_item_autopack';
        for (var i = 0; i < item_custitemfields.split(',').length; i++) {
            columns.push(new nlobjSearchColumn(item_custitemfields.split(',')[i]));
        }

        if (defgetcustomitemfields == 'T') {
            for (var i = 0; i < custominventoryfields.length; i++) {
                columns.push(new nlobjSearchColumn(custominventoryfields[i]));
            }
        }

        var filters = new Array();
        filters.push(new nlobjSearchFilter('internalid', null, 'is', internalid));

        var searchresults = nlapiSearchRecord('item', null, filters, columns);

        if (searchresults.length > 0) {

            for (var i = 0; searchresults != null && i < searchresults.length; i++) {
                var _row = searchresults[i];
                var obj = new Object();
                obj.id = _row.getId();

                for (var j = 0; j < columns.length; j++) {
                    obj[columns[j].getName()] = _row.getValue(columns[j].getName());
                }

                obj.internalid = _row.getId();
                obj.recordtype = _row.recordType;
                obj.itemid = _row.getValue('itemid');
                if (obj.itemid.indexOf(' : ') > -1)
                    obj.itemid = obj.itemid.split(' : ')[obj.itemid.split(' : ').length - 1];
                obj.serialnumber = _row.getText('serialnumber');
                obj.externalid = _row.getValue('externalid');
                obj.createddate = _row.getValue('created');
                obj.lastmodifieddate = _row.getValue('modified');
                obj.salesdescription = _row.getValue('salesdescription');
                obj.weight = _row.getValue('weight');
                //if (_row.getValue('custitem16') != null) {//UEC Case hack
                //    obj.weight = (obj.weight * _row.getValue('custitem16'));
                //}
                obj.weightunit = new Object();
                obj.weightunit.internalid = _row.getValue('weightunit');
                obj.weightunit.name = _row.getText('weightunit');
                obj.saleunit = new Object();
                obj.saleunit.internalid = _row.getValue('saleunit');
                obj.saleunit.name = _row.getText('saleunit');
                obj.cost = _row.getValue('cost') != '' ? _row.getValue('cost') : _row.getValue('averagecost') != '' ? _row.getValue('averagecost') : null;

                var isMemberItem = _row.getValue("memberitem") != null;
                if (AssemblyFeature && useassemblyitems == 'T' && _row.getValue("memberitem")) {
                    var cacheKey = obj.recordtype + '_' + _row.getValue("memberitem") + '_' + internalid;
                    if (cache[cacheKey] == null) {
                        var memberitem = null;
                        memberitem = getInventoryItem(_row.getValue('memberitem'))[0];
                        memberitem.quantity = parseFloat(_row.getValue('memberquantity'));
                        memberitem.ismember = true;
                        memberitem.memberparentid = internalid;
                        cache[cacheKey] = memberitem;
                    }
                    items.push(memberitem);
                } else {
                    items.push(obj);
                }

                if (obj.serialnumber != null && !isMemberItem)
                    break;
            }

        }
    } catch (e) {
        var nle = nlapiCreateError(e);
        err = {
            status: 'error',
            reasoncode: nle.getCode(),
            message: nle.getDetails()
        };
        if (nle != null && err.message != null && err.message.indexOf('An nlobjSearchColumn contains an invalid column, or is not in proper syntax:') > -1) {
            customField = e.message.split(': ')[1].replace('.', '');
            nlapiLogExecution('ERROR', 'GetInventoryItem Custom Field Error', 'The field, ' + customField + ', isn\'t able to be imported');
            if (custominventoryfields != null) {
                for (var j = 0; j < custominventoryfields.length; j++) {
                    if (custominventoryfields[j] == customField) {
                        custominventoryfields.splice(j, 1);
                    }
                }
            }
            return getInventoryItemAssembly(internalid);
        }
        nlapiLogExecution('DEBUG', 'Pacejet : GetInventoryItems Error', 'The error cause the search to not find the item.  Contact Pacejet Support. ' + err.message);

    }
    return items;

}


function getInventoryItems(arrItems) {

    useassemblyitems = (currentContext.getSetting('SCRIPT', custscript_pacejet_useassemblyitems) == null ? useassemblyitems : currentContext.getSetting('SCRIPT', custscript_pacejet_useassemblyitems));
    var items = new Array();
    var itemInternalIds = new Array();
    var itemSerialNumbers = new Array();

    for (var i = 0; arrItems != null && i < arrItems.length; i++) {
        var inventoryItem;
        if (AssemblyFeature && useassemblyitems == 'T') {
            items = items.concat(getInventoryItemAssemblyMemoize(arrItems[i].internalid));
        } else {
            inventoryItem = getInventoryItemMemoize(arrItems[i].internalid);
        }
        if (inventoryItem != null && inventoryItem.length > 0)
            items.push(inventoryItem[0]);
    }
    return items;

}

function getEBizDimensions(datain) {
    var dimensions = new Object();
    var filter = new Array();
    filter.push(new nlobjSearchFilter('custrecord_ebizitemdims', null, 'anyOf', datain));
    filter.push(new nlobjSearchFilter('custrecord_ebizbaseuom', null, 'is', 'T'));
    filter.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    var col = new Array();
    col.push(new nlobjSearchColumn('custrecord_ebizbaseuom'));

    col.push(new nlobjSearchColumn('custrecord_ebizbaseuom'));
    col.push(new nlobjSearchColumn('custrecord_ebizdims_packflag'));
    col.push(new nlobjSearchColumn('custrecord_ebizlength'));
    col.push(new nlobjSearchColumn('custrecord_ebizwidth'));
    col.push(new nlobjSearchColumn('custrecord_ebizheight'));
    col.push(new nlobjSearchColumn('custrecord_ebizweight'));
    col.push(new nlobjSearchColumn('custrecord_ebizuomskudim'));

    var results = nlapiSearchRecord('customrecord_ebiznet_skudims', null, filter, col);
    if (results != null) {

        dimensions.autopack = (results[0].getValue('custrecord_ebizdims_packflag') == 2);
        dimensions.uom = results[0].getText('custrecord_ebizuomskudim').substring(0, 10);
        dimensions.length = results[0].getValue('custrecord_ebizlength');
        dimensions.width = results[0].getValue('custrecord_ebizwidth');
        dimensions.height = results[0].getValue('custrecord_ebizheight');
        dimensions.weight = results[0].getValue('custrecord_ebizweight');
    } else {
        dimensions.autopack = false;
        dimensions.uom = '';
        dimensions.length = '';
        dimensions.width = '';
        dimensions.height = '';
        dimensions.weight = '';
    }

    return dimensions;
}

function getWeightUOM(Id, defaultUOM) {
    if (Id == null || Id == '') {
        return defaultUOM;
    }

    switch (Id) {
        case '1':
            return 'lb';
        case '2':
            return 'oz';
        case '3':
            return 'kg';
        case '4':
            return 'g';
        default:
            return 'lb';
    }

}

function getUOMs() {
    if (UOMs == null)
        UOMs = new Object();
    var columns = [];
    columns.push(new nlobjSearchColumn('internalid').setSort());
    columns.push(new nlobjSearchColumn('internalid'));
    columns.push(new nlobjSearchColumn('name'));
    columns.push(new nlobjSearchColumn('unitname'));
    columns.push(new nlobjSearchColumn('conversionrate'));
    columns.push(new nlobjSearchColumn('abbreviation'));

    var resultUOMs = nlapiSearchRecord('unitstype', null, null, columns);

    for (var i = 0; i < resultUOMs.length; i++) {
        var rec = resultUOMs[i];

        var id = rec.getValue('internalid');
        var name = rec.getValue('name');
        var unitname = rec.getValue('unitname');
        var abbreviation = rec.getValue('abbreviation');
        var rate = rec.getValue('conversionrate');

        if (!UOMs['_' + id]) {
            UOMs['_' + id] = new Object();
        }
        UOMs['_' + id][abbreviation] = rate;
    }
}

function getContainerProfiles(datain) {

    var itemInternalIds = datain.toString().split(',');
    var filter = new Array();
    filter[0] = new nlobjSearchFilter('internalid', 'custrecord_pacejet_container_item_link', 'anyOf', itemInternalIds);

    var col = new Array();
    col.push(new nlobjSearchColumn('name'));
    col.push(new nlobjSearchColumn('internalId'));
    col.push(new nlobjSearchColumn('isinactive'));
    col.push(new nlobjSearchColumn('custrecord_pacejet_container_name'));
    col.push(new nlobjSearchColumn('internalid', 'custrecord_pacejet_container_item_link'));
    col.push(new nlobjSearchColumn('itemid', 'custrecord_pacejet_container_item_link'));
    col.push(new nlobjSearchColumn('custrecord_pacejet_container_max_items'));
    col.push(new nlobjSearchColumn('custrecord_pacejet_container_count'));

    var searchresults = nlapiSearchRecord('customrecord_pacejet_container_profile', null, filter, col);
    var items = new Array();

    for (var i = 0; searchresults != null && i < searchresults.length; i++) {

        var container = new Object();
        var record = searchresults[i];
        var rectype = record.getRecordType();

        container.id = record.getId();
        container.isinactive = record.getValue('isinactive') == 'T';
        container.custrecord_pacejet_container_name = record.getValue('custrecord_pacejet_container_name');
        container.custrecord_pacejet_container_item_link = new Array();

        container.custrecord_pacejet_container_item_link[0] = new Object();
        container.custrecord_pacejet_container_item_link[0].internalid = record.getValue('internalid', 'custrecord_pacejet_container_item_link');
        container.custrecord_pacejet_container_item_link[0].name = record.getValue('itemid', 'custrecord_pacejet_container_item_link');

        container.custrecord_pacejet_container_max_items = record.getValue('custrecord_pacejet_container_max_items');
        container.custrecord_pacejet_container_count = record.getValue('custrecord_pacejet_container_count');
        container.name = record.getValue('name');
        items[i] = container;
    }

    return items;
}

function getAddressBookByType(recordtype, customerId, addressId) {
    var addrecord = nlapiLoadRecord(recordtype, customerId);
    var defaultPhone = addrecord.getFieldValue('phone');
    var defaultEmail = addrecord.getFieldValue('email');
    var numberOfAddresses = addrecord.getLineItemCount('addressbook');

    for (var i = 1; i <= numberOfAddresses; i++) {
        var internalid = addrecord.getLineItemValue('addressbook', 'internalid', i);
        if ((addressId == null && (addrecord.getLineItemValue('addressbook', 'defaultshipping', i) == 'T' || numberOfAddresses == 1)) || internalid == addressId) {
            var address = new Object();

            address.internalid = internalid;
            address.attention = addrecord.getLineItemValue('addressbook', 'attention', i);
            address.addressee = addrecord.getLineItemValue('addressbook', 'addressee', i);
            address.phone = addrecord.getLineItemValue('addressbook', 'phone', i);
            if (address.phone == null || address.phone == '')
                address.phone = defaultPhone;
            address.addr1 = addrecord.getLineItemValue('addressbook', 'addr1', i);
            address.addr2 = addrecord.getLineItemValue('addressbook', 'addr2', i);
            address.addr3 = addrecord.getLineItemValue('addressbook', 'addr3', i);
            address.city = addrecord.getLineItemValue('addressbook', 'city', i);
            address.state = addrecord.getLineItemValue('addressbook', 'state', i);
            address.zip = addrecord.getLineItemValue('addressbook', 'zip', i);
            address.country = addrecord.getLineItemValue('addressbook', 'country', i);
            address.isresidential = addrecord.getLineItemValue('addressbook', 'isresidential', i);
            address.email = defaultEmail;
            address.isvalid = (stringIt(address.addressee) + stringIt(address.addr1) + stringIt(address.city) + stringIt(address.state) + stringIt(address.zip) != '');
            return address;
        }
    }

    return null; //ErrorObject("failed", "Unable to locate address");
}

function getDestinationXmlByRecordFields(recType, defaultPhone, defaultEmail) {
    addr = new Object();
    addr.internalid = record.getId();
    addr.attention = record.getFieldValue('shipattention');
    if (recType != 'itemfulfillment')
        addr.addressee = record.getFieldValue('shipaddressee');
    else
        addr.addressee = record.getFieldValue('shipcompany');
    addr.phone = record.getFieldValue('shipphone');
    if (addr.phone == null || addr.phone == '')
        addr.phone = defaultPhone;
    addr.addr1 = record.getFieldValue('shipaddr1');
    addr.addr2 = record.getFieldValue('shipaddr2');
    addr.addr3 = record.getFieldValue('shipaddr3');
    addr.city = record.getFieldValue('shipcity');
    addr.state = record.getFieldValue('shipstate');
    addr.zip = record.getFieldValue('shipzip');
    addr.country = record.getFieldValue('shipcountry');
    addr.isresidential = record.getFieldValue('shipisresidential');
    addr.email = defaultEmail;

    xmlDestination = '';
    xmlDestination += '<LocationCode>' + addr.internalid + '</LocationCode>';
    xmlDestination += '<CompanyName>' + stringIt(addr.addressee) + '</CompanyName>';
    xmlDestination += '<ContactName>' + stringIt(addr.attention) + '</ContactName>';
    xmlDestination += '<Phone>' + stringIt(addr.phone) + '</Phone>';
    xmlDestination += '<Email>' + stringIt(addr.email) + '</Email>';
    xmlDestination += '<Address1>' + stringIt(addr.addr1) + '</Address1>';
    if (addr.addr2 != null)
        xmlDestination += '<Address2>' + stringIt(addr.addr2) + '</Address2>';
    if (addr.addr3 != null)
        xmlDestination += '<Address3>' + stringIt(addr.addr3) + '</Address3>';
    xmlDestination += '<City>' + stringIt(addr.city) + '</City>';
    xmlDestination += '<StateOrProvinceCode>' + stringIt(addr.state) + '</StateOrProvinceCode>';
    xmlDestination += '<PostalCode>' + stringIt(addr.zip) + '</PostalCode>';
    xmlDestination += '<CountryName>' + stringIt(addr.country == '' ? 'US' : addr.country) + '</CountryName>';
    xmlDestination += '<Residential>' + (addr.isresidential == 'T') + '</Residential>';
    return xmlDestination;
}

function getThirdPartyAccounts(id, shiptoid) {
    var items = new Array();
    try {

        var filter = new Array();
        filter[0] = new nlobjSearchFilter('custrecord_pacejet_thirdparty_customer', null, 'anyof', id);
        filter[1] = new nlobjSearchFilter('custrecord_pacejet_thirdparty_isdefault', null, 'is', 'T');

        var columns = new Array();
        var col = new Array();
        col[0] = new nlobjSearchColumn('custrecord_pacejet_thirdparty_customer');
        col[1] = new nlobjSearchColumn('custrecord_pacejet_thirdparty_carrier');
        col[2] = new nlobjSearchColumn('custrecord_pacejet_thirdparty_accountnum');
        col[3] = new nlobjSearchColumn('custrecord_pacejet_thirdparty_address');
        col[4] = new nlobjSearchColumn('custrecord_pacejet_thirdparty_shipaddr');
        col[5] = new nlobjSearchColumn('name');

        var defaultResult = nlapiSearchRecord('customrecord_pacejet_thirdparty', null, filter, col);

        var thirdparty;
        var x = 0;
        var carrierAccounts = new Array();

        if (shiptoid != null) {
            filter[1] = new nlobjSearchFilter('custrecord_pacejet_thirdparty_shipaddr', null, 'anyof', shiptoid);
            var result = nlapiSearchRecord('customrecord_pacejet_thirdparty', null, filter, col);

            if (result != null) {
                for (var i = 0; result != null && i < result.length; i++) {
                    thirdparty = new Object();
                    thirdparty.customer = (result[i].getValue('custrecord_pacejet_thirdparty_customer') != null) ? result[i].getValue('custrecord_pacejet_thirdparty_customer') : null;
                    thirdparty.carrier = result[i].getValue('custrecord_pacejet_thirdparty_carrier');
                    thirdparty.accountnumber = result[i].getValue('custrecord_pacejet_thirdparty_accountnum');
                    thirdparty.address = getAddressBookByType('customer', id, result[i].getValue('custrecord_pacejet_thirdparty_address'));
                    thirdparty.name = result[i].getValue('name');

                    items[i] = thirdparty;
                    x++;
                }
            }
        }

        //Obtain a list of all default accounts and make sure the carrier isn't the same.  It's import to note that if they have a specific third party account and a default third party account,
        //then the records both need to use the same carrier selected (ex. Both need to select FedEx Ground, not FedEx ground for one and FedEx 2nd Day).
        if (defaultResult != null) {
            for (var i = 0; defaultResult != null && i < defaultResult.length; i++) {
                thirdparty = new Object();
                thirdparty.customer = (defaultResult[i].getValue('custrecord_pacejet_thirdparty_customer') != null) ? defaultResult[i].getValue('custrecord_pacejet_thirdparty_customer') : null;
                thirdparty.carrier = defaultResult[i].getValue('custrecord_pacejet_thirdparty_carrier');
                thirdparty.accountnumber = defaultResult[i].getValue('custrecord_pacejet_thirdparty_accountnum');
                thirdparty.address = getAddressBookByType('customer', id, defaultResult[i].getValue('custrecord_pacejet_thirdparty_address'));
                thirdparty.name = defaultResult[i].getValue('name');

                var addAccount = true;
                for (var tp = 0; result != null && tp < result.length; tp++) {
                    if (result[tp].getValue('custrecord_pacejet_thirdparty_carrier') == thirdparty.carrier) {
                        addAccount = false;
                    }
                }
                if (addAccount) {
                    items[x] = thirdparty;
                    x++;
                }
            }
        }

    } catch (e) {
        err = getErrorDetails(e);
        nlapiLogExecution('ERROR', 'getThirdPartyAccount', JSON.stringify(err));
    }
    return items;
}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function createMessage(name, value) {

    var oMessage = new Object();

    oMessage.Message = new Object();
    oMessage.Message.Name = name;
    oMessage.Message.Value = value;

    return oMessage;
}

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    return null;
    //throw new Error("Unable to copy obj! Its type isn't supported.");
}



function stringIt(obj) {
    return (obj == null ? '' : (!isNaN(obj) ? lines(String(obj)) : makeCdata(String(obj))));
}

function getNextTransactionID(pLocation) {

    try {
        var URL = 'http://app.pacejet.cc/pacejetpollingnotificationws/main.asmx';

        var header = new Array();
        header['Content-Type'] = 'text/xml; charset=utf-8';
        header['Content-Length'] = 'length';

        var body = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetNextTransactionID xmlns="http://pacejet.com/PacejetPollingNotificationWS"><pLocation>' + pLocation + '</pLocation></GetNextTransactionID></soap:Body></soap:Envelope>';
        var response = nlapiRequestURL(URL, body, header);
        var strResponse = response.getBody();
        var payloadXml;

        if (strResponse != null)
            payloadXml = nlapiSelectValue(nlapiStringToXML(strResponse), "//*[local-name()='GetNextTransactionIDResult']");
        return payloadXml;


    } catch (e) {
        err = getErrorDetails(e);
        nlapiLogExecution('ERROR', 'getNextTransactionID', JSON.stringify(err));
        return (S4() + S4() + S4() + S4() + S4()).substring(0, 7);
    }
}

//Helper to convert an object to xml
var json2xml = (function(my, undefined) {
    "use strict";
    var tag = function(name, options) {
        options = options || {};
        return "<" + (options.closing ? "/" : "") + name + ">";
    };
    var exports = {
        convert: function(obj, rootname) {
            var xml = "";
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    var value = obj[i],
                        type = typeof value;
                    if (value instanceof Array && type == 'object') {
                        for (var sub in value) {
                            xml += exports.convert(value[sub]);
                        }
                    } else if (value instanceof Object && type == 'object') {
                        xml += tag(i) + exports.convert(value) + tag(i, { closing: 1 });
                    } else {
                        if (!isNaN(value))
                            xml += tag(i) + value + tag(i, { closing: 1 });
                        else
                            xml += tag(i) + stringIt(value) + tag(i, { closing: 1 });
                    }
                }
            }
            return rootname ? tag(rootname) + xml + tag(rootname, { closing: 1 }) : xml;
        }
    };
    return exports;
})(json2xml || {});

function makeCdata(str) {
    return '<' + '![CDATA[' + lines(str) + ']]' + '>';
}

function lines(str) {
    // normalise line endings, all in file will be unixy
    str = str.replace(/\r\n/g, '\n');
    return str;
}

function getSetting(settingName, defaultValue) {
    nlapiLogExecution('DEBUG', scripttype + ' Setting Name: ' + settingName, 'Default: ' + defaultValue + ' Retrieved: ' + currentContext.getSetting('SCRIPT', settingName));
    if (currentContext.getSetting('SCRIPT', settingName) == null)
        return defaultValue;
    else
        return currentContext.getSetting('SCRIPT', settingName);
}

function getTransactionField(fldName, currentrecord, baserecord, ignoreBaseRecord) {

    try {
        if (fldName.indexOf('.') > -1) {
            switch (fldName.split('.')[0].toLowerCase()) {
                case 'salesorder':
                case 'estimate':
                case 'transferorder':
                    if (baserecord.getFieldValue(fldName.split('.')[1]) != null)
                        return baserecord.getFieldValue(fldName.split('.')[1]);
                    break;
                case 'itemfulfillment':
                case 'purchaseorder':
                    if (currentrecord.getFieldValue(fldName.split('.')[1]) != null)
                        return currentrecord.getFieldValue(fldName.split('.')[1]);
                    break;
                default:
                    break;
            }
        } else {
            if (currentrecord.getFieldValue(fldName) != null)
                return currentrecord.getFieldValue(fldName);
            else if (!ignoreBaseRecord && baserecord.getFieldValue(fldName) != null) {
                return baserecord.getFieldValue(fldName);
            }
        }

    } catch (e) {
        err = getErrorDetails(e);
        nlapiLogExecution('ERROR', 'getTransactionField', JSON.stringify(err));
        return '';
    }
}

function getErrorDetails(e) {
    var nle = nlapiCreateError(e);
    err = {
        stacktrace: nle.getStackTrace(),
        reasoncode: nle.getCode(),
        message: nle.getDetails(),
        event: nle.getUserEvent(),
        id: nle.getId(),
        internalid: nle.getInternalId()
    };
    return err;
}

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri(str) {
    var o = parseUri.options,
        m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

function round2Fixed(value, decPlaces) {
    if (decPlaces == null)
        decPlaces = 2;

    var val = value * Math.pow(10, decPlaces);
    var fraction = (Math.round((val - parseInt(val)) * 10) / 10);

    //this line is for consistency with .NET Decimal.Round behavior
    // -342.055 => -342.06
    if (fraction == -0.5) fraction = -0.6;

    val = Math.round(parseInt(val) + fraction) / Math.pow(10, decPlaces);
    return val;
}

Function.prototype.memoiz = function(hashFn, bind) {
    var memo = {},
        self = this;

    if (!hashFn) hashFn = function(arg) {
        return arg;
    };

    return function() {
        var key = hashFn.apply(self, arguments);
        return (key in memo) ? memo[key] : (memo[key] = self.apply(bind, arguments));
    };
};

var getThirdPartyMemoize = getThirdPartyAccounts.memoiz();
var getInventoryItemMemoize = getInventoryItem.memoiz();
var getInventoryItemAssemblyMemoize = getInventoryItemAssembly.memoiz();
var getEBizDimensionsMemoize = getEBizDimensions.memoiz();
var getContainerProfilesMemoize = getContainerProfiles.memoiz();