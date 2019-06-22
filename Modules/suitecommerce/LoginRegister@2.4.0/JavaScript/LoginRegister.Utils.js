/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('LoginRegister.Utils'
,	[	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'ErrorManagement'
	,	'SC.Configuration'
	,	'Utils'
	,	'jQuery.serializeObject'
	]
,	function (
		_
	,	jQuery
	,	Backbone
	,	ErrorManagement
	,	Configuration
	)
{
	'use strict';

	return {
		skipLoginCloseModal: function ()
		{
			if (this.$containerModal && Configuration.get('checkoutApp.skipLogin'))
			{
				this.$containerModal.modal('hide');
			}
		}
	};
});