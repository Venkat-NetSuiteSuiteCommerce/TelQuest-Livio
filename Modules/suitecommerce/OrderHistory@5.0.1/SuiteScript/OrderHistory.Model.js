/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// OrderHistory.Model.js
// ----------
// Handles fetching orders
define(
	'OrderHistory.Model'
,	[
		'Application'
	,	'Utils'
	,	'StoreItem.Model'
	,	'Transaction.Model'
	,	'Transaction.Model.Extensions'
	,	'SiteSettings.Model'
	,	'SC.Model'
	,	'ReturnAuthorization.Model'
	,	'ExternalPayment.Model'
	,	'Models.Init'
	,	'underscore'
	]
,	function (
		Application
	,	Utils
	,	StoreItem
	,	Transaction
	,	TransactionModelExtensions
	,	SiteSettings
	,	SCModel
	,	ReturnAuthorization
	,	ExternalPayment
	,	ModelsInit
	,	_
	)
{
	'use strict';

	return Transaction.extend({

		name: 'OrderHistory'

	,	isPickupInStoreEnabled: SiteSettings.isPickupInStoreEnabled()

	,	isSCISIntegrationEnabled: SiteSettings.isSCISIntegrationEnabled()

	,	setExtraListColumns: function ()
		{
			this.columns.trackingnumbers = new nlobjSearchColumn('trackingnumbers');

			if (!this.isSCISIntegrationEnabled)
			{
				return;
			}

			this.columns.origin = new nlobjSearchColumn('formulatext');

			this.columns.origin.setFormula('case when LENGTH({source})>0 then 2 else (case when {location.locationtype.id} = \'' + SC.Configuration.locationTypeMapping.store.internalid + '\' then 1 else 0 end) end');
		}
	,	setExtraListFilters: function ()
		{
			if (this.data.filter === 'status:open') // Status is open and this is only valid for Sales Orders.
			{
				this.filters.type_operator = 'and';
				this.filters.type = ['type', 'anyof', ['SalesOrd']];
				this.filters.status_operator = 'and';
				this.filters.status = ['status', 'anyof', ['SalesOrd:A', 'SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E', 'SalesOrd:F']];
			}
			else if (this.isSCISIntegrationEnabled)
			{
				if (this.data.filter === 'origin:instore') // SCIS Integration enabled, only In Store records (Including Sales Orders from SCIS)
				{
					this.filters.scisrecords_operator = 'and';
					this.filters.scisrecords = [
						['type', 'anyof', ['CashSale','CustInvc', 'SalesOrd']]
					,	'and'
					,	['createdfrom.type', 'noneof', ['SalesOrd']]
					,	'and'
					,	[ 'location.locationtype', 'is', SC.Configuration.locationTypeMapping.store.internalid ]
					,	'and'
					,	['source', 'is', '@NONE@']
					];
				}
				else // SCIS Integration enabled, all records
				{
					this.filters.scisrecords_operator = 'and';
					this.filters.scisrecords = [
						[
							['type', 'anyof', ['CashSale','CustInvc']]
						,	'and'
						,	['createdfrom.type', 'noneof', ['SalesOrd']]
						,	'and'
						,	[ 'location.locationtype', 'is', SC.Configuration.locationTypeMapping.store.internalid ]
						,	'and'
						,	['source', 'is', '@NONE@']
						]
					,	'or'
					,	[
							['type', 'anyof', ['SalesOrd']]
						]
					];
				}
			}
			else // SCIS Integration is disabled, show all the Sales Orders
			{
				this.filters.type_operator = 'and';
				this.filters.type = ['type', 'anyof', ['SalesOrd']];
			}
		}
	,	mapListResult: function (result, record)
		{
			result = result || {};

			result.trackingnumbers = record.getValue('trackingnumbers') ? record.getValue('trackingnumbers').split('<BR>') : null;

			if (this.isSCISIntegrationEnabled)
			{
				result.origin = parseInt(record.getValue(this.columns.origin), 10);
			}

			return result;
		}
	,	getExtraRecordFields: function ()
		{
			this.getReceipts();

			this.getReturnAuthorizations();

			var origin = 0
			,	applied_to_transaction;


			if (this.isSCISIntegrationEnabled && !this.record.getFieldValue('source') && this.record.getFieldValue('location') && nlapiLookupField(this.result.recordtype, this.result.internalid, 'location.locationtype') === SC.Configuration.locationTypeMapping.store.internalid)
			{
				origin = 1; //store
			}
			else if (this.record.getFieldValue('source'))
			{
				origin = 2; //online
			}

			this.result.origin = origin;

			if (this.result.recordtype === 'salesorder')
			{
				applied_to_transaction = _(_.where(this.result.receipts || [], {recordtype: 'invoice'})).pluck('internalid');
			}
			else if (this.result.recordtype === 'invoice')
			{
				applied_to_transaction = [this.result.internalid];
			}

			this.getFulfillments();

			if (applied_to_transaction && applied_to_transaction.length)
			{
				this.getAdjustments({paymentMethodInformation: true, appliedToTransaction: applied_to_transaction});
			}

			this.result.ismultishipto = this.record.getFieldValue('ismultishipto') === 'T';

			this.getLinesGroups();

			this.result.receipts = _.values(this.result.receipts);

			//@property {Boolean} isReturnable
			this.result.isReturnable = this.isReturnable();

			this.getPaymentEvent();

			//@property {Boolean} isCancelable
			this.result.isCancelable = this.isCancelable();
		}

	,	getTerms: function ()
		{
			var terms = nlapiLookupField(this.result.recordtype, this.result.internalid, 'terms');

			if (terms)
			{
				return {
					//@property {String} internalid
					internalid: terms
					//@property {String} name
				,	name: nlapiLookupField(this.result.recordtype, this.result.internalid, 'terms', true)
				};
			}

			return null;
		}

	,	getStatus: function ()
		{
			this.result.status =
			{
				internalid: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status')
			,	name: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status', true)
			};
		}
	,	getLinesGroups: function ()
		{
			var self = this;

			_.each(this.result.lines, function (line)
			{
				var line_group_id = '';

				if (self.result.recordtype === 'salesorder')
				{
					if ( (self.isPickupInStoreEnabled && line.fulfillmentChoice === 'pickup') || (!self.result.ismultishipto && (!line.isfulfillable || !self.result.shipaddress)) || (self.result.ismultishipto && (!line.shipaddress || !line.shipmethod)))
					{

						if ( (self.isSCISIntegrationEnabled && self.result.origin === 1) || (self.isPickupInStoreEnabled && line.fulfillmentChoice === 'pickup') )
						{
							line_group_id = 'instore';
						}
						else
						{
							line_group_id = 'nonshippable';
						}
					}
					else
					{
						line_group_id = 'shippable';
					}
				}
				else
				{
					line_group_id = 'instore';
				}

				line.linegroup = line_group_id;
			});

		}
	,	getFulfillments: function ()
		{
			if (this.result.recordtype !== 'salesorder')
			{
				var location = this.record.getFieldValue('location');

				_.each(this.result.lines, function (line)
				{
					line.quantityfulfilled = line.quantity;
					line.location = location;
				});

				return;
			}


			this.result.fulfillments = {};

			var self = this
			,	filters = [
					new nlobjSearchFilter('internalid', null, 'is', this.result.internalid)
				,	new nlobjSearchFilter('mainline', null, 'is', 'F')
				,	new nlobjSearchFilter('shipping', null, 'is', 'F')
				,	new nlobjSearchFilter('taxline', null, 'is', 'F')
				]
			,	columns = [
					new nlobjSearchColumn('line')
				,	new nlobjSearchColumn('fulfillingtransaction')
				,	new nlobjSearchColumn('quantityshiprecv')

				,	new nlobjSearchColumn('actualshipdate')
				,	new nlobjSearchColumn('quantity','fulfillingtransaction')
				,	new nlobjSearchColumn('item','fulfillingtransaction')
				,	new nlobjSearchColumn('shipmethod','fulfillingtransaction')
				,	new nlobjSearchColumn('shipto','fulfillingtransaction')
				,	new nlobjSearchColumn('trackingnumbers','fulfillingtransaction')
				,	new nlobjSearchColumn('trandate','fulfillingtransaction')
				,	new nlobjSearchColumn('status','fulfillingtransaction')

					// Ship Address
				,	new nlobjSearchColumn('shipaddress','fulfillingtransaction')
				,	new nlobjSearchColumn('shipaddress1','fulfillingtransaction')
				,	new nlobjSearchColumn('shipaddress2','fulfillingtransaction')
				,	new nlobjSearchColumn('shipaddressee','fulfillingtransaction')
				,	new nlobjSearchColumn('shipattention','fulfillingtransaction')
				,	new nlobjSearchColumn('shipcity','fulfillingtransaction')
				,	new nlobjSearchColumn('shipcountry','fulfillingtransaction')
				,	new nlobjSearchColumn('shipstate','fulfillingtransaction')
				,	new nlobjSearchColumn('shipzip','fulfillingtransaction')
				];

			var pick_pack_ship_is_enabled = !!Utils.isFeatureEnabled('PICKPACKSHIP');

			if (pick_pack_ship_is_enabled)
			{
				columns.push(new nlobjSearchColumn('quantitypicked'));
				columns.push(new nlobjSearchColumn('quantitypacked'));
			}

			Application.getAllSearchResults('salesorder', filters, columns).forEach(function (ffline)
			{
				var fulfillment_id = ffline.getValue('fulfillingtransaction')
				,	line_internalid = self.result.internalid + '_' + ffline.getValue('line')
				,	line = _.findWhere(self.result.lines, {internalid: line_internalid});

				if (fulfillment_id)
				{
					var shipaddress = self.addAddress({
							internalid: ffline.getValue('shipaddress', 'fulfillingtransaction')
						,	country: ffline.getValue('shipcountry', 'fulfillingtransaction')
						,	state: ffline.getValue('shipstate', 'fulfillingtransaction')
						,	city: ffline.getValue('shipcity', 'fulfillingtransaction')
						,	zip: ffline.getValue('shipzip', 'fulfillingtransaction')
						,	addr1: ffline.getValue('shipaddress1', 'fulfillingtransaction')
						,	addr2: ffline.getValue('shipaddress2', 'fulfillingtransaction')
						,	attention: ffline.getValue('shipattention', 'fulfillingtransaction')
						,	addressee: ffline.getValue('shipaddressee', 'fulfillingtransaction')
					}, self.result);

					self.result.fulfillments[fulfillment_id] = self.result.fulfillments[fulfillment_id] || {
						internalid: fulfillment_id
					,	shipaddress: shipaddress
					,	shipmethod: self.addShippingMethod({
							internalid : ffline.getValue('shipmethod','fulfillingtransaction')
						,	name : ffline.getText('shipmethod','fulfillingtransaction')
						})
					,	date: ffline.getValue('actualshipdate')
					,	trackingnumbers: ffline.getValue('trackingnumbers','fulfillingtransaction') ? ffline.getValue('trackingnumbers','fulfillingtransaction').split('<BR>') : null
					,	lines: []
					,	status: {
								internalid: ffline.getValue('status','fulfillingtransaction')
							,	name: ffline.getText('status','fulfillingtransaction')
						}
					,
					};

					self.result.fulfillments[fulfillment_id].lines.push({
						internalid: line_internalid
					,	quantity: parseInt(ffline.getValue('quantity','fulfillingtransaction'), 10)
					});
				}

				if (line)
				{
					if (line.fulfillmentChoice && line.fulfillmentChoice === 'pickup')
					{
						line.quantityfulfilled = parseInt(ffline.getValue('quantityshiprecv') || 0, 10);
						line.quantitypicked = pick_pack_ship_is_enabled ? parseInt(ffline.getValue('quantitypicked') || 0, 10) - line.quantityfulfilled : 0;
						line.quantitybackordered = line.quantity - line.quantityfulfilled - line.quantitypicked;
					}
					else
					{
						line.quantityfulfilled = parseInt(ffline.getValue('quantityshiprecv') || 0, 10);
						line.quantitypacked = pick_pack_ship_is_enabled ? parseInt(ffline.getValue('quantitypacked') || 0, 10) - line.quantityfulfilled : 0;
						line.quantitypicked = pick_pack_ship_is_enabled ? parseInt(ffline.getValue('quantitypicked') || 0, 10) - line.quantitypacked - line.quantityfulfilled : 0;
						line.quantitybackordered = line.quantity - line.quantityfulfilled - line.quantitypacked - line.quantitypicked;
					}
				}
			});

			this.result.fulfillments = _.values(this.result.fulfillments);
		}

		//@method isReturnable Indicate if the current loaded transaction is returnable or not
		//@return {Boolean}
	,	isReturnable: function ()
		{
			if (this.result.recordtype === 'salesorder')
			{
				var status_id = this.record.getFieldValue('statusRef');

				return status_id !== 'pendingFulfillment' && status_id !== 'pendingApproval' && status_id !== 'closed' && status_id !== 'canceled';
			}
			else
			{
				return true;
			}
		}
	,	getReceipts: function ()
		{
			this.result.receipts = Transaction.list({
				createdfrom: this.result.internalid
			,	types: 'CustInvc,CashSale'
			,	page: 'all'
			});


		}
	,	getReturnAuthorizations: function ()
		{
			var created_from = _(this.result.receipts || []).pluck('internalid');

			created_from.push(this.result.internalid);

			this.result.returnauthorizations = ReturnAuthorization.list({
					createdfrom: created_from
				,	page: 'all'
				,	getLines: true
			});
		}

	,	postGet: function ()
		{
			this.result.lines = _.reject(this.result.lines, function (line)
			{
				return line.quantity === 0;
			});
		}

	,	getPaymentEvent: function ()
		{
			if (this.record.getFieldValue('paymethtype') === 'external_checkout')
			{
			this.result.paymentevent = {
				holdreason: this.record.getFieldValue('paymenteventholdreason')
				,	redirecturl: ExternalPayment.generateUrl(this.result.internalid, this.result.recordtype)
			};
		}
			else
			{
				this.result.paymentevent = { };
			}

		}

	,	update: function (id, data, headers)
		{
			var result = 'OK';

			if (data.status ==='cancelled')
			{

				var url = 'https://' + Application.getHost() + '/app/accounting/transactions/salesordermanager.nl?type=cancel&xml=T&id=' + id
    		   	,	cancel_response = nlapiRequestURL(url, null, headers);

				if (cancel_response.getCode() === 206)
				{
					if (nlapiLookupField('salesorder', id, 'statusRef') !== 'cancelled')
					{
						result = 'ERR_ALREADY_APPROVED_STATUS';
					}
					else
					{
						result = 'ERR_ALREADY_CANCELLED_STATUS';
					}
				}
			}

			return result;
		}

		//@method isCancelable
		//@return {Boolean}
	,	isCancelable: function ()
		{
			return this.result.recordtype === 'salesorder' && this.result.status.internalid === 'pendingApproval';
		}

		//@method getCreatedFrom
		//return {Void}
	,	getCreatedFrom: function ()
		{
			var	fields = ['createdfrom.tranid', 'createdfrom.internalid', 'createdfrom.type']
			,	result = nlapiLookupField(this.recordType, this.recordId, fields);

			if (result)
			{
				//@class Transaction.Model.Get.Result
				//@property {CreatedFrom} createdfrom
				this.result.createdfrom =
				//@class CreatedFrom
				{
					//@property {String} internalid
					internalid: result['createdfrom.internalid']
					//@property {String} name
				,	name: result['createdfrom.tranid']
					//@property {String} recordtype
				,	recordtype: result['createdfrom.type']
				};
			}

		}

	,	getAdjustments: TransactionModelExtensions.getAdjustments

	,	getLines: function ()
		{
			Transaction.getLines.apply(this, arguments);

			if (this.isPickupInStoreEnabled)
			{
				var self = this;

				_.each(this.result.lines, function (line)
				{
					line.location = self.record.getLineItemValue('item', 'location', line.index);

					var item_fulfillment_choice = self.record.getLineItemValue('item', 'itemfulfillmentchoice', line.index);

					if (item_fulfillment_choice === '1')
					{
						line.fulfillmentChoice = 'ship';
					}
					else if (item_fulfillment_choice === '2')
					{
						line.fulfillmentChoice = 'pickup';
					}
				});
			}
		}

	,	getTransactionRecord: function (record_type, id)
		{
			if (this.isPickupInStoreEnabled && record_type === 'salesorder' && SC.Configuration.pickupInStoreSalesOrderCustomFormId)
			{
				return nlapiLoadRecord(record_type, id, {customform: SC.Configuration.pickupInStoreSalesOrderCustomFormId});
			}
			else
			{
				return Transaction.getTransactionRecord.apply(this, arguments);
			}
		}
	,	_addTransactionColumnFieldsToOptions: function (line)
		{
			var self = this;
			var lineFieldsId = self.record.getAllLineItemFields('item');
			_.each(lineFieldsId, function(field){
				if(field.indexOf('custcol') === 0)
				{
					var lineId = line.index;
					var fieldValue = self.record.getLineItemValue('item', field, lineId);
					if(fieldValue !== null)
					{
						var fieldInf = self.record.getLineItemField('item', field, lineId);
						line.options.push(
							self.transactionModelGetLineOptionBuilder(
								field
							,	fieldInf.label
							,	self.transactionModelGetLineOptionValueBuilder(undefined, fieldValue)
							,	fieldInf.mandatory
							)
						);
					}
				}
			});
		}
	});
});
