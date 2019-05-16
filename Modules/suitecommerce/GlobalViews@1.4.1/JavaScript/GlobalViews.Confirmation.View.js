/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.Confirmation.View'
,	[	'global_views_confirmation.tpl'

	,	'Backbone.CompositeView'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function(
		global_views_confirmation_tpl

	,	BackboneCompositeView

	,	Backbone
	,	_
	,	Utils
	)
{
	'use strict';

	// @class GlobalViews.Confirmation.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_confirmation_tpl

	,	title: _('Confirm').translate()

	,	page_header: _('Confirm').translate()

	,	events: {
			'click [data-action="confirm"]' : 'confirm'
		,	'click [data-action="cancel"]' : 'cancel'
		}

		//@method initialize
		//@param {GlobalViews.Confirmation.Initialize.Options} options
		//@return {Void}
	,	initialize: function (options)
		{
			this.callBack = options.callBack;
			this.callBackParameters = options.callBackParameters;

			this.cancelCallBack = options.cancelCallBack;
			this.cancelCallBackParameters = options.cancelCallBackParameters;

			this.title = options.title || this.title;
			this.page_header = options.title || this.page_header;
			this.className = options.className || '';
			this.body = options.body;
			this.showBodyMessage = !options.view;
			this.childViewMessage = options.view;
			this.childViewMessageParameters = options.viewParameters;

			this.autohide = !!options.autohide;

			this.confirmLabel = options.confirmLabel;
			this.cancelLabel = options.cancelLabel;

			BackboneCompositeView.add(this);

			this.once('afterViewRender', function ()
			{
				var self = this;
				self.$containerModal.on('shown.bs.modal', function ()
				{
					self.$containerModal.off('shown.bs.modal');
					self.$('[data-action="confirm"]').focus();
				});

			}, this);
		}

		//@property {Object} childViews
	,	childViews: {
			'ChildViewMessage': function ()
			{
				return new this.childViewMessage(this.childViewMessageParameters || {});
			}
		}

		// @method confirm Invokes callBack function
		// @return {Void}
	,	confirm: function confirm ()
		{
			_.isFunction(this.callBack) && this.callBack.call(this, this.callBackParameters);

			if (this.autohide)
			{
				this.$containerModal.modal('hide');
			}
		}

		// @method cancel Invokes cancelCallBack function
		// @return {Void}
	,	cancel: function cancel ()
		{
			_.isFunction(this.cancelCallBack) && this.cancelCallBack.call(this, this.cancelCallBackParameters);

			if (this.autohide)
			{
				this.$containerModal.modal('hide');
			}
		}

		// @method getTitle This method returns the name the current browser window will have.
		// This is called by Content.EnhancedViews
		// @return {String}
	,	getTitle: function getTitle ()
		{
			return Utils.translate('Confirmation');
		}

		// @method getContext
		// @return {GlobalViews.Confirmation.View.Context}
	,	getContext: function getContext ()
		{
			// @class GlobalViews.Confirmation.View.Context
			return {
				// @property {String} body
				body: this.body
				// @property {Boolean} hasConfirmLabel
			,	hasConfirmLabel: !!this.confirmLabel
				// @property {String} confirmLabel
			,	confirmLabel: this.confirmLabel
				// @property {Boolean} hasCancelLabel
			,	hasCancelLabel: !!this.cancelLabel
				// @property {String} cancelLabel
			,	cancelLabel: this.cancelLabel
				// @property {Boolean} showBodyMessage
			,	showBodyMessage: this.showBodyMessage
				// @property {String} class
			,	className: this.className
			};
			// @class GlobalViews.Confirmation.View
		}
	});
});

//@class GlobalViews.Confirmation.Initialize.Options
//@property {Function?} callBack Optional function called in case the user confirm the current prompt
//@property {Any?} callBackParameters Any optional object used as parameter of the callBack parameters function
//@property {String?} title Optional modal title
//@property {String?} body String message to display. This value is optional as you can specify a child view as
//the body of the modal
//@property {Backbone.View?} view Optional view used to specify a body when you need a rich body that a simple body property
//is not enough
//@property {String?} confirmLabel Label used in the confirmation button. 'Yes' is used when no data is provided
//@property {Boolean} autohide Indicate if after confirming the windows should auto-close
//@property {String?} cancelLabel Optional label used for the cancel button. If no value is provided Cancel will be used.
//@property {Any?} viewParameters Optional Object with the parameters used to instantiate the passed in View
