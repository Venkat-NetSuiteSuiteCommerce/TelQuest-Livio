/**
 * This Schedule update plugin is an example of how a partner can alter the behavior of an update when a scheduled Pacejet
 * update occurs.
 * 
 * The customUpdates function, if exists, will be called instead of the default update behavior included in the bundle.
 * 
 * It is recommened to create your own plugin file rather than use the bundled file as bundle updates will overwrite 
 * changes made.
 * 
 * @param  {itemfulfillment} record
 * @param  {shipconfirmation} shipConfirm
 * @param  {nsPackages} Netsuite Packages
 */

/*
// Uncomment the following function to utilize the customUpdates pattern.
function customUpdates(record, confirm, nsPackages) {
    nlapiLogExecution('DEBUG', 'customUpdates', 'Initiating custom updates...');

    if (confirm.subMethod == 'SalesOrder') {
        try {
            var soRecord = nlapiLoadRecord('salesorder', confirm.externalTransactionID);
            soRecord.setFieldValue('shippingcost', confirm.rateDetail.freightTotalPrice.amount);
            soRecord.setFieldValue('shipmethod', shipVia);
            nlapiSubmitRecord(soRecord, false, true);

        } catch (e) {
            if (e instanceof nlobjError)
                log('ERROR', 'customUpdates Error: ' + e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace())
            else
                log('ERROR', 'customUpdates Error: ' + e.toString())
        }
    }

    // Example to show how a change in the address made in Pacejet can be updated in Netsuite
    // nlapiLogExecution('DEBUG', 'Changing Address', JSON.stringify(confirm.destination));
    // record.setFieldValue('shipattention', confirm.destination.companyName);
    // record.setFieldValue('shipaddr1', confirm.destination.address1);
    // record.setFieldValue('shipcity', confirm.destination.city);
    // record.setFieldValue('shipstate', confirm.destination.stateOrProvinceCode);
    // record.setFieldValue('shipcountry', confirm.destination.countryCode);


    nlapiLogExecution('DEBUG', 'customUpdates', 'Cost: ' + confirm.rateDetail.freightTotalPrice.amount);
    record.setFieldValue('shippingcost', confirm.rateDetail.freightTotalPrice.amount);

    nlapiLogExecution('DEBUG', 'customUpdates', 'Status: Shipped');
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
*/