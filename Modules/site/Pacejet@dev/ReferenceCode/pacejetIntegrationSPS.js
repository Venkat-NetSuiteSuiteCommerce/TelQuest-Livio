///<reference path="SuiteScriptAPI.js"/> 

/**

This Workflow job will be called upon every item fulfillment update is done

It will verify it has been fulfilled via Pacejet's integration and proceed to update SPS fields.

*/

var currentContext = nlapiGetContext();
var job_name = 'Pacejet SPS Integration';

//updateSPSFields('edit');

function updateSPSFields(type) {
    var recordId = 0;
    try {

        if (type == 'edit' && currentContext.getExecutionContext() != 'userinterface') {
            recordId = nlapiGetRecordId();

            /*
            Update the Script Deployment parameter "Mapping" to meet your specifications
            It goes as follows:
            custom_field=pacejet_xpath,custom_field=pacejet_xpath,custom_field=pacejet_xpath
            
            ex. custbody_sps_carrieralphacode=//Carrier,recmachcustrecord_sps_pack_asn.custrecord_sps_pk_weight=//CompletedPackageDetails/Weight/Value
            
            This will tell the script to update the bill of lading field in SPS tab with the //ProBill value in the Pacejet Update Entity hidden field, then the ShipmentDate with the //ShipTimestamp value
            
            Enter in as many as you wish.  The code will loop through the array and automatically update them.
            
            */
            //var smapped_fields = 'custbody_sps_billofladingnumber=//TransactionID,custbody_sps_carrierpronumber=//ProBill,custbody_sps_carriertransmethodcode=//CarrierClassOfService,custbody_sps_carrieralphacode=//Carrier,custbody_sps_fobpaycode=//FreightTerms,custbody_sps_trackingnumber=//MasterTrackingNumber,custbody_sps_shipmentweight=//RateDetail/TotalWeight/Value,custbody_sps_shipmentcarrierrouting=//Carrier';
            var smapped_fields = currentContext.getSetting('SCRIPT', 'custscript_pacejet_sps_header') != null ? currentContext.getSetting('SCRIPT', 'custscript_pacejet_sps_header') : "";

            var mapped_fields = smapped_fields.split(',');

            //var smapped_packfields = 'custrecord_sps_package_ucc=//PackingListNumber';
            var smapped_packfields = currentContext.getSetting('SCRIPT', 'custscript_pacejet_sps_containers') != null ? currentContext.getSetting('SCRIPT', 'custscript_pacejet_sps_containers') : "";
            var mapped_packfields = smapped_packfields.split(',');

            var sps_field = null;
            var pj_field = null;
            var pj_value = "";

            var if_status = nlapiLookupField('itemfulfillment', recordId, 'status');
            var if_updated = nlapiLookupField('itemfulfillment', recordId, 'custbody_pacejet_if_fulfilled');
            var sps_updated = nlapiLookupField('itemfulfillment', recordId, 'custbody_pacejet_sps_updated');

            nlapiLogExecution('DEBUG', 'Status', if_status);
            nlapiLogExecution('DEBUG', 'IF Updated', if_updated);
            nlapiLogExecution('DEBUG', 'SPS Updated', sps_updated);

            if (if_status == 'shipped' && sps_updated == 'F' && if_updated == 'T') {

                if (nlapiLookupField('itemfulfillment', recordId, 'custbody_sps_package_validation_bypass') == 'F')
                    nlapiSubmitField('itemfulfillment', recordId, 'custbody_sps_package_validation_bypass', 'T');

                deletePackages({ id: recordId });

                var rec = nlapiLoadRecord('itemfulfillment', recordId);

                nlapiLogExecution('DEBUG', job_name, 'Starting');
                nlapiLogExecution('DEBUG', 'Fields', smapped_fields);

                nlapiLogExecution('DEBUG', 'Record', recordId);
                nlapiLogExecution('DEBUG', job_name, 'Trying to get value from import xml');

                var pj_update = rec.getFieldValue('custbody_pacejet_updateentity');

                var pj_update_xml = pj_update != null ? nlapiStringToXML(cleanXML(pj_update)) : null;

                nlapiLogExecution('DEBUG', 'Found Update XML', pj_update_xml != null);

                if (pj_update_xml != null) {

                    if (mapped_fields.length > 0) {

                        for (var i = 0; i < mapped_fields.length; i++) {
                            try {
                                var mapped_field = mapped_fields[i].split('=');

                                //nlapiLogExecution('DEBUG', 'Mapped Fields [1]', i + ' ' + mapped_fields[i]);

                                if (mapped_field[0] == "")
                                    break;

                                sps_field = null;
                                pj_field = null;
                                pj_value = "";

                                sps_field = mapped_field[0].trim();
                                pj_field = mapped_field[1].trim();

                                nlapiLogExecution('DEBUG', 'PJ Xpath', pj_field);

                                pj_value = nlapiSelectValue(pj_update_xml, pj_field);

                                rec.setFieldValue(sps_field, pj_value);
                                nlapiLogExecution('DEBUG', 'Setting Value', sps_field + ' ' + pj_value);
                            } catch (e) {
                                var nlError = getErrorDetails(e);
                                nlapiLogExecution('DEBUG', 'ERROR ' + job_name + ' Header Mapping Field', JSON.stringify(nlError));
                            }
                        }

                    }

                    nlapiSubmitRecord(rec, false, true);

                    var containers = nlapiSelectNodes(pj_update_xml, '//CompletedPackageDetails/CompletedPackageDetails')
                    var arrItems = [];

                    nlapiLogExecution('DEBUG', 'Total Packages to loop', containers.length);

                    nlapiSubmitField('itemfulfillment', recordId, 'custbody_sps_trans_carton_ct', containers.length);

                    for (var i = 0; i < containers.length; i++) {

                        if (containers[i] == null)
                            break;

                        var items = nlapiSelectNodes(containers[i], "ItemList/Item");
                        var packageWeight = nlapiSelectValue(containers[i], "Weight/Value");
                        var totalQuantity = 0;
                        var packageWidth = nlapiSelectValue(containers[i], "Dimensions/Width");
                        var packageHeight = nlapiSelectValue(containers[i], "Dimensions/Height");
                        var packageLength = nlapiSelectValue(containers[i], "Dimensions/Length");
                        var packageTrackingNumber = nlapiSelectValue(containers[i], "TrackingNumber");

                        for (var x = 0; x < items.length; x++) {
                            totalQuantity += parseInt(nlapiSelectValue(items[x], "Quantity"));
                        }

                        var packageRecProfileId = getPackageProfile(packageLength, packageWidth, packageHeight, packageWeight);


                        var packageRec = nlapiCreateRecord('customrecord_sps_package');
                        packageRec.setFieldValue('custrecord_sps_pk_weight', packageWeight);
                        packageRec.setFieldValue('custrecord_sps_pack_asn', recordId);
                        packageRec.setFieldValue('custrecord_sps_package_qty', totalQuantity);
                        packageRec.setFieldValue('custrecord_sps_package_box_type', packageRecProfileId);
                        packageRec.setFieldValue('custrecord_sps_package_height', packageHeight)
                        packageRec.setFieldValue('custrecord_sps_package_length', packageLength)
                        packageRec.setFieldValue('custrecord_sps_package_width', packageWidth)
                        packageRec.setFieldValue('custrecord_sps_track_num', packageTrackingNumber)
                        packageRec.setFieldValue('custrecord_sps_package_carton_index', i + 1);

                        nlapiLogExecution('DEBUG', 'Container ' + i, 'Weight: ' + packageWeight + ' LxWxH: ' + packageLength + 'x' + packageWidth + 'x' + packageHeight);

                        if (mapped_packfields.length > 0) {

                            for (var j = 0; j < mapped_packfields.length; j++) {
                                try {
                                    var mapped_packfield = mapped_packfields[j].split('=');
                                    if (mapped_packfield[0] == "")
                                        break;

                                    sps_field = null;
                                    pj_field = null;
                                    pj_value = "";

                                    sps_field = mapped_packfield[0].trim();
                                    pj_field = mapped_packfield[1].trim();

                                    nlapiLogExecution('DEBUG', 'PJ Xpath', pj_field);

                                    pj_value = nlapiSelectValue(containers[i], pj_field)

                                    packageRec.setFieldValue(sps_field, pj_value);
                                    nlapiLogExecution('DEBUG', 'Setting Value', sps_field + ' ' + pj_value);

                                } catch (e) {
                                    var nlError = getErrorDetails(e);
                                    nlapiLogExecution('DEBUG', 'ERROR ' + job_name + ' Package Contents Record', JSON.stringify(nlError));
                                }

                            }
                        }

                        var packageId = nlapiSubmitRecord(packageRec);
                        var itemId;
                        nlapiLogExecution('DEBUG', 'Added package', packageId + ' ' + i);

                        try {
                            // We will want to loop through all the items and add them to an array to ensure any duplicate items are added together.
                            for (var x = 0; x < items.length; x++) {
                                itemId = nlapiSelectValue(items[x], "ExternalID");
                                var blnFound = false;

                                for (var j = 0; j < arrItems.length; j++) {
                                    if (arrItems[j].itemId == itemId && arrItems[j].packageId == packageId) {
                                        blnFound = true;
                                        arrItems[j].itemQuantity = arrItems[j].itemQuantity + parseInt(nlapiSelectValue(items[x], "Quantity"));
                                        break;
                                    }
                                }

                                if (!blnFound) {
                                    arrItems.push({ itemId: itemId, itemQuantity: parseInt(nlapiSelectValue(items[x], "Quantity")), itemLine: parseInt(nlapiSelectValue(items[x], "UserFieldList/UserField1")), packageId: packageId });
                                }

                            }
                        } catch (err) {
                            var nlError = getErrorDetails(err);
                            nlapiLogExecution('DEBUG', 'ERROR ' + job_name + ' Header Mapping Field', JSON.stringify(nlError));
                        }
                    }

                    try {

                        for (var x = 0; x < arrItems.length; x++) {

                            var itemQuantity = arrItems[x].itemQuantity;
                            var itemId = arrItems[x].itemId;
                            var itemLine = arrItems[x].itemLine + 1;
                            packageId = arrItems[x].packageId;

                            var packageContentsRec = nlapiCreateRecord('customrecord_sps_content');
                            packageContentsRec.setFieldValue('custrecord_sps_content_package', packageId);
                            packageContentsRec.setFieldValue('custrecord_sps_content_qty', itemQuantity);
                            packageContentsRec.setFieldValue('custrecord_sps_content_item', itemId);
                            packageContentsRec.setFieldValue('custrecord_sps_content_item_line_num', itemLine + 1);
                            nlapiSubmitRecord(packageContentsRec);

                        }

                    } catch (err) {
                        var nlError = getErrorDetails(err);
                        nlapiLogExecution('DEBUG', 'ERROR ' + job_name + ' Create Package Items Field', JSON.stringify(nlError));
                    }
                    nlapiSubmitField(rec.getRecordType(), recordId, 'custbody_pacejet_sps_updated', 'T');
                }

            }

            nlapiLogExecution('DEBUG', job_name, 'Done');
            return true;
        }
    } catch (err) {
        var nlError = getErrorDetails(err);
        nlapiLogExecution('DEBUG', 'ERROR ' + job_name + ' updatedSPSFields', JSON.stringify(err));
        return false;
    } finally {
        try {
            if (nlapiLookupField('itemfulfillment', recordId, 'custbody_sps_package_validation_bypass') == 'T')
                nlapiSubmitField('itemfulfillment', recordId, 'custbody_sps_package_validation_bypass', 'F');
        } catch (e) {
            nlapiLogExecution('DEBUG', 'ERROR ' + job_name + ' SPS Bypass Issue', JSON.stringify(e));
        }
    }
}

