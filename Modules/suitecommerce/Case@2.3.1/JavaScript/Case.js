/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Case.js
// -----------------
// Defines the Case module. (Model, Views, Router)
// @module Case
define(
	'Case'
,	[
		'SC.Configuration'
	,	'Case.Router'

	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration
	,	Router

	,	_
	)
{
	'use strict';

	var case_menu_items = function (application)
	{
		if (!application.CaseModule.isEnabled())
		{
			return undefined;
		}

		return {
			id:  'cases'
		,	name: _('Cases').translate()
		,	index: 5
		,	children:  [
				{
					parent: 'cases'
				,	id: 'cases_all'
				,	name: _('Support Cases').translate()
				,	url: 'cases'
				,	index: 1
				}
			,	{
					parent: 'cases'
				,	id: 'newcase'
				,	name: _('Submit New Case').translate()
				,	url: 'newcase'
				,	index: 2
				}
			]
		,	permission: 'lists.listCase.2'
		};
	};

	// Encapsulate all Case elements into a single module to be mounted to the application
	// Update: Keep the application reference within the function once its mounted into the application
	var CaseModule = function() 
	{
		// Is Case functionality available for this application?
		var isCaseManagementEnabled = function ()
		{
			return SC && SC.ENVIRONMENT && SC.ENVIRONMENT.casesManagementEnabled;
		};

		var mountToApp = function (application)
		{
			application.CaseModule = CaseModule;

			// always start our router.
			return new Router(application);
		};

		return {
			Router: Router
		,	isEnabled: isCaseManagementEnabled
		,	mountToApp: mountToApp
		,	MenuItems: case_menu_items
		};
	}();

	return CaseModule;
});