/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.Message.View'
,	[
		'global_views_message.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(

		global_views_message_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class GlobalViews.Message.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_message_tpl

		// @method initialize
		// @param {GlobalViews.Message.View.InitializeOptions} options
		// @return {Void}

	,	event: {
			'click [data-action="close-message"]': 'closeMessage'
		}

	,	show: function show ($placeholder, time)
		{
			$placeholder.empty();

			this.render();
			$placeholder.html(this.$el).show();

			if (time && time > 0)
			{
				setTimeout(function ()
				{
					$placeholder.fadeOut(function ()
					{
						$placeholder.empty();
					});
				}, time);
			}
		}

	,	closeMessage: function closeMessage (e)
		{
			return _.isFunction(this.options.closeMessageHandler) && this.options.closeMessageHandler(e);
		}

	,	childViews:  {
			'global-views-message-childview-message': function ()
			{
				return this.options.childView;
			}
		}

		// @method getContext
		// @return {GlobalViews.Message.View.Context}
	,	getContext: function getContext ()
		{
			var has_error_code = !!this.options.message.errorCode
			,	message = has_error_code ? this.options.message.message : this.options.message
			,	errorCode = this.options.message.errorCode;

			return {
					// @property {String} message
					message: message
					// @property {Boolean} hasErrorCode
				,	hasErrorCode: has_error_code
					// @property {String} errorCode
				,	errorCode: errorCode
					// @property {Boolean} closable
				,	closable: !!this.options.closable
					// @property {String} type
				,	type: this.options.type ? 'global-views-message-' + this.options.type : ''
					// @property {Boolean} showMultipleMessage
				,	showMultipleMessage: !!_.isObject(this.options.message) && !has_error_code
					// @property {Array} messages
				,	messages: _.isArray(this.options.message) ? this.options.message : [this.options.message]
					// @property {Boolean} showStringMessage
				,	showStringMessage: !this.options.childView
			};
			// @class GlobalViewss.Message.View
		}
	});
});

//@class GlobalViews.Message.View.InitializeOptions
//@property {String|Array<String>?} message Message or list of message to show
//@property {Boolean} closable Indicate if the message can be closed or not
//@property {String} type Optional class name of be added into the resulting HTML message
//@property {Function} closeMessageHandler Optional handler for the close action
//@property {SC.View} childView Optional view used to show the message. When a view is specified the message property will be ignored
