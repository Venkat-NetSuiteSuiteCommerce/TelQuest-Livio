/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('OrderHistory.List.Tracking.Number.View'
,	[	'TrackingServices'
	,	'order_history_list_tracking_number.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		TrackingServices
	,	order_history_list_tracking_number_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class OrderHistory.List.Tracking.Number.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: order_history_list_tracking_number_tpl

		//@property {Object} events
	,	events: {
			'click [data-action="tracking-number"]': 'trackingNumber'
		}
		//@method trackingNumber
	,	trackingNumber: function (e)
		{
			e.stopPropagation();
		}
		//@method getTrackingServiceUrl
	,	getTrackingServiceUrl: function (number)
		{
			return TrackingServices.getServiceUrl(number);
		}
		//@method getTrackingServiceName
	,	getTrackingServiceName: function (number)
		{
			return TrackingServices.getServiceName(number);
		}

		//@method getContext @return OrderHistory.List.Tracking.Number.View.Context
	,	getContext: function ()
		{
			var self = this
			,	tracking_numbers = _.map(this.model.get('trackingNumbers'), function(tracking_number)
				{
					return {
							serviceName: self.getTrackingServiceName(tracking_number)
						,	serviceURL: self.getTrackingServiceUrl(tracking_number) || '#'
						,	trackingNumber: tracking_number
					};
				});

			//@class OrderHistory.List.Tracking.Number.View.Context
			return {
				//@property {Boolean} isTrackingNumberCollectionEmpty
				isTrackingNumberCollectionEmpty: !tracking_numbers.length
				//@property {Boolean} isTrackingNumberCollectionLengthEqual1
			,	isTrackingNumberCollectionLengthEqual1: tracking_numbers.length === 1
				//@property {Boolean} showContentOnEmpty
			,	showContentOnEmpty: !!this.options.showContentOnEmpty
				//@property {String} contentClass
			,	contentClass: this.options.contentClass || ''
				//@property {String} firstTrackingNumberName
			,	firstTrackingNumberName: tracking_numbers[0] && tracking_numbers[0].serviceName
				//@property {String} firstTrackingNumberURL
			,	firstTrackingNumberURL: tracking_numbers[0] && tracking_numbers[0].serviceURL
				//@property {String} firstTrackingNumberText
			,	firstTrackingNumberText: tracking_numbers[0] && tracking_numbers[0].trackingNumber
				//@property {Number} trackingNumbersLength
			,	trackingNumbersLength: tracking_numbers.length
				//@property {Boolean} collapseElements
			,	collapseElements: !!this.options.collapseElements
				//@property {Collection<Backboone.Model>} trackingNumbers
			,	trackingNumbers: tracking_numbers
				//@property {Boolean} showTrackPackagesLabel
			,	showTrackPackagesLabel: !_.isUndefined(this.options.showTrackPackagesLabel)? this.options.showTrackPackagesLabel : false
			};
		}
	});

});