function getPackageProfile(l, w, h, weight) {

    var filters = new Array();
    filters.push(new nlobjSearchFilter('custrecord_sps_pack_len', null, 'equalto', l));
    filters.push(new nlobjSearchFilter('custrecord_sps_pack_wth', null, 'equalto', w));
    filters.push(new nlobjSearchFilter('custrecord_sps_pack_hgt', null, 'equalto', h));
    filters.push(new nlobjSearchFilter('custrecord_sps_box_weight', null, 'equalto', weight));

    var packageProfileRec = nlapiSearchRecord('customrecord_sps_pack_type', null, filters, null);

    if (packageProfileRec != null && packageProfileRec.length > 0) {
        return packageProfileRec[0].getId();
    }

    var packageRecProfile = nlapiCreateRecord('customrecord_sps_pack_type');
    packageRecProfile.setFieldValue('name', l + 'x' + w + 'x' + h + ' ' + weight);
    packageRecProfile.setFieldValue('custrecord_sps_pack_hgt', h);
    packageRecProfile.setFieldValue('custrecord_sps_pack_len', l);
    packageRecProfile.setFieldValue('custrecord_sps_pack_wth', w);
    packageRecProfile.setFieldValue('custrecord_sps_box_weight', weight);
    return nlapiSubmitRecord(packageRecProfile);

}

