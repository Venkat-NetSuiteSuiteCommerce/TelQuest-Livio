/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard.Module.PaymentMethod
define(
	'OrderWizard.Module.PaymentMethod.Creditcard'
,	[
		'OrderWizard.Module.PaymentMethod'
	,	'CreditCard.Edit.View'
	,	'CreditCard.Model'
	,	'Transaction.Paymentmethod.Model'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'CreditCard.View'
	,	'SC.Configuration'
	,	'GlobalViews.Confirmation.View'

	,	'order_wizard_paymentmethod_creditcard_module.tpl'
	,	'backbone_collection_view_cell.tpl'
	,	'backbone_collection_view_row.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Profile.Model'
	]
,	function (
		OrderWizardModulePaymentMethod
	,	CreditCardEditView
	,	CreditCardModel
	,	TransactionPaymentmethodModel
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	CreditCardView
	,	Configuration
	,	GlobalViewsConfirmationView

	,	order_wizard_paymentmethod_creditcard_module_tpl
	,	backbone_collection_view_cell_tpl
	,	backbone_collection_view_row_tpl

	,	Backbone
	,	_
	,	jQuery
	,	ProfileModel
	)
{
	'use strict';

	//@class OrderWizard.Module.PaymentMethod.Creditcard @extends OrderWizard.Module.PaymentMethod
	return OrderWizardModulePaymentMethod.extend({
		//@property {Function} template
		template: order_wizard_paymentmethod_creditcard_module_tpl

		//@property {Object} securityNumberErrorMessage
	,	securityNumberErrorMessage: {errorCode:'ERR_CHK_INCOMPLETE_SECURITY_NUMBER', errorMessage:  undefined}

		//@property {String} selectMessage
	,	selectMessage: _('Use this Card').translate()

		//@events {Object} events
	,	events: {
			'click [data-action="select"]': 'selectCreditCard'
		,	'click [data-action="change-creditcard"]': 'changeCreditCard'
		,	'click [data-action="remove"]': 'removeCreditCard'
		,	'mouseover [data-toggle="popover"]': 'openPopover'
		,	'click [data-action="show-safe-secure-info"]': 'showSecureInfo'
		}
		//@property {Array<String>} errors
	,	errors: ['ERR_CHK_INCOMPLETE_CREDITCARD', 'ERR_CHK_SELECT_CREDITCARD', 'ERR_CHK_EXPIRED_CREDITCARD', 'ERR_CHK_INCOMPLETE_SECURITY_NUMBER', 'ERR_WS_INVALID_PAYMENT']

		//@method initialize
		//@return {Vodi}
	,	initialize: function ()
		{
			OrderWizardModulePaymentMethod.prototype.initialize.apply(this, arguments);
			BackboneCompositeView.add(this);
		}

		//@method isActive Indicate if in the current state this module is active to be shown or not
		//@return {Boolean}
	,	isActive: function ()
		{
			var a_credit_card = _.findWhere(Configuration.get('siteSettings.paymentmethods', []), {
				creditcard: 'T'
			});

			return a_credit_card && a_credit_card.internalid;
		}

		//@method part Override default implementation to clean the saves credit card verification code
		//@return {Void}
	,	past: function ()
		{
			this.ccsecuritycode = '';
			this.unsetSecurityNumber();
		}

		//@method render
	,	render: function ()
		{
			var self = this
				// currently we only support 1 credit card as payment method
			,	order_payment_method = this.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				});

			this.creditcard = null;

			this.paymentMethod = order_payment_method || new TransactionPaymentmethodModel({
				type: 'creditcard'
			});

			var	order_creditcard = this.paymentMethod.get('creditcard');

			this.requireccsecuritycode = Configuration.get('siteSettings.checkout.requireccsecuritycode', 'T') === 'T';

			// credit-card set up
			this.creditcards = ProfileModel.getInstance().get('creditcards');

			// Removes previously added events on the address collection
			this.creditcards.off(null, null, this);

			this.creditcards.on('reset destroy change add remove', function ()
			{
				//search for the paymentmethod in the order that is creditcard
				var order_payment_method = self.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				})
				,	order_creditcard_id = order_payment_method && order_payment_method.get('creditcard') && order_payment_method.get('creditcard').internalid;

				//if the order has a credit card and that credit card exists on the profile we set it (making sure it is the same as in the profile)
				if (order_creditcard_id && self.creditcards.get(order_creditcard_id))
				{
					self.setCreditCard({
						id: order_creditcard_id
					});
				}
				// if the credit-card in the order is not longer in the profile we delete it.
				else if (order_creditcard_id)
				{
					self.unsetCreditCard();
				}

				self.render();

			}, this);

			if (!this.creditcards.length)
			{
				this.creditcard = new CreditCardModel({}, {
					paymentMethdos: Configuration.get('siteSettings.paymentmethods')
				});
			}
			else
			{
				if (order_creditcard && order_creditcard.internalid)
				{
					this.creditcard = this.creditcards.get(order_creditcard.internalid);
				}
				else if (ProfileModel.getInstance().get('isGuest') === 'T')
				{
					// if the order is empty and is a guest use the first credit card in the list
					this.creditcard = this.creditcards.at(0);

					this.setCreditCard({
						id: this.creditcard.id
					});
				}
				else if (!this.unset)
				{
					this.creditcard = this.creditcards.findWhere({
                        ccdefault: 'T'
                    });

                    if (this.creditcard && this.creditcard.id)
                    {
						this.setCreditCard({
							id: this.creditcard.id
						});
                    }
                }
			}

			this._render();

			this.isValid().done(function ()
			{
				self.trigger('ready', !self.requireccsecuritycode);
			});
		}

		//@method removeCreditCard dispatch the remove event
	,	removeCreditCard: function (e)
		{
			e.preventDefault();

			var deleteConfirmationView = new GlobalViewsConfirmationView({
					callBack: this._removeCreditCardFromCollection
				,	callBackParameters: {
						context: this
					,	creditcardId: jQuery(e.target).data('id')
					}
				,	title: _('Remove Credit Card').translate()
				,	body: _('Are you sure you want to remove this Credit Card?').translate()
				,	autohide: true
				});

			return this.wizard.application.getLayout().showInModal(deleteConfirmationView);
		}
	,	_removeCreditCardFromCollection: function (options)
		{
			if (options.creditcardId !== '-temporal-')
			{
			options.context.creditcards.get(options.creditcardId).destroy({ wait: true });
		}
			else
			{
				options.context.creditcards.remove(options.creditcardId);

				options.context.wizard.model.save();

			}
		}

		//@method changeCreditCard
	,	changeCreditCard: function (e)
		{
			if (ProfileModel.getInstance().get('isGuest') !== 'T' || this.creditcard.get('internalid') === '-temporal-')
			{
				if (this.creditcard.get('internalid') === '-temporal-')
				{
					var internalid = this.creditcard.get('internalid');
					this.creditcards.remove(internalid);
					ProfileModel.getInstance().get('creditcards').remove(internalid);
				}

				this.unsetCreditCard(e);
			}
			else
			{
				var self = this;

				e.preventDefault();
				e.stopPropagation();

				this.creditcard.destroy({
					wait: true
				}).then(function ()
				{
					self.creditcards.reset([]);
					ProfileModel.getInstance().get('creditcards').reset([]);
				});
			}
		}

		//@method openPopover
	,	openPopover: function (e)
		{
			e.preventDefault();
			e.stopPropagation();

			var $link = this.$(e.target);

			$link.popover({
				trigger: 'manual'
			,	html: true
			}).popover('toggle');

			// add more close popover
			this.closePopover($link);
		}

		//@method closePopover
	,	closePopover: function (link)
		{
			// close mouseout
			link.on('mouseout', function (e)
			{
				e.preventDefault();
				link.popover('hide');
			});

			// close for mobile
			this.$el.one('click', '[data-type="close-popover"]', function (e)
			{
				e.preventDefault();
				link.popover('hide');
			});
		}

		//@method selectCreditCard
	,	selectCreditCard: function (e)
		{
			this.setCreditCard({
				id: jQuery(e.target).data('id')
			});

			// As we alreay set the credit card, we let the step know that we are ready
			this.trigger('ready', !this.requireccsecuritycode);
		}

		//@method setSecurityNumber
	,	setSecurityNumber: function ()
		{
			if (this.requireccsecuritycode)
			{
				var creditcard = this.paymentMethod.get('creditcard');

				if (creditcard)
				{
					creditcard.ccsecuritycode = this.ccsecuritycode;
				}
			}
		}

		//@method unsetSecurityNumber
	,	unsetSecurityNumber: function ()
		{
			var creditcard = this.paymentMethod && this.paymentMethod.get('creditcard');

			if (creditcard)
			{
				creditcard.ccsecuritycode = null;
			}
		}

	,	isExpiredCreditCard: function(credit_card)
		{
			var credit_card_expire_year = parseInt(credit_card.expyear, 10)
			,	credit_card_expire_month = parseInt(credit_card.expmonth, 10)
			,	today = new Date()
			,	today_year = today.getFullYear()
			,	today_month = today.getMonth() + 1;

			return credit_card_expire_year < today_year ||
					(credit_card_expire_year === today_year && credit_card_expire_month < today_month);
		}
	,	getExpiredCreditCardError: function()
		{
			return {
				errorCode: 'ERR_CHK_EXPIRED_CREDITCARD'
			,	errorMessage: _('Your credit card has expired, please select another one.').translate()
			};
		}

		//@method setCreditCard
	,	setCreditCard: function (options)
		{
			var credit_card = options.model || this.creditcards.get(options.id).attributes;

			this.paymentMethod = new TransactionPaymentmethodModel({
				type: 'creditcard'
			,	creditcard: credit_card
			});

			this.setSecurityNumber();

			OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

			// We re render so if there is changes to be shown they are represented in the view
			this.render();

			//when credit card is expired we immediately show a message
			if (this.isExpiredCreditCard(credit_card))
			{
				var error = this.getExpiredCreditCardError();
				OrderWizardModulePaymentMethod.prototype.manageError.call(this, error);
			}
		}

		//@method unsetCreditCard
	,	unsetCreditCard: function (e)
		{
			if (e)
			{
				e.preventDefault();
				e.stopPropagation();
			}

			this.unset = true;

			this.paymentMethod = new TransactionPaymentmethodModel({
				type: 'creditcard'
			});

			this.ccsecuritycode = null;

			OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

			// We re render so if there is changes to be shown they are represented in the view
			this.render();
		}

		//@method submit
	,	submit: function ()
		{
			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

			var self = this;

			if (this.requireccsecuritycode)
			{
				this.isSecurityNumberInvalid = false;
				// we need to store this temporally (frontend) in case a module in the same step
				// fails validation, making the credit card section re-rendered.
				// We don't want the user to have to type the security number multiple times
				this.ccsecuritycode = this.$('input[name="ccsecuritycode"]').val();
			}

			// if we are adding a new credit card
			if (this.creditcardView)
			{
				var fake_event = jQuery.Event('click', {
						target: this.creditcardView.$('form').get(0)
					})
				,	result = this.creditcardView.saveForm(fake_event);

				if (!result || result.frontEndValidationError)
				{
					// There were errors so we return a rejected promise
					return jQuery.Deferred().reject({
						errorCode: 'ERR_CHK_INCOMPLETE_CREDITCARD'
					,	errorMessage: _('The Credit Card is incomplete').translate()
					});
				}

				var save_result = jQuery.Deferred();

				result.done(function (model)
				{
					self.creditcardView = null;

					ProfileModel.getInstance().get('creditcards').add(model, {
						silent: true
					});

					self.setCreditCard({
						model: model
					});

					save_result.resolve();
				}).fail(function (error)
				{
					save_result.reject(error.responseJSON);
				});

				return save_result;
			}
			// if there are already credit cards
			else
			{
				this.setSecurityNumber();

				OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

				return this.isValid().fail(function (error)
				{
					if (error === self.securityNumberErrorMessage)
					{
						self.isSecurityNumberInvalid = true;
					}

				}).done(function ()
				{
					self.isSecurityNumberInvalid = false;

				}).always(function ()
				{
					// Call self.render() instead of self._render() because the last one didn't asign the events to the DOM
					self.render();
				});
			}
		}

		//@method isValid
	,	isValid: function ()
		{
			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

				// user's credit cards
			var creditcards = ProfileModel.getInstance().get('creditcards')
				// current order payment method
			,	order_payment_method = this.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				})
				// current order credit card
			,	order_creditcard = order_payment_method && order_payment_method.get('creditcard');

			// Order is using a credit card
			// and there is a collection of creditcards
			// and the order's creditcard is on that collection
			if (order_creditcard && creditcards.length && creditcards.get(order_creditcard.internalid))
			{
				this.securityNumberErrorMessage.errorMessage  = _.validateSecurityCode(order_creditcard.ccsecuritycode);

				if (this.isExpiredCreditCard(order_creditcard))
				{
					var error = this.getExpiredCreditCardError();
					return jQuery.Deferred().reject(error);
				}

				if (!this.requireccsecuritycode || !this.securityNumberErrorMessage.errorMessage)
				{
					return jQuery.Deferred().resolve();
				}
				else
				{
					return jQuery.Deferred().reject(this.securityNumberErrorMessage);
				}
			}
			else
			{
				// if it not set, then lets reject it
				return jQuery.Deferred().reject({errorCode: 'ERR_CHK_SELECT_CREDITCARD', errorMessage: _('Please select a credit card').translate()});
			}
		}

		//@method manageError
	,	manageError: function (error)
		{
			if (error && error.errorCode !== 'ERR_CHK_INCOMPLETE_CREDITCARD')
			{
				var control_error = this.$('.creditcard-edit-form-securitycode-group')
				,	errorBlock = { attr: 'data-validation-error', value: 'block'};

				if (error.errorCode === 'ERR_CHK_INCOMPLETE_SECURITY_NUMBER')
				{
					control_error.attr('data-validation-error', '');
					this.$('.creditcard-edit-form-securitycode-controls').append('<p ' + errorBlock.attr + '="' + errorBlock.value +'">'+error.errorMessage+'</p>');
				}
				else
				{
				if (error.errorCode === 'ERR_WS_INVALID_PAYMENT')
				{
					this.unsetCreditCard();
				}

				OrderWizardModulePaymentMethod.prototype.manageError.apply(this, arguments);
			}
		}
		}

		// @method showSecureInfo Shows
	,	showSecureInfo : function()
		{
			var view = new Backbone.View({application: this.wizard.application})
			,	self = this;

			view.title = _('Safe and Secure Shopping').translate();
			view.render = function ()
			{
   				this.$el.html(_(self.wizard.application.getConfig('creditCard.creditCardShowSecureInfo')).translate());
  				return this;
			};
			view.showInModal();
		}

	,	prepopulateCreditCardModel: function ()
		{
			if (this.wizard.isAutoPopulateEnabled && this.wizard.isAutoPopulateEnabled())
			{
				this.creditcard.set('ccname', this.wizard.options.profile.get('firstname') + ' ' + this.wizard.options.profile.get('lastname'));
			}
			return this.creditcard;
		}

		//@property {Object} childViews
	,	childViews: {
				'CreditCard.List': function ()
				{
					return new BackboneCollectionView({
						collection: this.creditcards
					,	childView: CreditCardView
					,	childViewOptions: {
							showActions: true
						,	showDefaults: this.showDefaults
						,	showSelect: true
						,	selectMessage: this.selectMessage
						}
					,	viewsPerRow: this.itemsPerRow || 2
					,	cellTemplate: backbone_collection_view_cell_tpl
					,	rowTemplate: backbone_collection_view_row_tpl

					});
				}
			,	'CreditCard.Form': function ()
				{
					this.creditcardView = new CreditCardEditView({
						model: this.prepopulateCreditCardModel()
					,	isCreditCardCollectionEmpty: true //This view is only render when there is no credit cards at all
					,	hideHeader: true
					,	hideFooter: true
					,	showSecurityCodeForm: this.requireccsecuritycode
					});

					return this.creditcardView;
				}
			,	'SelectedCreditCard': function ()
				{
					return new CreditCardView({
							model: this.creditcard
						,	showSecurityCodeForm: this.requireccsecuritycode
						,	securityNumberError: this.isSecurityNumberInvalid && this.securityNumberErrorMessage
						,	ccsecuritycode: this.ccsecuritycode
						,	showCreditCardHelp: Configuration.get('creditCard.showCreditCardHelp', true)
						,	creditCardHelpTitle: _(Configuration.get('creditCard.creditCardHelpTitle', true)).translate()
						,	collapseElements: Configuration.get('sca.collapseElements', true)
					});
				}
		}

		//@method getContext @returns {OrderWizard.Module.PaymentMethod.Creditcard.Context}
	,	getContext: function ()
		{
			var showForm = this.creditcards.length === 0 && (!this.creditcard || this.creditcard && this.creditcard.isNew());

			if (!showForm)
			{
				// Skip_Login fix, because when starting the wizard, the user is guest, he has no credit cards so we show the CreditCard.Form and we set it on this.creditCardView
				// But then when the user logs in, this.creditCardView still exists and the submit thinks it's a new credit card
				this.creditcardView = null;
			}

			//@class OrderWizard.Module.PaymentMethod.Creditcard.Context
			return {
				//@property {Boolean} showForm
				showForm: showForm
				//@property {Boolean} showList
			,	showList: !!(this.creditcards.length >= 1 && !this.creditcard)
				//@property {Boolean} showSelectedCreditCard
			,	showSelectedCreditCard: !!(this.creditcard && !this.creditcard.isNew())
				//@property {Boolean} showTitle
			,	showTitle: !!this.getTitle()
				//@property {String} title
			,	title: this.getTitle()
				//@property {CreditCard.Model} selectedCreditCard
			,	selectedCreditCard: this.creditcard
				//@property {CreditCard.Collection} creditCards
			,	creditCards: this.creditcards
			};
		}
	});
});
