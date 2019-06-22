/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'OrderWizard.Router'
	,	'LiveOrder.Model'
	,	'UnitTestHelper'
	,	'Profile.Model'
	,	'UnitTestHelper.Preconditions'
	,	'underscore'
	,	'Backbone'

	]
, 	function (
		OrderWizardRouter
	,	LiveOrderModel
	,	UnitTestHelper
	,	ProfileModel
	,	Preconditions
	,	_
	,	Backbone
	)
{
	'use strict';

	function setPreconditions()
	{
		window.SC = Preconditions.deepExtend(window.SC || {}, {
			ENVIRONMENT: {
				PROFILE : {
					isGuest : 'F'
				}
			,	siteSettings : {
					registration : {
						companyfieldmandatory : 'F'
					}
				}
			}
		}); 
	}

	return xdescribe('Module: OrderWizard (Basic Usage)', function () {

		var helper = new UnitTestHelper({
				applicationName: 'OrderWizardRouter'
			})
		,	orderWizardRouter
		,	steps = [
			{
				name: 'Step 1'
			,	steps: [
					{
						name: 'Step1'
					,	url: 'step/1'
					,	modules: [
						]
					,	showStep: function () {return true;}
					}
				,	{
						name: 'Step 1.1'
					,	url: 'step/1/1'
					,	showStep: function () {return true;}
					,	modules: [
						]
					}
				]
			}
		,	{
				name: 'Step 2'
			,	steps: [
					{
						name: 'Step 2'
					,	url: 'step/2'
					,	modules: [
						]
					,	showStep: function () {return true;}
					}
				]
			}
		];

		helper.application.getLayout().template = function() { return '';};

		beforeEach(function ()
		{
			setPreconditions();
			var live_order_model = LiveOrderModel.getInstance()
			,	profile_model = ProfileModel.getInstance();

			live_order_model.getTotalItemCount = function () { return 1 };

			profile_model.set('isLoggedIn', 'T');

			var options = {
					steps: steps
				,	model: live_order_model
				,	profile: profile_model
			};

			orderWizardRouter = new OrderWizardRouter(helper.application, options);
			
			try {Backbone.history.start();}catch(ex){}
		});

		afterEach(function(){
			Backbone.history.navigate('', {trigger: false});
			try
			{
				Backbone.history.stop();
			}
			catch(e)
			{
				console.log(e);
			}
		});

		it('spec initialization', function ()
		{
			expect(OrderWizardRouter).toBeDefined();
			expect(_(OrderWizardRouter).isFunction()).toBe(true);
		});

		it('basic wizard properties setup', function ()
		{
			expect(_(orderWizardRouter.steps).size()).toBe(3);
			expect(orderWizardRouter.steps['step/1'] && orderWizardRouter.steps['step/1/1'] && orderWizardRouter.steps['step/2']).toBeTruthy();
			expect(orderWizardRouter.steps['step/1'].modules.length===0 &&
				orderWizardRouter.steps['step/1/1'].modules.length===0 &&
				orderWizardRouter.steps['step/2'].modules.length===0).toBe(true);
			expect(_(orderWizardRouter.stepGroups).size()).toBe(2);
		});

		it('methods: goToNextStep, getCurrentStep, step.state, getNextStepUrl, goToPreviousStep and getPreviousStepUrl', function ()
		{
			var wizard = orderWizardRouter;

			wizard.getFirstStepUrl = function ()
			{
				return wizard.stepsOrder[0];
			};

			wizard.startWizard();

			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[0]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1/1'].state).toBe('future');
			expect(wizard.steps['step/2'].state).toBe('future');
			expect(wizard.getNextStepUrl()).toBe('step/1/1');

			wizard.goToNextStep();
			expect(window.location.hash).toBe('#' + wizard.stepsOrder[1]);
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[1]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1'].state).toBe('past');
			expect(wizard.steps['step/1/1'].state).toBe('present');
			expect(wizard.steps['step/2'].state).toBe('future');
			expect(wizard.getNextStepUrl()).toBe('step/2');
			expect(wizard.getPreviousStepUrl()).toBe('step/1');

			wizard.goToNextStep();
			expect(window.location.hash).toBe('#'+wizard.stepsOrder[2]);
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[2]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1'].state).toBe('past');
			expect(wizard.steps['step/1/1'].state).toBe('past');
			expect(wizard.steps['step/2'].state).toBe('present');
			expect(wizard.getPreviousStepUrl()).toBe('step/1/1');

			wizard.goToPreviousStep();
			expect(window.location.hash).toBe('#'+wizard.stepsOrder[1]+'?force=true');
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[1]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1'].state).toBe('past');
			expect(wizard.steps['step/1/1'].state).toBe('present');
			expect(wizard.steps['step/2'].state).toBe('future');
			expect(wizard.getNextStepUrl()).toBe('step/2');
			expect(wizard.getPreviousStepUrl()).toBe('step/1');
		});
	});
});