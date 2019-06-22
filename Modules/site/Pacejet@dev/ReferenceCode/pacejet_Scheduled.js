/**
 * 
 */
var currentContext = nlapiGetContext();

var pacejetLocation = currentContext.getSetting('SCRIPT', 'custscript_pj_sched_loc');
var pacejetLicenseKey = currentContext.getSetting('SCRIPT', 'custscript_pj_sched_key');

var nsFeatures = null;
var nsFeaturesShippingLabels = false;
var nsFeaturesIntegratedShipping = false;

var bundleVersion = currentContext.getBundleId();
var requestHeader = null;

var baseUrl = currentContext.getSetting('SCRIPT', 'custscript_pj_sched_url')

function getConfirmations(type) {
    log('DEBUG', 'Starting Update Job: ' + type);

    try {
        if (!(type == 'scheduled' || type == 'ondemand')) return;
        if (!checkUsage()) return;

        log('DEBUG', 'Collecting list of shipment confirmations...');
        var resp = makeUrlRequest(baseUrl + 'ConfirmsList/New/ShipmentConfirms');
        handleGetConfirmations(resp, "ShipmentConfirms");
        log('DEBUG', 'Collecting list of shipment confirmations done.');

        log('DEBUG', 'Collecting list of quote confirmations...');
        var resp = makeUrlRequest(baseUrl + 'ConfirmsList/New/QuoteConfirms');
        handleGetConfirmations(resp, "QuoteConfirms");
        log('DEBUG', 'Collecting list of quote confirmations done.');

        log('DEBUG', 'Collecting list of void confirmations...');
        var resp = makeUrlRequest(baseUrl + 'ConfirmsList/New/VoidConfirms');
        handleGetConfirmations(resp, "VoidConfirms");
        log('DEBUG', 'Collecting list of shipment confirmations done.');



    } catch (e) {
        if (e instanceof nlobjError)
            log('ERROR', 'getConfirmations Error: ' + e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace())
        else
            log('ERROR', 'getConfirmations Error: ' + e.toString())
    }
}

function handleGetConfirmations(response, type) {
    var confirms = JSON.parse(response.body).transactionIDList;

    log('AUDIT', 'Obtained ' + confirms.length + ' shipment confirmations.');

    if (confirms.length > 0 && type != 'VoidConfirms') {
        nsFeatures = nlapiLoadConfiguration('companyfeatures')
        nsFeaturesShippingLabels = nsFeatures.getFieldValue('shippinglabels') == 'T'
    }

    for (var x = 0; x < confirms.length; x++) {
        log('DEBUG', 'Getting ' + type + ': ' + confirms[x]);
        getConfirmation(confirms[x], type);
    }
}

function getConfirmation(deliveryOrder, type) {
    var response = makeUrlRequest(baseUrl + type + '/' + deliveryOrder);
    log('DEBUG', 'Obtained ' + type + ': ' + deliveryOrder);
    handleGetConfirmation(response, type);
}

function getNotifications(deliveryOrder) {

}

