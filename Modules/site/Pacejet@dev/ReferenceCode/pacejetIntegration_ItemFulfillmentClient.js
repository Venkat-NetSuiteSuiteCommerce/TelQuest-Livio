///<reference path="MfsNsIntelliSense.min.js"/> 
function pageInit() {
    
}


function saveRecordEvent() {
	
	if (String(nlapiGetFieldValue('custpage_pj_workstation')).length > 0) {
		nlapiSetFieldValue('custbody_pacejet_workstation', nlapiGetFieldValue('custpage_pj_workstation'), null, 'T');
	}
	return true;
}