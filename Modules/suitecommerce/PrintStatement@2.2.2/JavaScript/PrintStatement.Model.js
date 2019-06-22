/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PrintStatement.Model
define(
	'PrintStatement.Model'
,	[	'Backbone'

	,	'underscore'

	, 	'Backbone.Sync'
	]
,	function (
		Backbone

	,	_
	)
{
	'use strict';

	function parseDate (value)
	{
		if(value && value.replace)
		{
			return new Date(value.replace(/-/g,'/')).getTime();
		}
		else
		{
			return new Date(value).getTime();
		}
	}

	function validateStatementDate (value)
	{
		if (!value || isNaN(parseDate(value)))
		{
			return _('Invalid Statement date').translate();
		}
	}

	function validateStartDate (value)
	{
		if (value)
		{
			if (isNaN(parseDate(value)))
			{
				return _('Invalid Start date').translate();
			}
		}
	}

	'use strict';
	//@class PrintStatement.Model @extends Backbone.Model
	return Backbone.Model.extend({

		validation:
		{
			statementDate: { fn: validateStatementDate }

		,	startDate: { fn: validateStartDate }
		}

		//@property {String} urlRoot
	,	urlRoot: 'services/PrintStatement.Service.ss'

		//@method parse
	,	parse: function (result)
		{
			return result;
		}
	});
});