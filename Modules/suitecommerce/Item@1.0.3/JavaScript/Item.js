/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Item
define('Item'
,	[
		'SC.Configuration'

	,	'underscore'
	]
,	function (
		Configuration

	,	_
	)
{
	'use strict';

	//@class Item @extends ApplicationModule
	return {
		//@method mountToApp Initialize the item options configuration related with option colors
		//@return {Void}
		mountToApp: function (application)
		{
			//Make of itemOptions color property a object with the color name as
			//the property and the color value as the value of the property.
			var item_options_with_color = _.filter(Configuration.get('ItemOptions.optionsConfiguration', []), function (item_option_config)
				{
					return !!item_option_config.colors;
				})
			,	clean_setting = function (item_option, setting_key)
				{
					if (item_option && item_option[setting_key] === '')
					{
						delete item_option[setting_key];
						return true;
					}
					return false;
				};

			_.each(item_options_with_color || [], function (item_option)
			{
				item_option.colors = application.getLayout().getColorPalette(item_option.colors);
			});

			//Clean empty settings. These values are optional, when you in the NetSuite interface do not specify nothing
			//they come empty, so for those cases we deleted them so when the Item.Model getPossibleOptions method is executed
			//the default values are NOT overwritten with empty.
			_.each(Configuration.get('ItemOptions.optionsConfiguration', []), function (item_option_configuration)
			{
				clean_setting(item_option_configuration, 'colors');
				clean_setting(item_option_configuration, 'label');
				clean_setting(item_option_configuration, 'urlParameterName');
				clean_setting(item_option_configuration, 'index');
			});
		}
	};
});