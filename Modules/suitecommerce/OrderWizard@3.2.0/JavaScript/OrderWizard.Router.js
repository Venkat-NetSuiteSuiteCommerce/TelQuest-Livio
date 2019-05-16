/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard
define('OrderWizard.Router'
,	[
		'Wizard.Router'
	,	'Session'
	,	'OrderWizard.Step'
	,	'LiveOrder.Model'
	,	'Profile.Model'
	,	'OrderWizard.Module.PaymentMethod.ThreeDSecure'

	,	'underscore'
	,	'Backbone'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		WizardRouter
	,	Session
	,	OrderWizardStep
	,	LiveOrderModel
	,	ProfileModel
	,	OrderWizardThreeDSecure

	,	_
	,	Backbone
	,	jQuery
	)
{
	'use strict';
	//@class OrderWizard.Router @extends Wizard.Router
	return WizardRouter.extend({
		//@property {OrderWizard.Step} step
		step: OrderWizardStep
		//@method initialize
	,	initialize: function ()
		{
			WizardRouter.prototype.initialize.apply(this, arguments);

			this.profileModel = ProfileModel.getInstance();

			var payment_methods = this.model.get('paymentmethods')
			,	payment_method_credit_card = payment_methods.findWhere({type: 'creditcard'})
			,	credit_card = payment_method_credit_card && payment_method_credit_card.get('creditcard');

			// remove temporal credit card.
			if (credit_card && credit_card.internalid === '-temporal-')
			{
				payment_methods.remove(payment_method_credit_card);
			}

			if (this.application.getConfig('startCheckoutWizard') && !~_.indexOf(this.stepsOrder, ''))
			{
				this.route('', 'startWizard');
				this.route('?:options', 'startWizard');
			}
		}
		//@method startWizard
	,	startWizard: function ()
		{
			Backbone.history.navigate(this.getFirstStepUrl(), {trigger: false, replace:true});
			this.runStep();
		}
		//@method hidePayment
	,	hidePayment: function ()
		{
			return this.application.getConfig('siteSettings.checkout.hidepaymentpagewhennobalance') === 'T' && this.model.get('summary').total === 0;
		}
		//@method isPaypal
	,	isPaypal: function ()
		{
			var selected_paymentmethod = this.model.get('paymentmethods').findWhere({primary: true});
			return selected_paymentmethod && selected_paymentmethod.get('type') === 'paypal';
		}
		//@method isPaypalComplete
	,	isPaypalComplete: function ()
		{
			var selected_paymentmethod = this.model.get('paymentmethods').findWhere({primary: true});
			return selected_paymentmethod && selected_paymentmethod.get('type') === 'paypal' && selected_paymentmethod.get('complete');
		}
		//@method isExternalCheckout
	,	isExternalCheckout: function ()
		{
			var selected_paymentmethod = this.model.get('paymentmethods').findWhere({primary: true});
			return selected_paymentmethod && !!~selected_paymentmethod.get('type').indexOf('external_checkout');
		}

	,	isMultiShipTo: function ()
		{
			return this.model.get('ismultishipto');
		}

	,	isAutoPopulateEnabled: function ()
		{
			var is_guest = this.profileModel.get('isGuest') === 'T';

			return this.application.getConfig('autoPopulateNameAndEmail') && (is_guest && this.application.getConfig('forms.loginAsGuest.showName') || !is_guest);
		}

		//@method runStep
	,	runStep: function (options)
		{
			// Computes the position of the user in the flow
			var url = (options) ? Backbone.history.fragment.replace('?' + options, '') : Backbone.history.fragment
			,	position = this.getStepPosition(url)
			,	content = ''
			,	page_header = ''
			,	last_order_id = _.parseUrlOptions(options).last_order_id;

			if (last_order_id && !this.model.get('confirmation').get('internalid'))
			{
				if (this.profileModel.get('isGuest') !== 'T')
				{
					//checkout just finnished and user refreshed the doc.
					page_header = _('Your Order has been placed').translate();
					content = _('If you want to review your last order you can go to <a href="#" data-touchpoint="$(0)" data-hashtag="#/ordershistory/view/salesorder/$(1)">Your Account</a>. ')
						.translate('customercenter', last_order_id) +
						_('Or you can continue Shopping on our <a href="/" data-touchpoint="home">Home Page</a>. ').translate();
				}
				else
				{
					page_header = _('Your Shopping Cart is empty').translate();
					content = _('Continue Shopping on our <a href="/" data-touchpoint="home">Home Page</a>. ').translate();
				}

				var layout = this.application.getLayout();

				return layout.internalError && layout.internalError(content, page_header, _('Checkout').translate());
			}

			// if you have already placed the order you can not be in any other step than the last
			if (this.model && this.model.get('confirmation') && (this.model.get('confirmation').get('confirmationnumber') || this.model.get('confirmation').get('tranid')) && position.toLast !== 0)
			{
				window.location = Session.get('touchpoints.home');
				return;
			}

			WizardRouter.prototype.runStep.apply(this, arguments);

		}

		// @method start3DSecure Start the process of 3D Secure CC payments.
		// @param {jQuery.Deferred} promise An error (ERR_WS_REQ_PAYMENT_AUTHORIZATION) is expected on 'done', and triggers the view display.
		// @returns {jQuery.Deferred}
	,	start3DSecure: function (promise) {
			var self = this,
				wrapper_deferred = new jQuery.Deferred();

			promise.done(function() {

				var confirmation = self.model.get('confirmation')
				,	statuscode = confirmation.get('statuscode')
				,	success = false;

				if (statuscode) {
					if(statuscode === 'success') {
						wrapper_deferred.resolveWith(this);
						success = true;
					}
					else if(statuscode === 'error') {
						// Order is not success since payment authorization is required
						if (confirmation.get('reasoncode') && confirmation.get('reasoncode') === 'ERR_WS_REQ_PAYMENT_AUTHORIZATION') {
							if (confirmation.get('paymentauthorization')) {
								var view = new OrderWizardThreeDSecure({
									layout: self.application.getLayout(),
									application: self.application,
									wizard: self,
									deferred: wrapper_deferred
								});
								view.showInModal();
								success = true;
							}
						}
					}
				}

				if (!success) {
					wrapper_deferred.rejectWith(this);
				}
			}).fail (function () {
				wrapper_deferred.rejectWith(this);
			});

			return wrapper_deferred.promise();
		}
	});
});