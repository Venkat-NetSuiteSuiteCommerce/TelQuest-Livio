/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard
define(
	'OrderWizard.Module.MultiShipTo.Package.Creation'
,	[	'Wizard.Module'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Transaction.Line.Views.Cell.Selectable.View'
	,	'OrderWizard.Module.MultiShipTo.Package.Creation.EditQuantity'
	,	'Address.Details.View'

	,	'order_wizard_msr_package_creation.tpl'

	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		WizardModule
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	TransactionLineViewsCellSelectableView
	,	OrderWizardModuleMultiShipToSetAddressesPackageEditQuantity
	,	AddressDetailsView

	,	order_wizard_msr_package_creation_tpl

	,	_
	,	jQuery
	)
{
	'use strict';

	//@class OrderWizard.Module.MultiShipTo.Package.Creation @extend Wizard.Module
	return WizardModule.extend(
	{
		template: order_wizard_msr_package_creation_tpl

	,	allItemShouldBelongToAPackage: {
			errorMessage: _('Some of your items are not assigned to a shipping address. Please, go back to shipping step.').translate()
		,	errorCode: 'ERR_MST_ITEM_WITHOUT_PACKAGE'
		}

	,	errors: ['ERR_MST_ITEM_WITHOUT_PACKAGE']

	,	events: {
			'click [data-action="select-unselected-item"]' : 'selectLine'
		,	'click [data-action="sub-quantity"]' : 'subQuantity'
		,	'click [data-action="add-quantity"]' : 'addQuantity'
		,	'change [data-action="split-quantity"]' : 'updateLineQuantity'
		,	'change [data-action="set-shipments-address-selector"]' : 'setSelectedAddressId'
		,	'click [data-action="select-unselect-all"]': 'selectUnselectAll'
		,	'click [data-action="create-shipments"]' : 'applyCurrentAddress'
		}

	,	initialize: function (options)
		{
			this.options = options;
			WizardModule.prototype.initialize.apply(this, arguments);

			var self = this;
			this.selected_address_id = null;
			this.createShipmentLabel = '';
			this.createShipmentEnabled = false;

			this.wizard.model.on('multishipto-line-updated', function ()
				{
					self.selected_address_id = self.getFirstAddressIdWithoutShipments();
					self.render();
				});

			self.wizard.options.profile.get('addresses').once('reset', function ()
				{
					self.selected_address_id = self.getFirstAddressIdWithoutShipments();
				});

			BackboneCompositeView.add(this);
		}

	,	updateLineQuantity: function(event)
		{
			var target = jQuery(event.currentTarget)
			,	target_control_group = target.closest('[data-validation="control-group"]')
			,	message_placeholder = target_control_group.find('[data-validation="error-placeholder"]')
			,	create_shippment_button = this.$('[data-action="create-shipments"]')
			,	line_id = target.closest('[data-type="row"]').data('lineId')
			,	selected_line = this.wizard.model.get('lines').get(line_id)
			,	min_quantity = selected_line.get('minimumquantity') || 1
			,	quantity = selected_line.get('quantity')
			,	new_quantity = parseInt(target.val(), 10);

			//invalid values return to default quantity
			if (isNaN(new_quantity) || new_quantity > quantity)
			{
				target.val(quantity);
				return;
			}

			if(min_quantity > new_quantity)
			{
				target.val(min_quantity);
				return;
			}

			if (quantity - new_quantity >= min_quantity || new_quantity === quantity)
			{
				target_control_group.removeAttr('data-validation-error');
				create_shippment_button.removeAttr('disabled');
				message_placeholder.empty().hide();
				selected_line.set('splitquantity', new_quantity);

			}
			else
			{
				target_control_group.attr('data-validation-error', '');
				create_shippment_button.attr('disabled', '');
				selected_line.unset('splitquantity');

				var message = _('The remaining quantity of items ($(0)) should be more than the minimum quantity required').translate(quantity - new_quantity);
				message_placeholder.text(message).show();
			}
		}

		// @method addQuantity plus/minus Quantity
	,	addQuantity: function (e)
		{
			e.stopPropagation();
			var $line = jQuery(e.target).closest('[data-type="row"]')
			,	quantity_edit = $line.find('[data-action="split-quantity"]')
			,	new_quantity = parseFloat(quantity_edit.val(), 10) + 1;

			quantity_edit.val(new_quantity);
			quantity_edit.trigger('change');
		}

	,	subQuantity: function (e)
		{
			e.stopPropagation();
			var $line = jQuery(e.target).closest('[data-type="row"]')
			,	quantity_edit = $line.find('[data-action="split-quantity"]')
			,	new_quantity = parseFloat(quantity_edit.val()) - 1;

			quantity_edit.val(new_quantity);
			quantity_edit.trigger('change');
		}

		// Returns the first address id without a shipment associated to it
	,	getFirstAddressIdWithoutShipments: function ()
		{
			var set_lines = this.wizard.model.getSetLines()
			,	addresses = this.getValidAddresses()
			,	default_shipping_address = _.find(addresses, function (address) { return address.get('defaultshipping') === 'T'; })
			,	is_default_shipping_address_valid
			,	selected_address = _.find(addresses, function (address)
				{
					return !_.find(set_lines, function (line)
					{
						return line.get('shipaddress') === address.id;
					});
				});

			if (default_shipping_address)
			{
				is_default_shipping_address_valid = !_.find(set_lines, function (line)
				{
					return line.get('shipaddress') === default_shipping_address.id;
				});

				if (is_default_shipping_address_valid)
				{
					return default_shipping_address.id;
				}
			}

			return selected_address ?
					selected_address.id :
					addresses && addresses.length ? _.first(addresses).id : null;
		}

		// Manage the selection or unselection of all items
	,	selectUnselectAll: function ()
		{
			var unset_lines = this.wizard.model.getUnsetLines()
			,	check_lines = _.filter(unset_lines, function (line)
				{
					return line.get('check');
				});

			check_lines.length === unset_lines.length ?
				this.unselectAllItems() :
				this.selectAllItems();

			this.render();
		}

		// Returns the count of items selected
	,	getSelectedItemsLength: function ()
		{
			return _.filter(this.wizard.model.getUnsetLines(), function (line)
			{
				return line.get('check');
			}).length;
		}

		// Select all items
	,	selectAllItems: function ()
		{
			_.each(this.wizard.model.getUnsetLines(), function (line)
			{
				line.set('check', true);
			});
		}

		// Unselect all items
	,	unselectAllItems: function ()
		{
			_.each(this.wizard.model.getUnsetLines(), function (line)
			{
				line.set('check', false);
				line.unset('splitquantity');
			});
		}

	,	isActive: function ()
		{
			return this.wizard.model.get('ismultishipto') && this.wizard.model.shippingAddressIsRequired();
		}

		// Returns the list of address available to be part of Multi Ship To
	,	getValidAddresses: function ()
		{
			return this.wizard.options.profile.get('addresses').where({isvalid: 'T'});
		}

		// Override Render in order to update Continue and back buttons
	,	render: function ()
		{
			if (this.isActive())
			{
				this.updateContinueButtonState();
				return WizardModule.prototype.render.apply(this, arguments);
			}
			this.$el.empty();
		}

		// Returns the current address id. Used when the page is re-render to avoid losing the selected address in the combo-box
	,	getSelectedAddressId: function ()
		{
			if (!this.selected_address_id || !this.wizard.options.profile.get('addresses').where({internalid: this.selected_address_id}).length)
			{
				this.selected_address_id = this.getFirstAddressIdWithoutShipments();
			}
			return this.selected_address_id;
		}

		// Set the selected address to retrieved it later
	,	setSelectedAddressId: function (e)
		{
			this.selected_address_id = jQuery(e.target).val();
			this.render();
		}

		// Select and un-select an item
	,	selectLine: function selectLine(e)
		{
			//ignore clicks on anchors, buttons, etc
			if (_.isTargetActionable(e))
			{
				return;
			}

			var marked_line_id = jQuery(e.currentTarget).data('lineId')
			,	selected_line = this.wizard.model.get('lines').get(marked_line_id);

			selected_line.set('check', !selected_line.get('check'));

			if (!selected_line.get('check'))
			{
				selected_line.unset('splitquantity');
			}
			this.render();
		}

		// Determines if the passed in address id has already created at one shipment
	,	addressHasShipments: function (address_id)
		{
			return !!_.find(this.wizard.model.getShippableLines(), function (item)
			{
				return item.get('shipaddress') === address_id;
			});
		}

		// Update Continue button, enable/disable and change its label
	,	updateContinueButtonState: function ()
		{
			var unapplied_items_length = this.wizard.model.getUnsetLines().length
			,	selected_items_length = this.wizard.model.get('lines').filter(function(line) { return !!line.get('check'); }).length
			,	selected_address_id = jQuery('[data-action="set-shipments-address-selector"]').val()
			,	continue_enabled;

			continue_enabled = _.all(this.wizard.model.getShippableLines(), function (item)
			{
				return !!item.get('shipaddress');
			});

			this.createShipmentEnabled = !(unapplied_items_length > 0 && selected_items_length <= 0);

			if (selected_items_length > 0 && this.addressHasShipments(selected_address_id))
			{
				this.createShipmentLabel = _('Add to Shipment').translate();
			}
			else
			{
				this.createShipmentLabel = _('Create Shipment').translate();
			}

			this.trigger('change_enable_continue', continue_enabled, {onlyContinue: true, notDisableTouchs: true});
		}

	,	isValid: function ()
		{
			return (this.wizard.model.getUnsetLines().length && this.isActive()) ?
				jQuery.Deferred().reject(this.allItemShouldBelongToAPackage) :
				jQuery.Deferred().resolve();
		}

	,	restoreModelBeforeApplyAddress: function()
		{
			var self = this;
			_.each(this.linesBeforeApplyAddress, function(value,id){

					var line = self.wizard.model.get('lines').findWhere({internalid:id});
					line.set('shipaddress', value.shipaddress);
					line.set('check', value.check);
			});
		}

		// Apply for all selected lines the current address
	,	applyCurrentAddress: function ()
		{
			this.clearGeneralMessages();
			var selected_address_id = jQuery('[data-action="set-shipments-address-selector"]').val()
			,	self = this
			,	selected_items_length = this.wizard.model.get('lines').filter(function(line) { return !!line.get('check'); }).length
			,	selected_address = this.wizard.options.profile.get('addresses').get(selected_address_id)
			,	item_for_address = this.wizard.model.get('lines').groupBy(function (line)
				{
					return line.get('shipaddress');
				})[selected_address_id]
			,	result
			,	notify_success_message = function ()
				{
					var message = selected_items_length > 1 ?
						_('$(0) items was added to Shipment: $(1)').translate(selected_items_length, selected_address.get('fullname')) :
						_('$(0) item was added to Shipment: $(1)').translate(selected_items_length, selected_address.get('fullname'));

					self.showGeneralMessage(message, false);
				};

			if (selected_address_id && selected_address)
			{
				if (!selected_address.get('check'))
				{
					selected_address.set('check', true);
					this.wizard.model.get('addresses').add(selected_address);
				}

				this.linesBeforeApplyAddress = {};

				_.each(this.wizard.model.get('lines').where({check: true}), function (line)
				{
					self.linesBeforeApplyAddress[line.id] = {
						shipaddress: line.get('shipaddress')
					,	check: line.get('check')
					};
					line.set('shipaddress', selected_address_id);
					line.set('check', false);
				});

				result = this.wizard.model.save()
							.fail(function(){
								self.restoreModelBeforeApplyAddress();
							})
							.then(function ()
								{
									self.selected_address_id = self.getFirstAddressIdWithoutShipments();
								})
							.then(function ()
								{
									self.wizard.model.trigger('multishipto-address-applied');
								})
							.then(_.bind(this.render, this));

				//There are already shipments created
				if (item_for_address && item_for_address.length)
				{
					result.then(notify_success_message);
				}
				else
				{
					result.then(function ()
					{
						self.clearGeneralMessages();
					});
				}

				return result;
			}
			else
			{
				return jQuery.Deferred().resolve();
			}
		}

	,	childViews: {
			'ShippableItems.Collection': function ()
			{
				return new BackboneCollectionView({
						collection: this.wizard.model.getUnsetLines()
					,	childView: TransactionLineViewsCellSelectableView
					,	viewsPerRow: 1
					,	childViewOptions: {
							navigable: false

						,	detail1Title: _('Qty:').translate()
						,	detail1: OrderWizardModuleMultiShipToSetAddressesPackageEditQuantity

						,	detail2Title: _('Unit price:').translate()
						,	detail2: 'rate_formatted'

						,	detail3Title: _('Amount:').translate()
						,	detail3: 'amount_formatted'
						}
				});
			}
		,	'Address.Details': function ()
			{
				return new AddressDetailsView({
					model: this.wizard.options.profile.get('addresses').get(this.getSelectedAddressId())
				,	hideActions: true
				,	hideDefaults: true
				,	manage: 'shipaddress'
				});
			}
		}

		//@method getContext @return {OrderWizard.Module.MultiShipTo.Package.Creation.Context}
	,	getContext: function ()
		{
			var addresses = this.getValidAddresses()
			,	current_selected_address_id = this.getSelectedAddressId()
			,	addresses_map = _.map(addresses, function (address)
				{
					//@class AddressObject
					return {
						//@property {String} addressId
						addressId: address.get('internalid')
						//@property {Boolean} isSelected
					,	isSelected: address.get('internalid') === current_selected_address_id
						//@property {String} addressText
					,	addressText: address.get('fullname') +' - '+ address.get('addr1')
					};
				})
			,	unset_lines = this.wizard.model.getUnsetLines()
			,	all_items_length = unset_lines.length
			,	selected_items_length = this.getSelectedItemsLength()
			,	are_all_items_selected = selected_items_length === all_items_length;

			//@class OrderWizard.Module.MultiShipTo.Package.Creation.Context
			return {
				//@property {Boolean} isAnyUnsetLine
				isAnyUnsetLine: !!unset_lines.length
				//@property {Array<AddressObject>} addresses
			,	addresses: addresses_map
				//@property {Boolean} areAllItemSelected
			,	areAllItemSelected: are_all_items_selected
				//@property {Number} allItemsLength
			,	allItemsLength: all_items_length
				//@property {Boolean} isAnySelectedItem
			,	isAnySelectedItem: !!selected_items_length
				//@property {Boolean} isSelectedItemLengthGreaterThan1
			,	isSelectedItemsLengthGreaterThan1: selected_items_length > 1
				//@property {Number} selectedItemsLength
			,	selectedItemsLength: selected_items_length
				//@property {Boolean} isCreateShipmentEnabled
			,	isCreateShipmentEnabled: this.createShipmentEnabled
				//@property {String} createShipmentLabel
			,	createShipmentLabel: this.createShipmentLabel
				//@property {String} editAddressesUrl
			,	editAddressesUrl : this.options.edit_addresses_url || ''
				//@property {Boolean} hasMultipleUnsetLines
			,	hasMultipleUnsetLines: unset_lines.length > 1
			};
		}
	});
});