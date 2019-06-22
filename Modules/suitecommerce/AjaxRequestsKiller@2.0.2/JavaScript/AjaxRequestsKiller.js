/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module AjaxRequestsKiller
// Keeps trak of ongoing ajax requests and of url (or hash) changes,
// so when the url changes it kills all pending ajax requests that other routers may have initiated.
// It's important to note that not all ajax request are opened by the change of the url,
// for that reason it's important that you tag those who do by adding a killerId: AjaxRequestsKiller.getKillerId() to the request (collection.fetch and model.fetch may trigger a request)
define('AjaxRequestsKiller'
,	[	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'jQuery.ajaxSetup'
	]
,	function (
		_
	,	jQuery
	,	Backbone
	)
{
	'use strict';

	var killerId
	,	lambsToBeKilled;

	// @class AjaxRequestsKiller @extends ApplicationModule
	return {
		//@method getKillerId
		getKillerId: function ()
		{
			return killerId;
		}
		//@method getLambsToBeKilled
	,	getLambsToBeKilled: function ()
		{
			return lambsToBeKilled;
		}
		//@method mountToApp
	,	mountToApp: function (application)
		{
			// Sets the first Killer ID
			// Every time the url changes this will be reseted,
			// but as we are the last listening to the url change event
			// this only happens after all request are made
			killerId = _.uniqueId('ajax_killer_');
			
			// Every time a request is made, a ref to it will be store in this collection.
			lambsToBeKilled = [];

			// Wraps the beforeSend function of the jQuery.ajaxSettings
			jQuery.ajaxSettings.beforeSend = _.wrap(jQuery.ajaxSettings.beforeSend, function (fn, jqXhr, options)
			{
				// If the killerId is set we add it to the collection
				if (options.killerId)
				{
					jqXhr.killerId = options.killerId;
					lambsToBeKilled.push(jqXhr);
				}

				// Finally we call the original jQuery.ajaxSettings.beforeSend
				fn.apply(this, _.toArray(arguments).slice(1));
			});

			// We listen to the afterStart because Backbone.history is *potentialy* not ready until after that
			application.on('afterStart', function ()
			{
				// There is a timing issue involved,
				// the on all event happens after the 2nd requests is done
				Backbone.history.on('all', function ()
				{
					// Check previous ongoing requests
					_.each(lambsToBeKilled, function (prev_jqXhr)
					{
						// if the new id is different than the old one, it means that there is a new killer id,
						// so we kill the old one if its still ongoing
						if (killerId && killerId !== prev_jqXhr.killerId)
						{
							if (prev_jqXhr.readyState !== 4)
							{

								// If we are killing this request we don't want the ErrorHandling.js to handle it
								prev_jqXhr.preventDefault = true;
								prev_jqXhr.abort();
							}

							// we take it off the lambsToBeKilled collection to free some space and processing.
							lambsToBeKilled = _.without(lambsToBeKilled, prev_jqXhr);
						}
					});

					// Generates a new id for the **next** request
					killerId = _.uniqueId('ajax_killer_');
				});
			});
		}
	};
});
