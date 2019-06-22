/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Sensors
define('Sensors'
,	[
		'Sensors.DataExtractor'
	,	'SC.Configuration'

	,	'jQuery'
	,	'underscore'
	,	'Backbone'
	]
,	function (
		SensorsDataExtractor
	,	Configuration

	,	jQuery
	,	_
	,	Backbone
	)
{
	'use strict';

	//@class Sensors @extend ApplicationModule
	var sensors_module = {

		// @property {Object} nlrum
		nlrum: null

		// @property {Sensors.DataExtractor}
	,	dataExtractor: SensorsDataExtractor

		// @method loadScript it will nlrum.js and then call sendData(true) @return {Void}
	,	loadScript: function ()
		{
			var self = this;

			window.NLRUM = window.NLRUM || {};
			window.NLRUM.bSendBeacon = 0;
			window.NLRUM.bResourceTimingDataCollection = 1;

			jQuery.getScript('/nlrum/nlRUM.js')
				.done(function ()
				{
					if(!window.NLRUM.addSCData)
					{
						console.log('NLRUM has not defined addSCData');
						return;
					}

					self.nlrum = window.NLRUM;
					self.sendData(true);
				})
				.fail(function ()
				{
					console.log('nlRUM.js failed to load');
				});
		}

		// @method getMetadata @param firstLoad is true for the first application view (direct navigation type)
		// @return {jQuery.Deferred} resolved with the data to be send.
	,	getMetadata: function (isFirstLoad)
		{
			var data = {}
			,	data_promises = []
			,	metadata_promise = jQuery.Deferred()
			,	self = this;

			_.each(this.dataExtractor, function (extractor)
			{
				// include on first load or if it needs to be sent everytime (not once)
				if (extractor.extract && (isFirstLoad || !extractor.once))
				{
					data_promises.push(extractor.extract(self.application));
				}
			});

			jQuery.when.apply(jQuery, data_promises).done(function ()
			{
				_.each(arguments, function (argument)
				{
					if (argument)
					{
						_.extend(data, argument);
					}
				});

				metadata_promise.resolve(data);
			});

			return metadata_promise;
		}

		// @method sendData @public @param isFirstLoad is true for the first application view (direct navigation type)
		// @return {jQuery.Deferred} resolved with the data to be send.
	,	sendData: function (isFirstLoad)
		{
			var promise = jQuery.Deferred();
			if (this.nlrum && this.nlrum.addSCData)
			{
				var self = this;

				this
				.getMetadata(isFirstLoad)
				.done(function (data)
				{
					data.linkType = isFirstLoad ? 'direct' : 'indirect';

					self.nlrum.addSCData(data);

					// @event nlrum:sendData each time data is posted to the nlrum service, listeners will be
					// notified. The data is passed as handler first parameter. @public
					self.trigger('nlrum:sendData', data, self);

					promise.resolve(data);
				});
			}
			return promise;
		}

		// @method mountToApp @param application @return {Void}
	,	mountToApp: function (application)
		{
			// don't execute in Page Generator
			if (!(SC.ENVIRONMENT.jsEnvironment === 'browser' && SC.ENVIRONMENT.SENSORS_ENABLED))
			{
				return;
			}

			this.application = application;
			var self = this;
			application.getLayout().on('afterAppendView', function (view)
			{
				self.handleAfterAppendView(application, view);
				if (!self.nlrum) // first load
				{
					self.loadScript();
				}
				else
				{
					self.sendData(false);
				}
			});

			self.registerNavigationEvents(application);

			if (self.debug)
			{
				self.on('nlrum:sendData', _.bind(self.debugLog, self));
			}
		}



		//NAVIGATION TIMING

		//@methOd registerNavigationEvents will reset @?property userNavigateEventLastTime
	,	registerNavigationEvents: function(application)
		{
			var self = this;

			// Here we are registering to navigation events which we generalize as 'when the url fragment change'.
			// We are register to this change using several approaches to mark the t0 - history change, navigationhelper click, dom click

			//browser history just changed.
			Backbone.history.on('all', _.bind(this.handleNavigationEventStart, this));

			// navigationhelper way: user just clicked a navigation link! pdp matrix options won't work without this
			application.getLayout().mouseDown && application.getLayout().mouseDown.install({
				execute: function()
				{
					self.handleNavigationEventStart();
				}
			});
			application.getLayout().on('afterAppendView', function (view)
			{
				view && view.$el.on('mousedown', function()
				{
					self.handleNavigationEventStart();
				});
				// view.$el.unbind() is called automatically
			});
		}

	,	handleNavigationEventStart: function()
		{
			this.userNavigateEventLastTime = new Date().getTime();
			window.NLRUM && window.NLRUM.markIndirectStart && window.NLRUM.markIndirectStart();
			this.handleAfterAppendViewCounter = 0;
		}

		// @property userNavigateEventLastTime
	,	userNavigateEventLastTime: new Date().getTime()

	,	handleAfterAppendViewCounter: 0

	,	handleAfterAppendView: function()
		{
			var showContentTime = new Date().getTime() - this.userNavigateEventLastTime;
			var extractor = {
				once: false
			,	value: { showContentTime: showContentTime }
			,	extract: function()
				{
					return jQuery.Deferred().resolve(this.value);
				}
			};
			this.dataExtractor.showContentTime = extractor;

			this.handleAfterAppendViewCounter++;
			if (this.handleAfterAppendViewCounter > 1)
			{
				// this means that this afterAppendView was not triggered by a registered mechanism. This is an issue and it happens in PDP - add-to-cart button.
				// What we are doing in this case is not tracking the time because is wrong.
				delete this.dataExtractor.showContentTime;
			}
		}

	// the following is just for debugging purposes when developing, on the browser console
	// IMPORTANT: disable or comment in production
	,	debug: false

	,	debugRows: ['siteFragment', 'sitePage', 'showContentTime', 'errorStatus']

	,	debugLog: function(data)
		{
			data = _.isArray(data) ? data : [data];
			var self = this
			,	filteredData = _.map(data, function(entry)
				{
					return _.pick.apply(_, [entry].concat(self.debugRows));
				});
			console.table(filteredData);
		}

	};

	_.extend(sensors_module, Backbone.Events);
	return sensors_module;
});
