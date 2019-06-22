/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard
define('CreditCard.Edit.View'
,	[
		'SC.Configuration'
	,	'CreditCard.Edit.Form.View'
	,	'creditcard_edit.tpl'
	,	'Backbone.CompositeView'
	,	'Backbone.FormView'
	,	'Backbone'
	,	'underscore'
	,	'LiveOrder.Model'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		Configuration
	,	CreditCardEditFormView
	,	creditcard_edit_tpl
	,	BackboneCompositeView
	,	BackboneFormView
	,	Backbone
	,	_
	,	LiveOrderModel
	,	jQuery
	)
{
	'use strict';

	// @class CreditCard.Edit.View card details view/edit @extends Backbone.View
	return Backbone.View.extend({

		template: creditcard_edit_tpl

	,	attributes: { 'class': 'CreditCardDetailsView' }

	,	events: {
			'submit form': 'saveForm'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		,	'change form [name="ccnumber"]': 'setPaymethodKey'

		}

		//@method initialize
		//@param {CreditCard.Edit.View.Initialize} options
	,	initialize: function ()
		{
			var addCCLabel = _('Add Credit Card').translate();
			var	editCCLabel = _('Edit Credit Card').translate();
			this.title = this.model.isNew() ?  addCCLabel : editCCLabel ;
			this.page_header = this.title;

			// initialize date selector
			var currentExpYear = this.model.get('expyear')
			, 	newExpYear = new Date().getFullYear()
			,	range = _.range(new Date().getFullYear(), new Date().getFullYear() + 25);

			if (currentExpYear && currentExpYear < newExpYear)
			{
				range = _.union([parseInt(currentExpYear, 10)], range);
				this.options.expyear = currentExpYear;
			}
			if (!this.model.get('expmonth'))
			{
				this.options.currentMonth = new Date().getMonth() + 1;
			}

			this.options.months = _.range(1, 13);
			this.options.years = range;

			//only enable "default" functionality in myaccount

			this.options.showDefaults = Configuration.get('currentTouchpoint') === 'customercenter';

			this.showSaveCreditCardCheckbox = (Configuration.get('siteSettings.checkout.showsavecc', 'T') === 'T') && Configuration.get('currentTouchpoint') === 'checkout';
			this.saveCreditCardByDefault = (Configuration.get('siteSettings.checkout.saveccinfo', 'T') === 'T') && Configuration.get('currentTouchpoint') === 'checkout';

			BackboneCompositeView.add(this);
			this.showCardsImgs = true;
		}

	, 	childViews : {
			'CreditCard.Form' : function ()
			{
				return new CreditCardEditFormView({
					model: this.model
				,	months: this.options.months
				,	years: this.options.years
				,	currentMonth: this.options.currentMonth
				,	showDefaults: this.options.showDefaults
				,	showSecurityCodeForm: this.options.showSecurityCodeForm
				,	showSaveCreditCardCheckbox: this.showSaveCreditCardCheckbox
				,	saveCreditCardByDefault: this.saveCreditCardByDefault
				});
			}
		}
		// @method paymenthodKeyCreditCart @param {String} cc_number @return {String} payment method key matching the passed credit card number if any or undefined.
	,	paymenthodKeyCreditCart: function (cc_number)
		{
			// regex for credit card issuer validation
			var payment_methods_configuration = Configuration.get('paymentmethods')
			// get the credit card key
			,	paymenthod_key;

			// validate that the number and issuer
			_.each(payment_methods_configuration, function (payment_method_configuration)
			{
				if (payment_method_configuration.regex && payment_method_configuration.regex.test(cc_number))
				{
					paymenthod_key = payment_method_configuration.key;
				}
			});

			var paymentmethod = paymenthod_key && _.findWhere(Configuration.get('siteSettings.paymentmethods'), {key: paymenthod_key});

			return paymentmethod && paymentmethod.key;
		}

		//@method setPaymethodKey
	,	setPaymethodKey: function (e)
		{
			var cc_number = jQuery(e.target).val().replace(/\s/g, '')
			,	form = jQuery(e.target).closest('form')
			,	paymenthod_key = this.paymenthodKeyCreditCart(cc_number);

			jQuery(e.target).val(cc_number);

			form.find('[name="paymentmethod"]').val(paymenthod_key || 0);

			if (paymenthod_key && this.showCardsImgs)
			{

				form.find('[data-image="creditcard-icon"]').each(function (index, img)
				{
					var $img = jQuery(img);
					if ($img.data('value') === paymenthod_key)
					{
						$img.addClass('creditcard-edit-card-selected');
						$img.removeClass('creditcard-edit-card-no-selected');
					}
					else
					{
						$img.addClass('creditcard-edit-card-no-selected');
						$img.removeClass('creditcard-edit-card-selected');
					}
				});
				form.find('[data-value="creditcard-select-container"]').css('display', 'none');
				form.find('[data-value="creditcard-img-container"]').css('display', 'block');
			}
			else
			{
				if (_.isUndefined(this.model.validation.ccnumber.fn(cc_number, {}, form)))
				{
					this.showCardsImgs = false;
					form.find('[data-image="creditcard-icon"]').removeClass('creditcard-edit-form-card-no-selected');
					form.find('[data-value="creditcard-select-container"]').css('display', 'block');
					form.find('[data-value="creditcard-img-container"]').css('display', 'none');
				}
				else
				{
					form.find('[data-value="creditcard-img-container"]').css('display', 'none');
				}
			}
		}
		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'creditcards';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return [
				{
					text: _('Credit Cards').translate()
				,	href: '/creditcards'
				}
			,	{
					text: this.title
				,	href: '/creditcards/new'
				}
			];
		}

	,	saveForm: function (e)
		{
			var $form = this.$(e.target)
			,	form_data = $form.serializeObject();

			// This is a hack to fix cases when the change event in ccnumber is not triggered and setPaymethodId is not call.
			// This occur in Safari with the AutoFill feature (using keychain)
			if (!form_data.paymentmethod || form_data.paymentmethod === '0')
			{
				$form.find('[name="ccnumber"]').change();
				form_data = $form.serializeObject();
			}

			// Call super and then check if the edited credit card is not on the order and if so update it.
			// Note that if securitycode is required and we pass an empty one then the payment method will be removed from the order.
			var live_order = LiveOrderModel.getInstance()
			,	promise;

			if (Configuration.get('currentTouchpoint') === 'checkout' && (this.showSaveCreditCardCheckbox && form_data.savecreditcard === 'F' || !this.showSaveCreditCardCheckbox && !this.saveCreditCardByDefault))
			{
				e.preventDefault();

				Backbone.Validation.bind(this);
				var result = this.model._validate(form_data, {validate: true});

				if (result)
				{
					var paymentmethods = Configuration.get('siteSettings.paymentmethods');

					if (!form_data.internalid)
					{
						// set fake internalid.
						form_data.internalid = '-temporal-';
					}
					else if (form_data.internalid === '-temporal-')
					{
						// remove the number to preserve the original value.
						delete form_data.ccnumber;
					}

					// format expiration date.
					form_data.ccexpiredate = form_data.expmonth + '/' + form_data.expyear;
					// set the payment method information.
					form_data.paymentmethod = _.findWhere(paymentmethods, {key: form_data.paymentmethod});
					// set the values to the model.
					this.model.set(form_data);

					promise = jQuery.Deferred();

					promise.resolveWith(this.model, [this.model.attributes]);
					// close the modal
					if (this.inModal && this.$containerModal)
					{
						this.$containerModal.modal('hide');
					}

				}
				else
				{
					promise = result;
				}

			}
			else
			{
				if (this.model.get('internalid') === '-temporal-')
				{
					// remove fake internalid
					this.model.unset('internalid', {silent: true});

				}
				promise = BackboneFormView.saveForm.apply(this, arguments);
			}

			promise && promise.done(function (user_cc)
			{
				live_order.get('paymentmethods').each(function (paymentmethod)
				{
					var order_cc = paymentmethod.get('creditcard');
					if (order_cc && user_cc && order_cc.internalid === user_cc.internalid)
					{
						// in the payment method of the order, ONLY update those fields editable by the user.
						order_cc.ccexpiredate = user_cc.ccexpiredate;
						order_cc.ccname = user_cc.ccname;
						order_cc.expmonth = user_cc.expmonth;
						order_cc.expyear = user_cc.expyear;

						paymentmethod.set('creditcard', order_cc);
						live_order.get('paymentmethods').add(paymentmethod, {merge: true});
					}
				});
			});

			return promise;
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent('creditcards');
		}

		//@method getContext @return CreditCard.View.Details.Context
	,	getContext: function ()
		{
			//@class CreditCard.View.Details.Context
			return {
				//@property {Boolean} isModal
				isModal: this.inModal
				//@property {Boolean} isNew
			,	isNew: this.model.isNew()
				//@property {Boolean} isNew
			,	isCollectionEmpty: this.options.isCreditCardCollectionEmpty
				//@property {Boolean} isModalOrCollectionLength
			,	isModalOrCollectionLength: !!(this.inModal || !this.options.isCreditCardCollectionEmpty)
				//@property {Boolean} showFooter
			,	showFooter: !this.options.hideFooter
				//@property {Boolean} isInModalOrHideHeader
			,	isInModalOrHideHeader: this.inModal || !!this.options.hideHeader
				//@property {Boolean} showHeader
			,	showHeader: !this.options.hideHeader
				//@property {Boolean} showBackToAccount
			,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD' && !this.options.hideHeader
			};
		}
	});
});

//@class CreditCard.Edit.View.Initialize
//@property {Boolean} isCreditCardCollectionEmpty
//@property {Boolean} hideFooter
//@property {Boolean} hideHeader
//@property {ApplicationSkeleton} application
//@property {Address.Model} model