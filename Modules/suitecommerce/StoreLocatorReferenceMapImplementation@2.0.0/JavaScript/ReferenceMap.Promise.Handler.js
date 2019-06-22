/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module StoreLocatorReferenceMapsImplementation
define(
	'ReferenceMap.Promise.Handler'
,	[]
,	function ()
{
    'use strict';

    var instance = null;

    function ReferenceMapPromiseHandler() {

        if (instance !== null)
        {
            throw new Error('Cannot instantiate more than one ReferenceMapPromiseHandler, use ReferenceMapPromiseHandler.getInstance()');
        }

        this.initialize();
    }

    ReferenceMapPromiseHandler.prototype = {
        initialize: function() {
        	this.promise = null;
        }
     ,	setPromise: function(promise) {
     		this.promise = promise;
     	}
     ,	getPromise: function() {
     		return this.promise;
	    }
    };

    ReferenceMapPromiseHandler.getInstance = function() {

        if (instance === null)
        {
            instance = new ReferenceMapPromiseHandler();
        }

        return instance;
    };

    return ReferenceMapPromiseHandler.getInstance();

});