function handleGetConfirmation(response, type) {
    try {
        var confirm = JSON.parse(response.body);
        if (confirm.notifications.highestSeverity > 0) {
            log('ERROR', 'handleGetConfirmation', 'There was an error for Delivery Order: ' + confirm.transactionID + ' with the error: ' + JSON.stringify(confirm.notifications.highestSeverityNotification));
        } else {
            if (confirm.externalTransactionID != null && confirm.externalTransactionID != "") {
                log('DEBUG', 'handleGetConfirmation', 'Transaction: ' + confirm.externalTransactionID);

                if (confirm.subMethod == null) {
                    //log('DEBUG', 'handleGetConfirmation', 'Invalid subMethod');



                    return;
                }

                var record = null;
                var soRecord = null;
                if (confirm.method.toLowerCase() == 'shipimport') {
                    if (confirm.subMethod.toLowerCase() == "salesorder") {
                        soRecord = nlapiLoadRecord('SalesOrder', confirm.externalTransactionID);
                        if (soRecord.getLineItemCount('links') > 0)
                            for (var link = 1; link <= soRecord.getLineItemCount('links'); link++) {
                                if (soRecord.getLineItemValue('links', 'type', link) == 'Item Fulfillment')
                                    record = nlapiLoadRecord('itemfulfillment', soRecord.getLineItemValue('links', 'id', link));
                            }

                        if (record == null)
                            record = nlapiTransformRecord(confirm.subMethod, confirm.externalTransactionID, 'itemfulfillment', {
                                recordmode: 'dynamic'
                            });
                        log('DEBUG', 'handleGetConfirmation', 'Sourced from a Sales Order (' + confirm.externalTransactionID + ').  Transforming into an item fulfillment.');
                    } else {
                        try {
                            nlapiSubmitField('itemfulfillment', confirm.externalTransactionID, 'custbody_pacejet_sps_updated', 'F');
                        } catch (ex) {}

                        record = nlapiLoadRecord('itemfulfillment', confirm.externalTransactionID, {
                            recordmode: 'dynamic'
                        });
                    }
                } else if (confirm.method.toLowerCase() == 'freightquoteimport' || confirm.method.toLowerCase() == 'shipvoidupdate') {
                    record = nlapiLoadRecord(confirm.subMethod, confirm.externalTransactionID, { recordmode: 'dynamic' });
                }

                if (type == "VoidConfirms") {
                    handleVoid(record, confirm);
                }

                if (type == "QuoteConfirms") {
                    handleQuoteUpdate(record, confirm);
                }

                if (type == "ShipmentConfirms") {

                    // Cost updates
                    var freightTotalPrice = confirm.rateDetail.freightTotalPrice.amount;
                    var freightTotalCost = confirm.rateDetail.freightTotalCost.amount;
                    var freightTerms = getFreightTerm(confirm.freightTerms);

                    record.setFieldValue('custbody_pacejet_tracking_link', baseUrl.replace('devapi', 'dev').replace('api', 'appn') + '/' + pacejetLocation + '/Content/Transactions/SearchShipments.aspx?lstSearchFor=DeliveryOrder&amp;txtSearchValue=');
                    record.setFieldValue('custbody_pacejet_if_carrier_tracking', confirm.completedPackageDetailsList[0].trackingUrl != '' ? confirm.completedPackageDetailsList[0].trackingUrl : '');
                    record.setFieldValue('custbody_pacejet_master_tracking_num', confirm.completedPackageDetailsList[0].trackingNumber != '' ? confirm.completedPackageDetailsList[0].trackingNumber : '');
                    record.setFieldValue('custbody_pacejet_freight_cost', confirm.rateDetail.freightTotalCost.amount);
                    record.setFieldValue('custbody_pacejet_freight_price', confirm.rateDetail.freightTotalPrice.amount);
                    record.setFieldValue('custbody_pacejet_freight_costcurrency', confirm.rateDetail.freightTotalCost.amount);
                    record.setFieldValue('custbody_pacejet_freight_pricecurrency', confirm.rateDetail.freightTotalPrice.amount);
                    record.setFieldValue('custbody_pacejet_shipped_method', confirm.carrier + ' ' + confirm.carrierClassOfService);

                    if (record.getFieldValue('custbody_pacejet_freight_terms') != freightTerms)
                        record.setFieldValue('custbody_pacejet_freight_terms', freightTerms);

                    record.setFieldValue('custbody_pacejet_if_fulfilled', 'T');

                    // Shipping Carrier updates
                    var shippingMethod = confirm.shipVia;
                    var shipItem = null;

                    deletePackages(confirm.externalTransactionID);

                    if (shippingMethod != null) {
                        try {
                            record.setFieldValue('shipmethod', shippingMethod);
                        } catch (error) {
                            log('EMERGENCY', 'handleGetConfirmation', 'Unable to set ship method as it will require reloading record. Set to ' + confirm.carrier + ' ' + confirm.carrierClassOfService + ' manually.');
                        }
                        shipItem = nlapiLoadRecord('shipitem', shippingMethod);
                        nsFeaturesIntegratedShipping = (shipItem.getFieldValue('costbasis') != null && shipItem.getFieldValue('costbasis').indexOf('RealTimeRate') > 0)

                        var integratedCarrier = nsFeaturesIntegratedShipping ? confirm.carrier.toLowerCase() : '';

                        var lines = record.getLineItemCount('package');
                        for (var line = lines; line >= 1; line--)
                            record.removeLineItem('package', line);

                        var nsPackages = [];

                        var packages = confirm.completedPackageDetailsList;
                        for (var iPackage in confirm.completedPackageDetailsList) {
                            var package = confirm.completedPackageDetailsList[iPackage];
                            if (package) {

                                var sItemDescription = '';
                                for (var iItem in package.itemList) {
                                    var item = package.itemList[iItem];
                                    if (sItemDescription != '')
                                        sItemDescription += ', ';
                                    sItemDescription += item.productNumber + ':' + item.quantity;
                                }

                                var nsPackage = {
                                    package: 'package' + integratedCarrier,
                                    packagedescr: sItemDescription,
                                    packageweight: package.weight.value,
                                    packagetrackingnumber: package.trackingNumber,
                                    integratedcarriername: integratedCarrier
                                };
                                nsPackages.push(nsPackage);

                                var pacejetPkgRecord = nlapiCreateRecord('customrecord_pacejet_package_info');
                                pacejetPkgRecord.setFieldValue('name', package.packingListNumber);
                                pacejetPkgRecord.setFieldValue('custrecord_pacejet_package_id', package.packingListNumber);

                                pacejetPkgRecord.setFieldValue('custrecord_pacejet_package_contents', sItemDescription);
                                pacejetPkgRecord.setFieldValue('custrecord_pacejet_package_tracking', package.trackingNumber);
                                pacejetPkgRecord.setFieldValue('custrecord_pacejet_package_tracking_link', package.trackingUrl);
                                pacejetPkgRecord.setFieldValue('custrecord_pacejet_package_weight', package.weight.value);
                                pacejetPkgRecord.setFieldValue('custrecord_pacejet_transaction_link', [confirm.externalTransactionID, confirm.userFieldList.userField15]);

                                pacejetPkgID = nlapiSubmitRecord(pacejetPkgRecord, true);

                                for (var iItem in package.itemList) {
                                    var item = package.itemList[iItem];
                                    var pacejetPkgItemRecord = nlapiCreateRecord('customrecord_pacejet_package_item_info');
                                    pacejetPkgItemRecord.setFieldValue('name', item.productNumber);
                                    pacejetPkgItemRecord.setFieldValue('custrecord_pacejet_packinfo_item_link', item.externalID);
                                    pacejetPkgItemRecord.setFieldValue('custrecord_pacejet_packinfo_package_link', pacejetPkgID);
                                    pacejetPkgItemRecord.setFieldValue('custrecord_pacejet_packinfo_item_qty', item.quantity);
                                    nlapiSubmitRecord(pacejetPkgItemRecord, true);
                                }
                            }
                        }
                    }

                    // Control the update to Netsuite
                    handleUpdate(record, confirm, nsPackages);

                    var lines = record.getLineItemCount('package');
                    log('DEBUG', 'Packages count', lines);

                }

                log('DEBUG', 'Updating confirm as received', confirm.externalTransactionID + ' ' + type);
                var updateResponse = makeUrlRequest(baseUrl + type, JSON.stringify({
                    TransactionID: confirm.transactionID,
                    Status: 'Success',
                    StatusMessage: 'Success!'
                }), 'PUT');
                log('DEBUG', 'handleGetConfirmation', 'Notified Pacejet of successfully acknowledging Confirm record');

            } else {
                pause(2);
            }
        }

    } catch (e) {
        if (e instanceof nlobjError)
            log('ERROR', 'handleGetConfirmation Error: ' + e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace());
        else
            log('ERROR', 'handleGetConfirmation Error: ' + e.toString());
    }
}

