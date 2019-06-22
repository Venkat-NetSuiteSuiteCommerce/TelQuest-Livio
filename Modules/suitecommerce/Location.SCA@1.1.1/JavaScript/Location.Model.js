/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Locator
define('Location.Model'
,   [
        'Backbone.CachedModel'
    ,   'Utils' 
    ]
,   function
    (
        BackboneCachedModel
    ,   Utils
    )
{
    'use strict';

    return BackboneCachedModel.extend({
        //@property {String} urlRoot
        urlRoot: Utils.getAbsoluteUrl('services/Location.Service.ss')

    ,   toString: function toString ()
        {
            return this.get('internalid') || '';
        }
    });
});
