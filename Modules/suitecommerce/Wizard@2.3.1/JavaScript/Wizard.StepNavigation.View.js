/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Wizard
define(
	'Wizard.StepNavigation.View'
,	[
		'wizard_step_navigation.tpl'
	,	'Backbone'
	,	'underscore'
	]
,	function (
		wizard_step_navigation_tpl
	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Wizard.StepNavigation.View @extends Backbone.View
	return Backbone.View.extend({

		template: wizard_step_navigation_tpl

		//@method getContext @return {Wizard.StepNavigation.View.Context}
	,	getContext: function()
		{
			var step_groups = []
			,	errors_to_display = []
			,	counter = 0;

			_(this.options.wizard.stepGroups).each(function (step_group)
			{
				if (step_group.showStepGroup())
				{
					//@class Wizard.StepNavigation.View.StepGroupData
					var step_group_data = {
							//@property {String} name
							name: '. ' +step_group.name
							//@property {String} listItemClass
						,	listItemClass: ''
							//@property {String} linkUrl
						,	linkUrl: ''
							//@property {Number} counter
						,	counter: 0
						}
					,	listItemClass = ''
					,	step_group_errors = step_group.getErrors();

					if (step_group.state === 'present')
					{
						listItemClass += ' wizard-step-navigation-active';
					}
					else if (step_group.state === 'future')
					{
						listItemClass += ' wizard-step-navigation-disabled';
					}

					if (step_group_errors && step_group_errors.length)
					{
						listItemClass += ' wizard-step-navigation-error';
					}
					step_group_data.listItemClass = listItemClass;

					step_group_data.linkUrl = step_group.state === 'future' ? Backbone.history.fragment : step_group.getURL() + '?force=true';

					errors_to_display = _.uniq(_.union(errors_to_display, step_group_errors), function (item)
					{
						return item.errorCode;
					});

					step_group_data.counter = ++counter;

					step_groups.push(step_group_data);
				}
			});

			//@class Wizard.StepNavigation.View.Context
			return {
				//@property {Array<Wizard.StepNavigation.View.StepGroupData>} stepGroups
				stepGroups: step_groups
				//@property {Array<String>} errors
			,	errors: errors_to_display
				//@property {Boolean} showBackButton
			,	showBackButton: !this.options.wizard.isCurrentStepFirst()
			};
			//@class Wizard.StepNavigation.View
		}
	});
});