function handleVoid(record, confirm) {
    try {
        log('DEBUG', 'handleVoid', ' Initiating void updates...');
        record.setFieldValue('custbody_pacejet_tracking_link', '');
        record.setFieldValue('custbody_pacejet_if_carrier_tracking', '');
        record.setFieldValue('custbody_pacejet_master_tracking_num', '');
        record.setFieldValue('custbody_pacejet_freight_cost', '0.00');
        record.setFieldValue('custbody_pacejet_freight_price', '');
        record.setFieldValue('custbody_pacejet_freight_costcurrency', null);
        record.setFieldValue('custbody_pacejet_freight_pricecurrency', null);
        record.setFieldValue('custbody_pacejet_shipped_method', '');
        record.setFieldValue('custbody_pacejet_if_fulfilled', 'F');
        record.setFieldValue('shippingcost', (confirm.userFieldList.userField13 != null && confirm.userFieldList.userField13 != "" ? confirm.userFieldList.userField13 : null));
        try {
            record.setFieldValue('shipmethod', (confirm.userFieldList.userField14 != record.getFieldValue('shippingMethod') ? confirm.userFieldList.userField14 : ''));
        } catch (error) {
            log('EMERGENCY', 'handleVoid', 'Unable to set ship method as it will require reloading record. Set to ' + confirm.carrier + ' ' + confirm.carrierClassOfService + ' manually.');
        }

        deletePackages(confirm.externalTransactionID);

        var lines = record.getLineItemCount('package');
        for (var line = lines; line >= 1; line--)
            record.removeLineItem('package', line);

        record.setFieldValue('shipstatus', 'A');

        recordid = nlapiSubmitRecord(record, false, true);
        log('DEBUG', 'handleVoid', 'Successfully voided record: ' + record.getId());
    } catch (e) {
        if (e instanceof nlobjError)
            log('ERROR', 'handleVoid', 'Error: ' + e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace());
        else
            log('ERROR', 'handleVoid', 'Error: ' + e.toString());
    }
}

