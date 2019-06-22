/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GoogleAdWords
// Adds GoogleAdWords tracking pixel on the checkout confirmation page.
define('GoogleAdWords'
,	[	'Tracker'
	,	'jQuery'
	]
,	function (
		Tracker
	,	jQuery
	)
{
	'use strict';

	// @lass GoogleAdWords Adds GoogleAdWords tracking pixel on the checkout confirmation page. @extends ApplicationModule
	var GoogleAdWords = {

		// @method setAccount Saves the configuration to be later used on the track transaction. @param {Object} config
		setAccount: function (config)
		{
			this.config = config;

			return this;
		}

		// @method trackTransaction Appends the tracking pixel to the dom, so the request is done.
	,	trackTransaction: function (order)
		{
			var config = GoogleAdWords.config
			,	value = order.get('total');

			jQuery('<img/>', {
				src: '//www.googleadservices.com/pagead/conversion/' + config.id + '/?value=' + value + '&label=' + config.label + '&guid=ON&script=0'
			}).appendTo(GoogleAdWords.application.getLayout().currentView.$el);

			return this;
		}

	,	mountToApp: function (application)
		{
			GoogleAdWords.application = application;
			var tracking = application.getConfig('tracking.googleAdWordsConversion');
			// Required tracking attributes to generate the pixel url
			if (tracking && tracking.id && tracking.label)
			{
				GoogleAdWords.setAccount(tracking);

				Tracker.getInstance().trackers.push(GoogleAdWords);
			}
		}
	};

	return GoogleAdWords;
});
