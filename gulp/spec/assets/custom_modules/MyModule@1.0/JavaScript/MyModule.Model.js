//@module MyModule
define('MyModule.Model'
,	[	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		_
	,	Backbone
	)
{
	'use strict';

	return Backbone.Model.extend(
	{
		urlRoot: 'services/MyModule.Service.ss'

	,	validation: {
			fullname: { required: true, msg: _('Full Name is required').translate() }
		,	addr1: { required: true, msg: _('MyModule is required').translate() }
		,	company: { required: isCompanyRequired(), msg: _('Company is required').translate() }
		,	country: { required: true, msg: _('Country is required').translate() }
		,	state: { fn: _.validateState }
		,	city: { required: true, msg: _('City is required').translate() }
		,	zip: { fn: _.validateZipCode }
		,	phone: { fn: _.validatePhone }
		}

	});
});
