/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PrintStatement
define('PrintStatement.View'
	,	[	'SC.Configuration'

		,	'print_statement.tpl'

		,	'Backbone.FormView'

		,	'Backbone'
		,	'jQuery'
		,	'underscore'
		,	'Utils'
		,	'jQuery.serializeObject'
		]
	,	function (
			Configuration
		,	print_statement_tpl

		,	BackboneFormView

		,	Backbone
		,	jQuery
		,	_
		)
{

	'use strict';

	//@class PrintStatement.View @extends Backbone.View
	return Backbone.View.extend({
		//@property {Function} template
		template: print_statement_tpl
		//@property {String} title
	,	title: _('Print a Statement').translate()
		//@property {String} page_header
	,	page_header: _('Print a Statement').translate()
		//@property {Object} attributes
	,	attributes: {
			'class': 'PrintStatement'
		}
		//@property {Object} events
	,	events: {
			'submit form':'printAction'
		,	'click [data-action="email"]':'emailAction'
		,	'click i.print-statement-form-input-icon': 'imgPickerAction'
		}
		//@method initialize
	,   initialize: function(options)
		{
			this.application = options.application;
			this.model = options.model;

			Backbone.Validation.bind(this);
		}
		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'printstatement';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
				text: _('Print Statement').translate()
			,	href: '/printstatement'
			};
		}
		//@method printAction
	,	printAction: function(e)
		{
			this.printStatement(e, false);
		}
		//@method emailAction
	,	emailAction: function(e)
		{
			var self = this;

			this.printStatement(e, true, function (response)
			{
				jQuery.ajax(response.url).done(function ()
				{
					self.showError(_('Email sent successfully').translate(), 'success');
				});
			});
		}
		//@method imgPickerAction
	,	imgPickerAction: function(e)
		{	
			jQuery( e.target ).parent().find('input').datepicker('show');
		}
		//@method printStatement
	,	printStatement: function(e, email, callback)
		{
			e.preventDefault();
			this.hideError();

			this.model.set('statementDate', this.$('[name="statementDate"]').val());
			this.model.set('startDate', this.$('[name="startDate"]').val());

			if (this.model.isValid(true))
			{
				var data = jQuery(e.target).closest('form').serializeObject()
				,	statementDate = new Date(data.statementDate.replace(/-/g,'/')).getTime()
				,	startDate = new Date(data.startDate.replace(/-/g,'/')).getTime();

				data.email = email ? true : null;

				if (!(data.startDate && isNaN(startDate) || isNaN(statementDate)))
				{
					data.statementDate = statementDate;

					if (data.startDate)
					{
						data.startDate = startDate;
					}

					if (email)
					{
						var	save_promise = this.saveForm(e, this.model, data);
						save_promise && save_promise.done(callback);
					}
					else
					{
						data.asset = 'print-statement';
						window.open(_.getDownloadPdfUrl(data));
					}
				}
			}
		}
		//@method getContext @returns PrintStatement.View.Context
	,	getContext: function()
		{
			//@class PrintStatement.View.Context
			return {
					//@property {String} pageHeader
					pageHeader: this.page_header
					//@property {Boolean} showBackToAccount
				,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
			};
		}
	});
});
