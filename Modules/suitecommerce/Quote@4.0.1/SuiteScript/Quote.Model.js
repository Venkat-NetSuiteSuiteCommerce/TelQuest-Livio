/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Quote
define(
	'Quote.Model'
,	[
		'Transaction.Model'
	,	'Transaction.Model.Extensions'
	,	'Utils'
	,	'Application'
	,	'underscore'
	]
,	function (
		TransactionModel
	,	TransactionModelExtensions
	,	Utils
	,	Application
	,	_
	)
{
	'use strict';

	var QuoteToSalesOrderValidatorModel;

	try {
		QuoteToSalesOrderValidatorModel = require('QuoteToSalesOrderValidator.Model');
	}
	catch(e)
	{
	}

	// @class Quote.Model Defines the model used by the Quote.Service.ss service
	// @extends Transaction.Model
	return TransactionModel.extend({

		//@property {String} name
		name: 'Quote'

		//@method _isCreatingARecord Internal method used to indicate whether the current operation is a creation or not
		//@return {Boolean}
	,	_isCreatingARecord: function ()
		{
			return this.recordId === 'null';
		}

		//@method getTransactionRecord Load a NetSuite record (transaction)
		//@param {String} record_type
		//@param {String} id
		//@return {nlobjRecord}
	,	getTransactionRecord: function ()
		{
			if (this.record)
			{
				return this.record;
			}

			if (!this._isCreatingARecord())
			{
				return TransactionModel.getTransactionRecord.apply(this, arguments);
			}

			return nlapiCreateRecord('estimate', {
				recordmode: 'dynamic'
			});
		}

		//@method get Returns an Estimate JSON object
		//@return {Quote.Model.Attributes}
		//@class Quote.Model.Attributes @extend Transaction.Model.Get.Result
		//@class Quote.Model

		//@method setExtraRecordFields Override empty base method to add extra values in the estimate
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getExtraRecordFields: function ()
		{
			if (!this._isCreatingARecord())
			{
				this.getEntityStatus();
			}
			//@class Quote.Model.Attributes

			//@property {String} statusRef
			this.result.statusRef = this.record.getFieldValue('statusRef');
			//@property {String} message
			this.result.message = Utils.sanitizeString(this.record.getFieldValue('message'));
			//@property {Boolean} allowToPurchase
			this.result.allowToPurchase = Application.getPermissions().transactions.tranSalesOrd >= 2;
			//@property {Boolean} isOpen
			this.result.isOpen = this.record.getFieldValue('statusRef') === 'open';

			if (!this._isCreatingARecord())
			{
				//@property {QuoteToSalesOrderValidator.Model.Attributes.PurchasableStatus} purchasablestatus
				this.getSalesRep();
				this.result.purchasablestatus = QuoteToSalesOrderValidatorModel ? QuoteToSalesOrderValidatorModel.getQuoteToSalesOrderValidation(this.result) : {};
			}
			else
			{
				this.result.salesrep =
				{
					name: this.record.getFieldText('salesrep')
				,	internalid: this.record.getFieldValue('salesrep')
				};
			}
			this.getDiscountInformation();
			this.getDueDate();

			// @class Quote.Model
		}

		//@method getRecordAddresses Override parent method to load address using real internal id
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getRecordAddresses: function ()
		{
			//@class Transaction.Model.Get.Result
			//@property {Array<Address.Model.Attributes>} addresses
			this.result.addresses = {};
			this.result.listAddresseByIdTmp ={};

			for (var i = 1; i <= this.record.getLineItemCount('iladdrbook') ; i++)
			{
				// Adds all the addresses in the address book
				this.result.listAddresseByIdTmp[this.record.getLineItemValue('iladdrbook', 'iladdrinternalid', i)] = this.addAddress({
					internalid: this.record.getLineItemValue('iladdrbook', 'iladdrinternalid', i)
				,	country: this.record.getLineItemValue('iladdrbook', 'iladdrshipcountry', i)
				,	state: this.record.getLineItemValue('iladdrbook', 'iladdrshipstate', i)
				,	city: this.record.getLineItemValue('iladdrbook', 'iladdrshipcity', i)
				,	zip: this.record.getLineItemValue('iladdrbook', 'iladdrshipzip', i)
				,	addr1: this.record.getLineItemValue('iladdrbook', 'iladdrshipaddr1', i)
				,	addr2: this.record.getLineItemValue('iladdrbook', 'iladdrshipaddr2', i)
				,	attention: this.record.getLineItemValue('iladdrbook', 'iladdrshipattention', i)
				,	addressee: this.record.getLineItemValue('iladdrbook', 'iladdrshipaddressee', i)
				,	phone: this.record.getLineItemValue('iladdrbook', 'iladdrshipphone', i)
				});
			}

			// Adds Shipping Address
			// @property {String} shipaddress Id of the shipping address
			this.result.shipaddress = this.addAddress({
				internalid: this.record.getFieldValue('shipaddresslist')
			,	country: this.record.getFieldValue('shipcountry')
			,	state: this.record.getFieldValue('shipstate')
			,	city: this.record.getFieldValue('shipcity')
			,	zip: this.record.getFieldValue('shipzip')
			,	addr1: this.record.getFieldValue('shipaddr1')
			,	addr2: this.record.getFieldValue('shipaddr2')
			,	attention: this.record.getFieldValue('shipattention')
			,	addressee: this.record.getFieldValue('shipaddressee')
			,	phone:  this.record.getFieldValue('shipphone')
			});

			// Adds Bill Address
			// @property {String} billaddress Id of the billing address
			this.result.billaddress = this.addAddress({
				internalid: this.record.getFieldValue('billaddresslist')
			,	country: this.record.getFieldValue('billcountry')
			,	state: this.record.getFieldValue('billstate')
			,	city: this.record.getFieldValue('billcity')
			,	zip: this.record.getFieldValue('billzip')
			,	addr1: this.record.getFieldValue('billaddr1')
			,	addr2: this.record.getFieldValue('billaddr2')
			,	attention: this.record.getFieldValue('billattention')
			,	addressee: this.record.getFieldValue('billaddressee')
			,	phone: this.record.getFieldValue('billphone')
			});

			// @class Quote.Model
		}

		//@method getAddressInternalId Internal method used to generate the internal id of an address
		//@param {Address.Model.Attributes} address
		//@return  {String}
	,	getAddressInternalId: function (address)
		{
			if (_.isNaN(parseInt(address.internalid, 10)))
			{
				return TransactionModel.getAddressInternalId.apply(this, arguments);
			}

			return address.internalid;
		}

		//@method _getQuoteStatus
		// @param {String} estimate_id
		// @return
	,	_getQuoteStatus: function (estimate_id)
		{
			var estimates = nlapiSearchRecord('estimate', null
			,	[
					['internalid','is', estimate_id]
				,	'and'
				,	['mainline','is','T']]
			,	[new nlobjSearchColumn('entitystatus')]);

			return estimates[0];
		}

		//@method setEntityStatus Set the entity status of the current estimate (Quote)
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getEntityStatus: function ()
		{
			// This is necessary to solve a SuiteScript issue
			var estimate_aux = this._getQuoteStatus(this.record.getId());

			//@class Quote.Model.Attributes

			//@property {Quote.Model.Attributes.EntityStatus} entitystatus
			//@class Quote.Model.Attributes.EntityStatus
			this.result.entitystatus = {
				// @property {String} id
				// id: record.getFieldValue('entitystatus')
				id: estimate_aux.getValue('entitystatus')
				// @property {String} name
			// ,	name: record.getFieldText('entitystatus')
			,	name: estimate_aux.getText('entitystatus')
			};
			// @class Quote.Model
		}

		//@method getDiscountInformation Get the discount information of the current estimate
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getDiscountInformation: function ()
		{
			//@class Quote.Model.Attributes

			//@property {Quote.Model.Attributes.Discount?} discount
			this.result.discount = this.record.getFieldValue('discountitem') ?
			//@class Quote.Model.Attributes.Discount
			{
				//@property {String} internalid
				internalid: this.record.getFieldValue('discountitem')
				//@property {String} name
			,	name: this.record.getFieldText('discountitem')
				//@property {String} rate
			,	rate: this.record.getFieldValue('discountrate')
			} : null;

			// @class Quote.Model
		}

		//@method getDueDate Get all date related field of the current estimate
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getDueDate: function ()
		{
			//@class Quote.Model.Attributes
			var	duedate = this.record.getFieldValue('duedate')
			,	now = new Date().getTime();

			//@property {String} duedate
			this.result.duedate = duedate;
			//@property {Boolean} isOverdue
			this.result.isOverdue = this.isDateInterval(new Date(nlapiStringToDate(duedate)).getTime() - now);
			//@property {Boolean} isCloseOverdue
			this.result.isCloseOverdue = this.isDateInterval(new Date(nlapiStringToDate(duedate)).getTime() - (now + this.getDaysBeforeExpiration()));
			//@property {String} expectedclosedate
			this.result.expectedclosedate = this.record.getFieldValue('expectedclosedate');

			// @class Quote.Model
			}

		//@method list
		//@param {Transaction.Model.List.Parameters} data
		//@return {Quote.Model.List.Result}

		//@class Quote.Model.List.Result @extend Transaction.Model.List.Result
		//@class Quote.Model

		//@method setExtraListColumns Overwritten method to add extra columns (due date, expected close date, entity status, and total)
		//@return {Void}
	,	setExtraListColumns: function ()
		{
			this.columns.duedate = new nlobjSearchColumn('duedate');
			this.columns.expectedclosedate = new nlobjSearchColumn('expectedclosedate');
			this.columns.entitystatus = new nlobjSearchColumn('entitystatus');
			this.columns.total = new nlobjSearchColumn('total');
		}

		//@method setExtraListFilters Overwritten method to add extra filter of the list (entity status filter)
		// @return {Void}
	,	setExtraListFilters: function ()
		{
			if (this.data.filter && this.data.filter !== 'ALL')
			{
				this.filters.entitystatus_operator = 'and';
		 		this.filters.entitystatus = ['entitystatus', 'is', this.data.filter];
			}
		}

		// @method mapListResult overrides method from Transaction.Model
		// We are able to apply any custom extension over each record returned
		// @param {Transaction.Model.List.Result.Record} result Base result to be extended
		// @param {nlobjSearchResult} record Instance of the record returned by NetSuite search
		// @return {Transaction.Model.List.Result.Record}
	,	mapListResult: function (result, record)
		{
			var duedate = record.getValue('duedate')
			,	now = new Date().getTime();

			// @class Quote.Model.List.Result.Record @extend Transaction.Model.List.Result.Record
			// @property {String} duedate
			result.duedate = duedate;
			// @property {Boolean} isOverdue
			result.isOverdue = this.isDateInterval(new Date(nlapiStringToDate(duedate)).getTime() - now);
			// @property {Boolean} isCloseOverdue
			result.isCloseOverdue = this.isDateInterval(new Date(nlapiStringToDate(duedate)).getTime() - (now + this.getDaysBeforeExpiration()));
			// @property {String} expectedclosedate
			result.expectedclosedate = record.getValue('expectedclosedate');
			// @property {Quote.Model.Attributes.EntityStatus} entitystatus
			result.entitystatus = {
				id: record.getValue('entitystatus')
			,	name: record.getText('entitystatus')
			};
			// @property {Number} total
			result.total = Utils.toCurrency(record.getValue('total'));
			// @property {String} total_formatted
			result.total_formatted = Utils.formatCurrency(record.getValue('total'));

			return result;
			// @class Quote.Model
		}

		//@method isDateInterval
		//@param {Number} date
		//@return {Boolean}
	,	isDateInterval: function (date)
		{
			return date <= 0 && ((-1 * date) / 1000 / 60 / 60 / 24) >= 1;
		}

		//@method getDaysBeforeExpiration
		//return {Number}
	,	getDaysBeforeExpiration: function ()
		{
			return SC.Configuration.quote.daysToExpire*24*60*60*1000;
		}

		//@method getSalesRepFromId This method does NOT depend on this.record and this.result
		//@param {String} quote_id
		//@return {Quote.Model.Get.SalesRepresentative}
	,	getSalesRepFromId: function (quote_id)
		{
			var salesrep = {};

			var search_result = nlapiLookupField(
				'estimate'
			,	quote_id
			,	['salesrep.phone', 'salesrep.email', 'salesrep.entityid', 'salesrep.mobilephone', 'salesrep.fax', 'salesrep']
			);

			if (search_result)
			{
				//@class Quote.Model.Get.SalesRepresentative
				//@property {String?} phone
				salesrep.phone = search_result['salesrep.phone'];
				//@property {String} email
				salesrep.email = search_result['salesrep.email'];
				//@property {String} fullname
				salesrep.fullname = search_result['salesrep.entityid'];
				//@property {String} name
				salesrep.name = search_result['salesrep.entityid'];
				//@property {String?} mobilephone
				salesrep.mobilephone = search_result['salesrep.mobilephone'];
				//@property {String} fax
				salesrep.fax = search_result['salesrep.fax'];
				//@property {String} internalid
				salesrep.internalid = search_result.salesrep;
			}

			return salesrep;

			// @class Quote.Model
		}

		//@method postSubmitRecord Overwritten method used to extend the confirmation submission result
		//@param {Transaction.Model.Confirmation} confirmation_result
		//@return {Quote.Model.Confirmation}
	,	postSubmitRecord: function (confirmation_result)
		{
			var created_salesorder = nlapiLookupField('estimate', confirmation_result.internalid, ['tranid']) || {};

			//@class Quote.Model.Confirmation @extend Transaction.Model.Confirmation
			confirmation_result.tranid = created_salesorder.tranid;
			confirmation_result.salesrep = this.getSalesRepFromId(confirmation_result.internalid);
			confirmation_result.confirmationnumber = created_salesorder.tranid;
			// @class Quote.Model

			return confirmation_result;
		}

	,	getSalesRep: TransactionModelExtensions.getSalesRep
	});
});

//@class Quote.Model.List.Result @extend Transaction.Model.List.Result
//@property {Array<Quote.Model.List.Result.Record>} records