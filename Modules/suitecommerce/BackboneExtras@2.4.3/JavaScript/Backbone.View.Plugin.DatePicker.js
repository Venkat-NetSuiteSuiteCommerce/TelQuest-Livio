/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module BackboneExtras
#Backbone.View.Plugins
Define the default plugins to execute by Backbone.View.render method. These plugins hook into the Backobne.view
render() life cycle and modify the view's output somehow, for example removing marked nodes that current user
has not permission to see, installing bootstrap widgets after a view is rendered, etc.
*/
define('Backbone.View.Plugin.DatePicker'
,	[
		'Backbone.View.render'

	,	'underscore'
	,	'jQuery'
	,	'bootstrap-datepicker'
	]
,	function (
		BackboneView

	,	_
	,	jQuery
	)
{
	'use strict';

	return  {
		mountToApp: function ()
		{
			if (!_.result(SC, 'isPageGenerator'))
			{
				BackboneView.postRender.install({
					name: 'datePicker'
				,	priority: 10
				,	execute: function ($el, view)
					{
						if (_.isNativeDatePickerSupported() === false || _.isDesktopDevice())
						{
							view.$('input[type="date"]').each(function()
							{
								var $date_picker = jQuery(this);
								try
								{
									$date_picker.attr('type', 'text');
								}
								catch(ex)
								{
									//Attempting to change the type attribute (or property) of an input element created via HTML or already in an HTML document will
									//result in an error being thrown by Internet Explorer 6, 7, or 8. That's OK since IE wont understand type="date", but chrome and others should change it.
								}
								$date_picker.datepicker({
										format: $date_picker.data('format')
									,	startDate: $date_picker.data('start-date')
									,	endDate: $date_picker.data('end-date')
									,	autoclose: true
									,	todayHighlight: $date_picker.data('todayhighlight')
								});
							});
						}
					}
				});
			}
		}
	};
});
