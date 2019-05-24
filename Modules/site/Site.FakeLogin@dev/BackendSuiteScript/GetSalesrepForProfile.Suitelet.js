function getSalesRep(request, response) {
    var out = {status: 'ERROR'};

    try {
        var customerId = request.getParameter('customerId');
        var salesrepName = nlapiLookupField('customer', customerId, 'salesrep.entityid');
        out.status = 'OK';
        out.salesrep = salesrepName;
    } catch(e) {
        out.message = e;
        nlapiLogExecution('ERROR', 'Error', e);
    }

    response.write(JSON.stringify(out));
}