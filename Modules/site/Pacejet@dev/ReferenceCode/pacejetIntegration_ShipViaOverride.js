///<reference path="MfsNsIntelliSense.min.js"/> 
function FieldChanged(type, name) {

    try {
        //  Prompt for additional information,  based on values already selected. 
        if (name == 'entity') {

            var customer = nlapiGetFieldValue('entity');
            var record = nlapiLoadRecord('customer', customer);
            var shipvia_override = record.getFieldValue('custentity_pacejet_shipvia_override');
            var freight_term_override = record.getFieldValue('custentity_pacejet_freight_term_override');
            var freight_acct_override = record.getFieldValue('custentity_pacejet_freightacctoverride');

            if (shipvia_override != null && shipvia_override != '') {
                nlapiSetFieldValue('shipcarrier', 'nonups', null, true);
                nlapiSetFieldValue('shipmethod', shipvia_override, null, true);
            }
            if (freight_term_override!= null && freight_term_override != '') {
            	nlapiSetFieldValue('custbody_pacejet_freight_terms', freight_term_override, null, true);
            }

            if (freight_acct_override != null) {
            	nlapiSetFieldValue('custbody_pacejet_freightacctoverride', freight_acct_override, null, true);
            }
        }

    } catch(e) {
        nlapiLogExecution('ERROR', 'Ship Via Exception', e.message);
    }
}