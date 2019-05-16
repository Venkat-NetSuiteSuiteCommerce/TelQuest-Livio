/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.List.All.Store.View', [
        'Backbone.CompositeView'
    ,   'Backbone.CollectionView'
    ,   'store_locator_list_all_store.tpl'
    ,   'SC.Configuration'
    ,   'Backbone'
    ]
,   function (
        BackboneCompositeView
    ,   BackboneCollectionView
    ,   store_locator_list_all_store_tpl
    ,   Configuration
    ,   Backbone
    )
{
    'use strict';

    return Backbone.View.extend({

        template: store_locator_list_all_store_tpl

        //@method initialize
        //@param {Object} options
    ,   initialize: function initialize (options)
        {
            this.index = options.index;
            BackboneCompositeView.add(this);
        }

        //@method getContext
        //@return StoreLocator.ListAll.Store.View.Context
    ,   getContext: function getContext ()
        {
            return {
                //@property {String} name
                name: this.model.get('name')
                //@property {String} storeId
            ,   storeId: this.model.get('internalid')
                //@property {String} touchpoint
            ,   touchpoint: Configuration.get('siteSettings.isHttpsSupported') ? 'home' : 'storelocator'
            };
        }

    });
});