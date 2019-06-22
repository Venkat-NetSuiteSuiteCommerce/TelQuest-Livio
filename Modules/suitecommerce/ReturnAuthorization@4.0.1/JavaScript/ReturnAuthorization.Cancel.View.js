/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReturnAuthorization
define(
	'ReturnAuthorization.Cancel.View'
,	[	'return_authorization_cancel.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		return_authorization_cancel_tpl
	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class ReturnAuthorization.Cancel.View @extend Backbone.Vie
	return Backbone.View.extend({

		template: return_authorization_cancel_tpl

	,	title: _('Cancel Return Request').translate()

	,	page_header: _('Cancel Return Request').translate()

	,	events: {
			'click [data-action="delete"]': 'confirm'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
		}

	,	confirm: function ()
		{
			this.model.save({
				status: 'cancelled'
			}).then(jQuery.proxy(this, 'dismiss'));
		}

	,	dismiss: function ()
		{
			this.$containerModal.modal('hide');
		}
	});
});