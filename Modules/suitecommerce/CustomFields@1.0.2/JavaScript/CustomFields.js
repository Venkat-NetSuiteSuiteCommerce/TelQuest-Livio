/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('CustomFields'
,	[	'Wizard.Step'
	,	'Backbone'
	,	'underscore'
	,	'jQuery'	
	]
,	function (
		WizardStep
	,	Backbone
	,	_
	,	jQuery	
	)
{
	'use strict';	
	// jshint validthis: true

	
	return {
		mountToApp: function()
		{
			//update in the model the changed custom field
			function updateOption(event) 
			{	
				var options  = _.clone(this.model.get('options'));
				var optionName = event.target.name;
				//support checkbox type of backend
				if(event.target.type === 'checkbox')
				{
					if(this.model.__customFieldsMetadata[optionName].type === 'checkbox')
					{				
						options[optionName] = event.target.checked ? 'T' : '';
					}
					else
					{
						options[optionName] = event.target.checked ? event.target.value : '';
					}
				}
				else
				{
					options[optionName] = jQuery(event.target).val();	
				}
				this.model.set('options', options);
			}

			WizardStep.prototype.afterModuleInstanceCreated.install({
				name: 'custom-fields-wizard-step-module-instance-created'
			,	execute: function(moduleInstance)
				{
					
					//Add the model of the wizard to the context of all the modules to support transaction body fields
					var originalGetContextFunction = moduleInstance.getContext;					
					moduleInstance.getContext = function()
					{	
						var context = originalGetContextFunction.apply(moduleInstance, arguments);
						if(!context.model)
						{
							context.model = moduleInstance.model;
						}
						return context;							
					};					
					moduleInstance.events = moduleInstance.events || {};					
					_.each(moduleInstance.model.get('options'), function(optionValue, optionKey)
					{						
						moduleInstance.events['change [name="' + optionKey + '"]'] = updateOption;
					});
				}
			});
		}
	};
});