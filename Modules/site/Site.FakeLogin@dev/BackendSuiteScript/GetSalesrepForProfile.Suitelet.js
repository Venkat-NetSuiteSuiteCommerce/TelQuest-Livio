function getSalesRep(request, response) {
    var out = {status: 'ERROR'};

    try {
        var customerId = request.getParameter('customerId');
        var salesrepName = nlapiLookupField('customer', customerId, 'salesrep.entityid');
        nlapiLogExecution('DEBUG', 'salesrepName', JSON.stringify(salesrepName));
        var salesrep = nlapiLookupField('customer', customerId, 'salesrep');
        nlapiLogExecution('DEBUG', 'salesrep', JSON.stringify(salesrep));
        var salesrepPhone = nlapiLookupField('customer', customerId, 'salesrep.phone');
        nlapiLogExecution('DEBUG', 'salesrepPhone', JSON.stringify(salesrepPhone));
        var salesrepEmail = nlapiLookupField('customer', customerId, 'salesrep.email');
        nlapiLogExecution('DEBUG', 'salesrepEmail', JSON.stringify(salesrepEmail));
        out.status = 'OK';
        out.salesrep = {
            name: salesrepName,
            phone: salesrepPhone,
            email: salesrepEmail
        };
        nlapiLogExecution('DEBUG', 'out', JSON.stringify(out));
    } catch(e) {
        out.message = e;
        out.status = 'ERROR';
        nlapiLogExecution('ERROR', 'Error', e);
    }

    response.write(JSON.stringify(out));
}