function deletePackages(datain) {
    nlapiLogExecution('DEBUG', 'Deleting packages', '');

    var packages = nlapiSearchRecord('customrecord_sps_package', null, new nlobjSearchFilter('custrecord_sps_pack_asn', null, 'anyof', datain.id), new nlobjSearchColumn('custrecord_sps_pack_asn'));

    if (packages != null) {

        for (var x = 0; x < packages.length; x++) {

            var oPackage = packages[x];
            var packageId = oPackage.getId();

            var packageinfos = nlapiSearchRecord('customrecord_sps_content', null, new nlobjSearchFilter('custrecord_sps_content_package', null, 'is', packageId), null);
            if (packageinfos != null) {
                for (var z = 0; z < packageinfos.length; z++) {
                    try {
                        nlapiDetachRecord(packageinfos[z].getRecordType(), packageinfos[z].getId(), oPackage.getRecordType(), packageId, { 'field': 'custrecord_sps_content_package' })
                    } catch (e) {
                        var nlerror = getErrorDetails(e);
                        nlapiLogExecution('ERROR', 'Delete Package Item', 'Can\'t delete item: ' + nlerror);
                    }
                }
            }

            try {
                nlapiDeleteRecord(oPackage.getRecordType(), oPackage.getId());
            } catch (e) {
                var nlerror = getErrorDetails(e);
                nlapiLogExecution('ERROR', 'Delete Packages', 'Can\'t delete package: ' + nlerror);
            }
        }
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

function cleanXML(xml) {
    return xml.replace('<?xml version="1.0" encoding="utf-16"?>', '').replace(' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"', '').replace("&", "&amp;");
}

function arrayHas(array, sProp, sVal) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][sProp] == sVal) return true;
    }
    return false;
}