function handleQuoteUpdate(record, confirm) {

    try {

        log('DEBUG', 'customUpdates: Initiating Base updates...');
        log('DEBUG', 'customUpdates Cost: ' + confirm.rateDetail.freightTotalPrice.amount);
        record.setFieldValue('shippingcost', confirm.rateDetail.freightTotalPrice.amount);
        record.setFieldValue('custbody_pacejet_freight_cost', confirm.rateDetail.freightTotalCost.amount);
        record.setFieldValue('custbody_pacejet_freight_price', confirm.rateDetail.freightTotalPrice.amount);
        record.setFieldValue('custbody_pacejet_freight_costcurrency', confirm.rateDetail.freightTotalCost.amount);
        record.setFieldValue('custbody_pacejet_freight_pricecurrency', confirm.rateDetail.freightTotalPrice.amount);

        try {
            record.setFieldValue('shipmethod', (confirm.shipVia != record.getFieldValue('shippingMethod') ? confirm.shipVia : ''));
            if (confirm.subMethod == 'purchaseorder')
                record.setFieldValue('custbody_pacejet_shipped_method', confirm.carrier + ' ' + confirm.carrierClassOfService);
        } catch (error) {
            log('EMERGENCY', 'handleVoid', 'Unable to set ship method as it will require reloading record. Set to ' + confirm.carrier + ' ' + confirm.carrierClassOfService + ' manually.');
        }
        recordid = nlapiSubmitRecord(record, false, true);
        log('AUDIT', 'Successfully updated record: ' + record.getId());
    } catch (e) {
        if (e instanceof nlobjError)
            log('ERROR', 'handleQuoteUpdate Error: ' + e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace())
        else
            log('ERROR', 'handleQuoteUpdate Error: ' + e.toString())
    }
}

