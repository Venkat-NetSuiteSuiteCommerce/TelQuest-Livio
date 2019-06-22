/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Transaction.Line.Views
define('Transaction.Line.Views'
,	[
		'SC.Configuration'

	,	'transaction_line_views_selected_option.tpl'
	,	'transaction_line_views_selected_option_color.tpl'

	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration

	,	transaction_line_views_selected_option_tpl
	,	transaction_line_views_selected_option_color_tpl

	,	_
	,	Utils
	)
{
	'use strict';

	//@class Transaction.Line.Views @extends ApplicationModule
	return {
		//@method mountToApp Initialize the item options configuration related with transaction lines
		//@return {Void}
		mountToApp: function ()
		{
			var transaction_line_view_options_selected = {
					'transaction_line_views_selected_option.tpl': transaction_line_views_selected_option_tpl,
					'transaction_line_views_selected_option_color.tpl': transaction_line_views_selected_option_color_tpl
				}
			,	item_options = Configuration.get('ItemOptions.optionsConfiguration', [])

			,	configuration_default_selected_templates = Configuration.get('ItemOptions.defaultTemplates.selectedByType', [])
			,	default_selected_templates = {}
			,	default_template_selected = false;

			_.each(item_options, function (item_option)
			{
				if (item_option.templateSelected && transaction_line_view_options_selected[item_option.templateSelected])
				{
					item_option.templates = item_option.templates || {};
					item_option.templates.selected = transaction_line_view_options_selected[item_option.templateSelected];
				}
			});


			_.each(configuration_default_selected_templates, function (default_selected_template)
			{
				if (transaction_line_view_options_selected[default_selected_template.template])
				{
					default_selected_templates[default_selected_template.type] = transaction_line_view_options_selected[default_selected_template.template];
					default_template_selected = true;
				}
			});

			if (default_template_selected)
			{
				Utils.setPathFromObject(Configuration, 'ItemOptions.defaultTemplates.selectedByType', default_selected_templates);
			}
		}
	};
});