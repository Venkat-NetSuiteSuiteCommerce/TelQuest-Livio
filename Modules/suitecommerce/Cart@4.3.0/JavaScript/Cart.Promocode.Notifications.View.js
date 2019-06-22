/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('Cart.Promocode.Notifications.View'
,	[

		'GlobalViews.Message.View'
	,	'cart_promocode_notifications.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	]
,	function (

		GlobalViewsMessageView
	,	cart_promocode_notifications

	,	Backbone
	,	BackboneCompositeView
	,	_
	)
{
	'use strict';

	//@class Cart.Promocode.Notification.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template:cart_promocode_notifications

		//@method initialize
		//@return {Void}
	,	initialize: function initialize ()
		{
			BackboneCompositeView.add(this);
			this.on('afterCompositeViewRender', this.afterViewRender, this);
		}

		// @property {ChildViews} childViews
	,	childViews: {
			'Promocode.Notification': function ()
			{
				var notification = this.getNotification();

				return new GlobalViewsMessageView({
						message: notification.message
					,	type: notification.type
					,	closable: true
				});
			}
		}

		// @method afterViewRender lets parent model know the promotion already shwoed its current notification
		// @return {Void}
	,	afterViewRender: function()
		{
			this.options.parentModel.trigger('promocodeNotificationShown', this.model.get('internalid'));
		}

		// @method getNotification 
		// @return {Notification}
	,	getNotification: function ()
		{
			var notification = {};

			if(this.model.get('applicabilitystatus') === 'APPLIED')
			{
				notification.type = 'success';
				notification.message = _('Promotion <strong>').translate() + this.model.get('code') + _('</strong> is now discounting your order.').translate();
			}
			else if(this.model.get('applicabilityreason') === 'CRITERIA_NOT_MET')
			{
				notification.type = (!this.model.get('isautoapplied')) ? 'warning' : 'info';
				notification.message = _('Promotion <strong>').translate() + this.model.get('code') + _('</strong> is not discounting your order. ').translate() + this.model.get('errormsg');
			}
			else if(this.model.get('applicabilityreason') === 'DISCARDED_BEST_OFFER')
			{
				notification.type = 'info';
				notification.message = _('We have chosen the best possible offer for you. Promotion <strong>').translate() + this.model.get('code') + _('</strong> is not discounting your order.').translate();
			}

			return notification;
		}

		//@method getContext
		//@return {Cart.Promocode.Notifications.View.context}
	,	getContext: function getContext ()
		{
			//@class Cart.Promocode.Notifications.View.context
			return {};
			//@class Cart.Promocode.Notifications.View
		}
	});
});