function handleUpdate(record, confirm, nsPackages) {

    try {

        if (functionExists('customUpdates')) {
            // Customer has a plugin with a function that matches the customUpdate signature: function(record, confirm)
            customUpdates(record, confirm, nsPackages);
        } else {

            log('DEBUG', 'customUpdates: Initiating Base updates...');
            freightTotalCost = confirm.rateDetail.freightTotalCost.amount;
            freightTotalPrice = confirm.rateDetail.freightTotalPrice.amount
            if (!(confirm.freightTerms != null && (confirm.freightTerms == '' || confirm.freightTerms.toLowerCase() == 'prepaid and charge'))) {
                freightTotalPrice = 0;
                freightTotalCost = 0;
                log('DEBUG', 'handleUpdate', 'Freight Terms isn\'t prepaid and charge so shipping cost will be set to $0.00');
            }
            log('DEBUG', 'customUpdates Cost: ' + freightTotalCost);
            record.setFieldValue('shippingcost', freightTotalCost);

            log('DEBUG', 'customUpdates Status: Shipped');
            record.setFieldValue('shipstatus', 'C');

            //When setting shipstatus from picked/packed to shipped, the packages get made automatically.
            //So we delete them here and make our own.  If you have a custom update, you will need to do the same thing.
            var lines = record.getLineItemCount('package');
            for (var line = lines; line >= 1; line--)
                record.removeLineItem('package', line);
            if (nsPackages != null && nsPackages.length > 0) {
                for (i = 0; i < nsPackages.length; i++) {
                    var nsPackage = nsPackages[i];
                    record.selectNewLineItem(nsPackage.package);
                    record.setCurrentLineItemValue(nsPackage.package, 'packageweight' + nsPackage.integratedcarriername, nsPackage.packageweight);
                    record.setCurrentLineItemValue(nsPackage.package, 'packagedescr' + nsPackage.integratedcarriername, nsPackage.packagedescr);
                    record.setCurrentLineItemValue(nsPackage.package, 'packagetrackingnumber' + nsPackage.integratedcarriername, nsPackage.packagetrackingnumber);
                    record.commitLineItem(nsPackage.package);
                }
            }
        }

        recordid = nlapiSubmitRecord(record, false, true);
        log('AUDIT', 'Successfully updated record: ' + record.getId());

    } catch (e) {
        if (e instanceof nlobjError)
            log('ERROR', 'handleUpdate Error: ' + e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace())
        else
            log('ERROR', 'handleUpdate Error: ' + e.toString())
    }
}

function deletePackages(transactionID) {

    // Delete old Pacejet Packages if any
    var col = new Array();
    col[0] = new nlobjSearchColumn('custrecord_pacejet_transaction_link');
    var filter = new Array();
    filter[0] = new nlobjSearchFilter('custrecord_pacejet_transaction_link', null, 'anyof', transactionID);
    var packages = nlapiSearchRecord('customrecord_pacejet_package_info', null, filter, col);
    if (packages != null) {
        for (var x = 0; x < packages.length; x++) {
            var oPackage = packages[x];
            var packageinfos = nlapiSearchRecord('customrecord_pacejet_package_item_info', null,
                new nlobjSearchFilter('custrecord_pacejet_packinfo_package_link', null, 'is', oPackage.getId()), null);

            if (packageinfos != null) {
                for (var z = 0; z < packageinfos.length; z++) {
                    nlapiDeleteRecord('customrecord_pacejet_package_item_info', packageinfos[z].getId());
                }
            }
            nlapiDeleteRecord('customrecord_pacejet_package_info', oPackage.getId());
        }
    }
}

function getFreightTerm(freighttermname) {

    try {

        if (freighttermname == null || freighttermname == '')
            return null;

        var ftRecord = nlapiCreateRecord('salesorder');
        var field = ftRecord.getField('custbody_pacejet_freight_terms');
        var items = field.getSelectOptions(freighttermname, 'is');

        if (items.length > 0) {
            return items[0].getId();
        }
    } catch (e) {
        var nle = nlapiCreateError(e);
        err = {
            status: 'error',
            reasoncode: nle.getCode(),
            message: nle.getDetails()
        };

        nlapiLogExecution('ERROR', 'getFreightTerm', JSON.stringify(err))

    }

    return null;
}

function checkUsage() {
    if (currentContext.getRemainingUsage() <= 0) {
        var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId())
        if (status == 'QUEUED')
            return false;
    }
    return true;
}

function makeUrlRequest(url, data, verb) {
    requestHeader = {
        'content-type': 'application/json',
        'pacejetlocation': pacejetLocation,
        'pacejetlicensekey': pacejetLicenseKey
    };
    if (verb != null)
        return nlapiRequestURL(url, data, requestHeader, verb);

    return nlapiRequestURL(url, data, requestHeader);
}

function log(type, title, msg) {
    if (msg == null) {
        msg = title;
        title = 'Scheduled Updates';
    }
    nlapiLogExecution(type, title, msg);
}

function pause(waitTime) { //seconds
    try {
        var endTime = new Date().getTime() + waitTime * 1000;
        var now = null;
        do {
            //throw in an API call to eat time
            now = new Date().getTime(); //
        } while (now < endTime);
    } catch (e) {
        log("ERROR", "not enough sleep");
    }
}

function functionExists(obj) {
    return (eval('typeof ' + obj) !== 'undefined' && eval('typeof ' + obj) === 'function');
}