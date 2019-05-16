/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PrintStatement
define('PrintStatement.Router'
	,	[	'PrintStatement.View'
		,	'PrintStatement.Model'
		,	'ErrorManagement.ForbiddenError.View'
		,	'Backbone'
		]
	,	function (
			PrintStatementView
		,	PrintStatementModel
		,	ErrorManagementForbiddenErrorView
		,	Backbone
		)
{
	'use strict';
	//@class PrintStatement.Router @extends Backbone.Router
	return Backbone.Router.extend({
		//@property {Object} routes
		routes: {
			'printstatement': 'printstatement'
		}
		//@method initialize
	,	initialize: function (application)
		{
			this.application = application;
		}
		//@method printstatement
	,	printstatement: function ()
		{
			var	view;
			if (SC.ENVIRONMENT.permissions.transactions.tranStatement === 2)
			{
				view = new PrintStatementView({
						application: this.application
					,	model: new PrintStatementModel()
					});
			}
			else
			{
				view = new ErrorManagementForbiddenErrorView({
					application: this.application
				});
			}

			view.showContent();
			return view;
		}
	});
});