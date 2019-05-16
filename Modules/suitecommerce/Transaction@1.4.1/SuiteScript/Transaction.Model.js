/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Transaction

define(
	'Transaction.Model'
,	[
		'SC.Model'
	,	'SC.Models.Init'
	,	'Application'
	,	'Utils'
	,	'underscore'
	,	'CustomFields.Utils'
	]
,	function (
		SCModel
	,	ModelsInit
	,	Application
	,	Utils
	,	_
	,	CustomFieldsUtils
	)
{
	'use strict';

	var StoreItem
	,	AddressModel;

	try
	{
		StoreItem = require('StoreItem.Model');
	}
	catch(e)
	{
	}

	try
	{
		AddressModel = require('Address.Model');
	}
	catch(e)
	{
	}

	// @class Transaction.Model Defines the base model used by all transactions providing a base implementation with common features
	// @extends SCModel
	return SCModel.extend({
		//@property {String} name
		name: 'Transaction'

		//@property {StoreItem.Model} storeItem
	,	storeItem: StoreItem

		//@property {Boolean} isMultiCurrency
	,	isMultiCurrency: ModelsInit.context.getFeature('MULTICURRENCY')

		//@property {Boolean} isMultiSite
	,	isMultiSite: ModelsInit.context.getFeature('MULTISITE')

		//@property {Number} now Now in milliseconds
	,	now: new Date().getTime()

		//@method list Allow search among transactions
		//@param {Transaction.Model.List.Parameters} data
		//@return {Transaction.Model.List.Result}
	,	list: function (data)
		{

			this.preList();

			var self = this;

			this.data = data;

			this.amountField = this.isMultiCurrency ? 'fxamount' : 'amount';

			this.filters = {
					'entity': ['entity', 'is', nlapiGetUser()]
				,	'mainline_operator': 'and'
				,	'mainline': ['mainline','is', 'T']
			};

			this.columns = {
					'trandate': new nlobjSearchColumn('trandate')
				,	'internalid': new nlobjSearchColumn('internalid')
				,	'tranid': new nlobjSearchColumn('tranid')
				,	'status': new nlobjSearchColumn('status')
				,	'amount': new nlobjSearchColumn(this.amountField)
				};

			if (this.isMultiCurrency)
			{
				this.columns.currency = new nlobjSearchColumn('currency');
			}

			if (this.data.from && this.data.to)
			{
				this.filters.date_operator = 'and';

				this.data.from = this.data.from.split('-');
				this.data.to = this.data.to.split('-');

				this.filters.date = [
					'trandate', 'within'
				,	new Date(
						this.data.from[0]
					,	this.data.from[1]-1
					,	this.data.from[2]
					)
				,	new Date(
						this.data.to[0]
					,	this.data.to[1]-1
					,	this.data.to[2]
					)
				];
			}
			else if (this.data.from)
			{
				this.filters.date_from_operator = 'and';

				this.data.from = this.data.from.split('-');

				this.filters.date_from = [
					'trandate'
				,	'onOrAfter'
				,	new Date(
						this.data.from[0]
					,	this.data.from[1]-1
					,	this.data.from[2]
					)
				];
			}
			else if (this.data.to)
			{
				this.filters.date_to_operator = 'and';

				this.data.to = this.data.to.split('-');

				this.filters.date_to = [
					'trandate'
				,	'onOrBefore'
				,	new Date(
						this.data.to[0]
					,	this.data.to[1]-1
					,	this.data.to[2]
					)
				];
			}

			if (this.data.internalid)
			{
				this.data.internalid  = _.isArray(this.data.internalid) ? this.data.internalid : this.data.internalid.split(',');
				this.filters.internalid_operator = 'and';
				this.filters.internalid  =  ['internalid', 'anyof', this.data.internalid];
			}

			if (this.data.createdfrom)
			{
				this.filters.createdfrom_operator = 'and';
				this.filters.createdfrom = ['createdfrom', 'is', this.data.createdfrom];
			}

	 		if (this.data.types)
	 		{
	 			this.filters.types_operator = 'and';
	 			this.filters.types = ['type', 'anyof', this.data.types.split(',')];
	 		}

	 		if (this.isMultiSite)
			{

				var site_id = ModelsInit.session.getSiteSettings(['siteid']).siteid
				,	filter_site = SC.Configuration.filterSite || SC.Configuration.filter_site
				,	search_filter_array = null;

				if (_.isString(filter_site) && filter_site === 'current')
				{
					search_filter_array = [site_id, '@NONE@'];
				}
				else if (_.isString(filter_site) && filter_site === 'all')
				{
					search_filter_array = [];
				}
				else if (_.isArray(filter_site))
				{
					search_filter_array = filter_site;
					search_filter_array.push('@NONE@');
				}
				else if (_.isObject(filter_site) && filter_site.option)
				{
					switch (filter_site.option)
					{
						case 'all' :
							search_filter_array = [];
							break;
						case 'siteIds' :
							search_filter_array = filter_site.ids;
							break;
						default : //case 'current' (current site) is configuration default
							search_filter_array = [site_id, '@NONE@'];
							break;
					}
				}

				if (search_filter_array && search_filter_array.length)
				{
					this.filters.site_operator = 'and';
					this.filters.site = ['website', 'anyof', _.uniq(search_filter_array)];
				}
			}

			this.setExtraListFilters();

			this.setExtraListColumns();

			if (this.data.sort)
			{
				_.each(this.data.sort.split(','), function (column_name)
				{
					if (self.columns[column_name])
					{
						self.columns[column_name].setSort(self.data.order >= 0);
					}
				});
			}

			if (this.data.page === 'all')
			{
				this.search_results = Application.getAllSearchResults('transaction', _.values(this.filters), _.values(this.columns));
			}
			else
			{
				this.search_results = Application.getPaginatedSearchResults({
					record_type: 'transaction'
				,	filters: _.values(this.filters)
				,	columns: _.values(this.columns)
				,	page: this.data.page || 1
				,	results_per_page : this.data.results_per_page
				});
			}

			var records = _.map((this.data.page === 'all' ? this.search_results : this.search_results.records) || [], function (record)
			{
				//@class Transaction.Model.List.Result.Record
				var result = {
					//@property {String} recordtype
					recordtype: record.getRecordType()
					//@property {String} internalid
				,	internalid: record.getValue('internalid')
					//@property {String} tranid
				,	tranid: record.getValue('tranid')
					//@property {String} trandate
				,	trandate: record.getValue('trandate')
					//@property {Transaction.Status} status
				,	status: {
						//@class Transaction.Status
						//@property {String} internalid
						internalid: record.getValue('status')
						//@property {String} name
					,	name: record.getText('status')
					}
					//@class Transaction.Model.List.Result.Record
					//@property {Number} amount
				,	amount: Utils.toCurrency(record.getValue(self.amountField))
					//@property {Strung} amount_formatted
				,	amount_formatted: Utils.formatCurrency(record.getValue(self.amountField))
					//@property {Currency?} currency
				,	currency: self.isMultiCurrency ?
					//@class Currency
					{
						//@property {String} internalid
						internalid: record.getValue('currency')
						//@property {String} name
					,	name: record.getText('currency')
					} : null
				};

				return self.mapListResult(result, record);

			});

			if (this.data.page === 'all')
			{
				this.results = records;
			}
			else
			{
				this.results = this.search_results;
				this.results.records = records;
			}

			this.postList();

			return this.results;
			// @class Transaction.Model
		}
		//@method setExtraListColumns Abstract method used to be overridden by child classes.
		// The aim of this method is set extra column called by the list method. The list of all column is in the 'columns' property of 'this'
		// @return {Void}
	,	setExtraListColumns: function ()
		{ }

		//@method setExtraListFilters Abstract method used to be overridden by child classes.
		// The aim of this method is set extra filters called by the list method. The list of all column is in the 'filters' property of 'this'
		// @return {Void}
	,	setExtraListFilters: function ()
		{ }

		//@method mapListResult Abstract method used to be overridden by child classes.
		// The aim of this method is apply any custom extension over each record to be returned by the list method
		// @param {Transaction.Model.List.Result.Record} result Base result to be extended
		// @param {nlobjSearchResult} record Instance of the record returned by NetSuite search
		// @return {Transaction.Model.List.Result.Record}
	,	mapListResult: function (result)
		{
			return result;
		}

		//@method getTransactionRecord Load a NetSuite record (transaction)
		//@param {String} record_type
		//@param {String} id
		//@return {nlobjRecord}
	,	getTransactionRecord: function (record_type, id)
		{
			if (this.record)
			{
				return this.record;
			}
			return nlapiLoadRecord(record_type, id);
		}

		//@method get Return one single transaction
		//@param {String} record_type
		//@param {String} id
		//@return {Transaction.Model.Get.Result}
	,	get: function (record_type, id)
		{
			this.preGet();

			this.recordId = id;
			this.recordType = record_type;

			//@class Transaction.Model.Get.Result
			this.result = {};

			if (record_type && id)
			{
				this.record = this.getTransactionRecord(record_type, id);

				this.getRecordFields();

				this.getRecordSummary();

				this.getRecordPromocodes();

				this.getRecordPaymentMethod();

				this.getPurchaseOrderNumber();

				this.getRecordAddresses();

				this.getRecordShippingMethods();

				this.getLines();

				this.getExtraRecordFields();

				this.getTransactionBodyCustomFields();
			}

			this.postGet();

			// convert the objects to arrays
			this.result.addresses = _.values(this.result.addresses || {});
			this.result.shipmethods = _.values(this.result.shipmethods || {});
			this.result.lines = _.values(this.result.lines || {});

			return this.result;

			// @class Transaction.Model
		}

		//@method getRecordFields Get the main (and simple) field of the transaction
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getRecordFields: function ()
		{
			//@class Transaction.Model.Get.Result
			//@property {String} internalid
			this.result.internalid = this.recordId;
			//@property {String} recordtype
			this.result.recordtype = this.recordType;

			//@property {String} tranid
			this.result.tranid = this.record.getFieldValue('tranid');
			//@property {String} memo
			this.result.memo = this.record.getFieldValue('memo');
			//@property {String} trandate
			this.result.trandate = this.record.getFieldValue('trandate');

			if (this.isMultiCurrency)
			{
				//@property {Currency?} currency
				this.result.currency = {
					internalid: this.record.getFieldValue('currency')
				,	name: this.record.getFieldValue('currencyname')
				};
			}

			this.getCreatedFrom();
			this.getStatus();
		}

		//@method getCreatedFrom Get the created from field for a single retrieved record
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getCreatedFrom: function ()
		{
			// The createdfrom is being loaded using a Lookup field operation instead of loading it from the current record (this.record)
			// This is done like this to solve an issue
			var created_from_internalid = this.record.getFieldValue('createdfrom')
			,	record_type = '';

			if (created_from_internalid)
			{
				record_type = Utils.getTransactionType(created_from_internalid);
			}

			//@class Transaction.Model.Get.Result
			//@property {CreatedFrom} createdfrom
			this.result.createdfrom =
			//@class CreatedFrom
			{
				//@property {String} internalid
				internalid: created_from_internalid
				//@property {String} name
			,	name: this.record.getFieldText('createdfrom')
				//@property {String} recordtype
			,	recordtype: record_type || ''
			};
			//@class Transaction.Model
		}

		//@method getStatus Get the status field for a single retrieved record
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getStatus: function ()
		{
			// The status is being loaded using a Lookup field operation instead of loading it from the current record (this.record)
			// This is done like this to solve an issue

			//@class Transaction.Model.Get.Result
			//@property {Transaction.Model.Get.Status} Status
			this.result.status =
			//@class Transaction.Model.Get.Status
			{
				//@property {String} internalid
				internalid: this.record.getFieldValue('status')
				//@property {String} name
			,	name: this.record.getFieldText('status')
			};
			// @class Transaction.Model
		}

		//@method getExtraRecordFields Overridable method used to add extra field in the final result of the get method
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getExtraRecordFields: function () { }

		//@method setTransactionBodyCustomFields Set in the model the value of options (custom fields)
		//@return {Void}
	,	setTransactionBodyCustomFields: function()
		{
			var self = this;
			var customFieldsId = CustomFieldsUtils.getCustomFieldsIdToBeExposed(this.recordType);

			_.each(this.data.options, function(value, id)
			{
				//only set a custom field to the model if was exposed in the configuration
				if(_.find(customFieldsId, function (configFieldId) { return id === configFieldId;}))
				{
					self.record.setFieldValue(id, value);
				}
			});
		}
		//@method getTransactionBodyCustomFields Set in the result object the value of custom fields
		//@return {Void}
	,	getTransactionBodyCustomFields: function ()
		{
			var options = {};
			var self = this;
			var customFieldsId = CustomFieldsUtils.getCustomFieldsIdToBeExposed(this.recordType);
			_.each(customFieldsId, function(id)
			{
				options[id] = self.record.getFieldValue(id);
			});

			this.result.options = options;
		}

		//@method getRecordPromocodes Get the promocodes information into the get result
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getRecordPromocodes: function ()
		{
			//@class Transaction.Model.Get.Result
			//@property {Array<Transaction.Model.Get.Promocode>} promocodes
			this.result.promocodes = [];

			var promocode = this.record.getFieldValue('promocode');

			//If legacy behavior is present & a promocode is applied this IF will be true
			//In case stackable promotions are enable this.record.getFieldValue('promocode') returns null
			if (promocode)
			{
				this.result.promocodes.push({
					internalid: promocode
				,	code: this.record.getFieldText('couponcode')
				,	isvalid: true
				,	discountrate_formatted: ''
				});
			}
			//otherwise we change for the list of stackable promotions. If it is the legacy (not stackable promotions) code, the
			//this.record.getLineItemCount('promotions') will return 0
			for (var i = 1; i <= this.record.getLineItemCount('promotions'); i++)
			{
				if(this.record.getLineItemValue('promotions', 'applicabilitystatus', i) !== 'NOT_APPLIED'){
				this.result.promocodes.push({
				//@class Transaction.Model.Get.Promocode
					//@property {String} internalid
					internalid: this.record.getLineItemValue('promotions', 'couponcode', i)
					//@property {String} code
				,	code: this.record.getLineItemValue('promotions', 'couponcode_display', i)
					//@property {Boolean} isvalid
				,	isvalid: this.record.getLineItemValue('promotions', 'promotionisvalid', i) === 'T'
					//@property {String} discountrate_formatted
				,	discountrate_formatted: ''
				});
			}
			}

			// @class Transaction.Model
		}

		//@method getTerms Get the terms in the current Transaction
		//@return {Transaction.Model.Get.PaymentMethod.Terms?}
	,	getTerms: function ()
		{
			if (this.record.getFieldValue('terms'))
			{
				//@class Transaction.Model.Get.PaymentMethod.Terms
				return {
					//@property {String} internalid
					internalid: this.record.getFieldValue('terms')
					//@property {String} name
				,	name: this.record.getFieldText('terms')
				};
			}

			return null;
			// @class Transaction.Model
		}

	,	getPurchaseOrderNumber: function()
		{
			//@property {String?} purchasenumber This value is present only of the type is invoice
			this.result.purchasenumber = this.record.getFieldValue('otherrefnum');

		}

		//@method getRecordPaymentMethod Get the payment methods used in the current Transaction
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getRecordPaymentMethod: function ()
		{
			//@class Transaction.Model.Get.PaymentMethod
			var paymentmethod = {
					//@property {String} type Possible values: 'creditcard', 'invoice', 'paypal'
					type: this.record.getFieldValue('paymethtype')
					//@property {Boolean} primary
				,	primary: true
					//@property {String} name
				,	name: this.record.getFieldText('paymentmethod')

				}

			,	terms = this.getTerms()

			,	ccnumber = this.record.getFieldValue('ccnumber');

			if (ccnumber)
			{
				paymentmethod.type = 'creditcard';
				//@property {Transaction.Model.Get.PaymentMethod.CreditCard?} creditcard This value is present only if the type is creditcard
				paymentmethod.creditcard =
				//@class Transaction.Model.Get.PaymentMethod.CreditCard
				{
					//@property {String} ccnumber
					ccnumber: ccnumber
					//@property {String} ccexpiredate
				,	ccexpiredate: this.record.getFieldValue('ccexpiredate')
					//@property {String} ccname
				,	ccname: this.record.getFieldValue('ccname')
					//@property {String} internalid
				,	internalid:  this.record.getFieldValue('creditcard')
					//@property {Transaction.Model.Get.PaymentMethod.CreditCard.Details} paymentmethod
				,	paymentmethod: {
					//@class Transaction.Model.Get.PaymentMethod.CreditCard.Details
						//@property {String} ispaypal
						ispaypal: 'F'
						//@property {String} name
					,	name: this.record.getFieldText('paymentmethod')
						//@property {String} creditcard Value: 'T'
					,	creditcard: 'T'
						//@property {String} internalid
					,	internalid: this.record.getFieldValue('paymentmethod')
					}
				};
			}

			if (terms)
			{
				paymentmethod.type = 'invoice';

				//@property {Transaction.Model.Get.PaymentMethod.Terms} paymentterms This value is present only of the type is invoice
				paymentmethod.paymentterms = terms;
			}

			//@class Transaction.Model.Get.Result
			//@property {Array<Transaction.Model.Get.PaymentMethod>} paymentmethods
			if (paymentmethod.type)
			{
				this.result.paymentmethods = [paymentmethod];
			}
			else
			{
				this.result.paymentmethods = [];
			}

			// @class Transaction.Model
		}

		//@method getRecordSummary Get the summary of the current transaction model
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getRecordSummary: function ()
		{
			//@class Transaction.Model.Get.Result
			//@property {Transaction.Model.Get.Summary} summary
			this.result.summary =
			//@class Transaction.Model.Get.Summary
			{
				//@property {Number} subtotal
				subtotal: Utils.toCurrency(this.record.getFieldValue('subtotal'))
				//@property {String} subtotal_formatted
			,	subtotal_formatted: Utils.formatCurrency(this.record.getFieldValue('subtotal'))

				//@property {Number} taxtotal
			,	taxtotal: Utils.toCurrency(this.record.getFieldValue('taxtotal'))
				//@property {String} taxtotal_formatted
			,	taxtotal_formatted: Utils.formatCurrency(this.record.getFieldValue('taxtotal'))

				//@property {Number} tax2total
			,	tax2total: Utils.toCurrency(this.record.getFieldValue('tax2total'))
				//@property {String} tax2total_formatted
			,	tax2total_formatted: Utils.formatCurrency(this.record.getFieldValue('tax2total'))

				//@property {Number} shippingcost
			,	shippingcost: Utils.toCurrency(this.record.getFieldValue('shippingcost'))
				//@property {String} shippingcost_formatted
			,	shippingcost_formatted: Utils.formatCurrency(this.record.getFieldValue('shippingcost'))

				//@property {Number} handlingcost
			,	handlingcost: Utils.toCurrency(this.record.getFieldValue('althandlingcost'))
				//@property {String} handlingcost_formatted
			,	handlingcost_formatted: Utils.formatCurrency(this.record.getFieldValue('althandlingcost'))

				//@property {Number} estimatedshipping
			,	estimatedshipping: 0
				//@property {String} estimatedshipping_formatted
			,	estimatedshipping_formatted: Utils.formatCurrency(0)

				//@property {Number} taxonshipping
			,	taxonshipping: Utils.toCurrency(0)
				//@property {String} taxonshipping_formatted
			,	taxonshipping_formatted: Utils.formatCurrency(0)

				//@property {Number} discounttotal
			,	discounttotal: Utils.toCurrency(this.record.getFieldValue('discounttotal'))
				//@property {String} discounttotal_formatted
			,	discounttotal_formatted: Utils.formatCurrency(this.record.getFieldValue('discounttotal'))

				//@property {Number} taxondiscount
			,	taxondiscount: Utils.toCurrency(0)
				//@property {String} taxondiscount_formatted
			,	taxondiscount_formatted: Utils.formatCurrency(0)

				//@property {Number} discountrate
			,	discountrate: Utils.toCurrency(this.record.getFieldValue('discountrate'))
				//@property {String} discountrate_formatted
			,	discountrate_formatted: Utils.formatCurrency(this.record.getFieldValue('discountrate'))

				//@property {Number} discountedsubtotal
			,	discountedsubtotal: Utils.toCurrency(0)
				//@property {String} discountedsubtotal_formatted
			,	discountedsubtotal_formatted: Utils.formatCurrency(0)

				//@property {Number} giftcertapplied
			,	giftcertapplied: Utils.toCurrency(this.record.getFieldValue('giftcertapplied'))
				//@property {String} giftcertapplied_formatted
			,	giftcertapplied_formatted: Utils.formatCurrency(this.record.getFieldValue('giftcertapplied'))

				//@property {Number} total
			,	total: Utils.toCurrency(this.record.getFieldValue('total'))
				//@property {String} total_formatted
			,	total_formatted: Utils.formatCurrency(this.record.getFieldValue('total'))
			};

			// @class Transaction.Model
		}


		//@method add the transaction column fields to the options array, only avaible on orderhistory at the moment
		//@param  {Transaction.Model.Get.Line} Line
		//@return {Void}
		//@private
	,	_addTransactionColumnFieldsToOptions: function () {}

		//@method getLines Get the lines (and its item) to the current transaction
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getLines: function ()
		{
			//@class Transaction.Model.Get.Result
			//@property {Array<Transaction.Model.Get.Line>} lines
			this.result.lines = {};

			var items_to_preload = []
			,	amount
			,	self = this
			,	line_id;

			for (var i = 1; i <= this.record.getLineItemCount('item'); i++)
			{
				if (this.record.getLineItemValue('item', 'itemtype', i) === 'Discount' && this.record.getLineItemValue('item', 'discline', i))
				{
					var discline = this.record.getLineItemValue('item', 'discline', i);

					line_id = self.result.internalid + '_' + discline;
					amount = Math.abs(parseFloat(this.record.getLineItemValue('item', 'amount', i)));

					this.result.lines[line_id].discount = (this.result.lines[line_id].discount) ? this.result.lines[line_id].discount + amount : amount;
					this.result.lines[line_id].total = this.result.lines[line_id].amount + this.result.lines[line_id].tax_amount - this.result.lines[line_id].discount;
					this.result.lines[line_id].discount_name = this.record.getLineItemValue('item', 'item_display', i);
				}
				else
				{
					var rate = Utils.toCurrency(this.record.getLineItemValue('item', 'rate', i))
					,	item_id = this.record.getLineItemValue('item', 'item', i)
					,	item_type = this.record.getLineItemValue('item', 'itemtype', i);

					amount = Utils.toCurrency(this.record.getLineItemValue('item', 'amount', i));

					var	tax_amount = Utils.toCurrency(this.record.getLineItemValue('item', 'tax1amt', i)) || 0
					,	total = amount + tax_amount;

					line_id = this.record.getLineItemValue('item', 'id', i);

					//@class Transaction.Model.Get.Line
					this.result.lines[line_id] = {
						//@property {String} internalid
						internalid: line_id
						//@property {Number} quantity
					,	quantity: parseInt(this.record.getLineItemValue('item', 'quantity', i), 10)
						//@property {Number} rate
					,	rate: rate
						//@property {Number} amount
					,	amount: amount
						//@property {Number} tax_amount
					,	tax_amount: tax_amount
						//@property {Number} tax_rate
					,	tax_rate: this.record.getLineItemValue('item', 'taxrate1', i)
						//@property {String} tax_code
					,	tax_code: this.record.getLineItemValue('item', 'taxcode_display', i)
						//@property {Boolean} isfulfillable
					,	isfulfillable: this.record.getLineItemValue('item', 'fulfillable', i) === 'T'
						//@property {String} location
					,	location: this.record.getLineItemValue('item', 'location', i)
						//@property {Number} discount
					,	discount: 0
						//@property {Number} total
					,	total: total
						//@property {Item} item
					,	item: item_id
						//@property {String} type
					,	type: item_type
						//@property {Object} options
					,	options: self.parseLineOptions(this.record.getLineItemValue('item', 'options', i))
						//@property {String} shipaddress
					,	shipaddress: this.record.getLineItemValue('item', 'shipaddress', i) ? this.result.listAddresseByIdTmp[this.record.getLineItemValue('item', 'shipaddress', i)] : null
						//@property {String} shipmethod
					,	shipmethod:  this.record.getLineItemValue('item', 'shipmethod', i) || null
						//@property {Number} index
					,	index: i
					};

					//@class Transaction.Model.PreLoadItemData
					items_to_preload[item_id] = {
						//@property {String} id
						id: item_id
						//@property {String} type
					,	type: item_type
					};
					//@class Transaction.Model

					self.getExtraLineFields(this.result.lines[line_id], this.record, i);
				}
			}

			var preloaded_items = this.preLoadItems(_.values(items_to_preload));

			_.each(this.result.lines, function (line)
			{
				line.rate_formatted = Utils.formatCurrency(line.rate);
				line.amount_formatted = Utils.formatCurrency(line.amount);
				line.tax_amount_formatted = Utils.formatCurrency(line.tax_amount);
				line.discount_formatted = Utils.formatCurrency(line.discount);
				line.total_formatted = Utils.formatCurrency(line.total);

				line.item = preloaded_items[line.item] || { itemid: line.item };

				self._addTransactionColumnFieldsToOptions(line);
			});

			// remove the temporary address list by id
			delete this.result.listAddresseByIdTmp;

			// @class Transaction.Model
		}

		//@method parseLineOptions Parse an item string options into objects
		//@param {String} options_string
		//@return {Array<Transaction.Model.Get.Line.Option>}
	,	parseLineOptions: function parseLineOptions (options_string)
		{
			var self = this;
			var options_object = [];

			if (options_string && options_string !== '- None -')
			{
				var split_char_3 = String.fromCharCode(3)
				,	split_char_4 = String.fromCharCode(4);

				_.each(options_string.split(split_char_4), function (option_line)
				{
					option_line = option_line.split(split_char_3);
					options_object.push(
						self.transactionModelGetLineOptionBuilder(
							option_line[0]
						,	option_line[2]
						,	self.transactionModelGetLineOptionValueBuilder(option_line[4], option_line[3])
						,	option_line[1]	=== 'T'
						)
					);
				});
			}
			//@class Transaction.Model

			return options_object;
		}
		//@method transactionModelGetLineOptionBuilder Build a Transaction.Model.Get.Line.Option object
		//@private
		//@param {String} internalId
		//@param {String} label
		//@param {Transaction.Model.Get.Line.Option.Value} value
		//@param {Boolean} mandatory
		//@return {Transaction.Model.Get.Line.Option}
	,	transactionModelGetLineOptionBuilder: function(internalId, label, value, mandatory)
		{
			//@class Transaction.Model.Get.Line.Option
			return {
				//@property {String} internalid
				cartOptionId: internalId.toLowerCase()
				//@property {String} label
			,	label: label
				//@property {Transaction.Model.Get.Line.Option.Value} value
			,	value: value
				//@property {Boolean} mandatory
			,	ismandatory: mandatory || false
			};
		}
		//@method transactionModelGetLineOptionValueBuilder Build a Transaction.Model.Get.Line.Option.Value
		//@private
		//@param {String} label
		//@param {String} internalId
		//@return {Transaction.Model.Get.Line.Option.Value}
	,	transactionModelGetLineOptionValueBuilder: function(label, internalId)
		{
			//@class Transaction.Model.Get.Line.Option.Value
			return {
				//@property {String} label
				label: label
				//@property {String} internalid
			,	internalid: internalId
			};
		}
		//@method preLoadItems Preload Items
		//@param {Array<Transaction.Model.PreLoadItemData>} items_to_preload
		//@return {PreloadedItems}
	,	preLoadItems: function (items_to_preload)
		{
			//@class PreloadedItems
			//In this class each property is the id of an item and each property's value if the item itself

			//@class Transaction.Model

			return this.storeItem ?
				this.loadItemsWithStoreItem(items_to_preload) :
				this.loadItemsWithSuiteScript(items_to_preload);
		}

		//@method loadItemsWithStoreItem Preload a group of items the StoreItem (Commerce API)
		//@param {Array<Transaction.Model.PreLoadItemData>} items_to_preload
		//@return {PreloadedItems}
	,	loadItemsWithStoreItem: function (items_to_preload)
		{
			var result = {}
			,	self = this
			,	items_to_query = []
			,	inactive_item = {};

			// Preloads info about the item
			this.storeItem.preloadItems(items_to_preload);

			// The API wont bring disabled items so we need to query them directly
			_.each(this.result.lines, function (line)
			{
				if (line.item)
				{
					var item = self.storeItem.get(line.item, line.type);

					if (!item || _.isUndefined(item.itemid))
					{
						items_to_query.push({id: line.item});
					}
					else
					{
						result[line.item] = item;
					}
				}
			});

			inactive_item = this.loadItemsWithSuiteScript(items_to_query);
			_.each(inactive_item, function (value, key)
			{
				result[key] = value;
			});

			return result;
		}

		//@method loadItemsWithSuiteScript Preload a group of items using SuiteScript
		//@param {Array<Transaction.Model.PreLoadItemData>} items_to_query
		//@return {PreloadedItems}
	,	loadItemsWithSuiteScript: function (items_to_query)
		{
			var result = {};

			if (items_to_query.length > 0)
			{
				items_to_query = _.pluck(items_to_query, 'id');

				var filters = [
						new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
					,	new nlobjSearchFilter('internalid', null, 'is', this.result.internalid)
					,	new nlobjSearchFilter('internalid', 'item', 'anyof', items_to_query)
					]

				,	columns = [
						new nlobjSearchColumn('internalid', 'item')
					,	new nlobjSearchColumn('type', 'item')
					,	new nlobjSearchColumn('parent', 'item')
					,	new nlobjSearchColumn('displayname', 'item')
					,	new nlobjSearchColumn('storedisplayname', 'item')
					,	new nlobjSearchColumn('itemid', 'item')
					]

				,	inactive_items_search = Application.getAllSearchResults('transaction', filters, columns)
				,	loaded_item;

				_.each(inactive_items_search, function (item)
				{
					loaded_item = {
						internalid: item.getValue('internalid', 'item')
					,	itemtype: item.getValue('type', 'item')
					,	displayname: item.getValue('displayname', 'item')
					,	storedisplayname: item.getValue('storedisplayname', 'item')
					,	itemid: item.getValue('itemid', 'item')
					};

					result[item.getValue('internalid', 'item')] = loaded_item;
				});
			}
			return result;
		}

		//@method getExtraLineFields Set extra projected field on items when retrieving a single record's lines
		//@param {Transaction.Model.Get.Line} result Result being generated
		//@param {nlobjRecord} record Record to extract fields from
		//@param {Number} i Index of the item in the current record being retrieved
		//@return {Void} This method does not return anything as it works with the parameters passed in
	,	getExtraLineFields: function ()
		{
		}

		//@method getRecordShippingMethods Get the shipping methods of the current transaction
		//@return {Void} This method does not return anything as it works with the value of this.result and this.record
	,	getRecordShippingMethods: function ()
		{
			var self = this;

			if (this.record.getLineItemCount('shipgroup') <= 0)
			{
				//@class Transaction.Model.Get.ShipMethod
				self.addShippingMethod({
					//@property {String} internalid
					internalid: this.record.getFieldValue('shipmethod')
					//@property {String} name
				,	name: this.record.getFieldText('shipmethod')
					//@property {Number} rate
				,	rate: Utils.toCurrency(this.record.getFieldValue('shipping_rate'))
					//@property {String} rate_formatted
				,	rate_formatted: Utils.formatCurrency(this.record.getFieldValue('shipping_rate'))
					//@property {String} shipcarrier
				,	shipcarrier: this.record.getFieldValue('carrier')
				});
			}

			for (var i = 1; i <= this.record.getLineItemCount('shipgroup') ; i++)
			{
				self.addShippingMethod({
					internalid: this.record.getLineItemValue('shipgroup', 'shippingmethodref', i)
		 		,   name: this.record.getLineItemValue('shipgroup', 'shippingmethod', i)
				,   rate: Utils.toCurrency(this.record.getLineItemValue('shipgroup', 'shippingrate', i))
				,   rate_formatted: Utils.formatCurrency(this.record.getLineItemValue('shipgroup', 'shippingrate', i))
				,   shipcarrier: this.record.getLineItemValue('shipgroup', 'shippingcarrier', i)
				});
			}

			//@class Transaction.Model.Get.Result
			//@property {String} shipmethod Id of the selected shipping method
			this.result.shipmethod = this.record.getFieldValue('shipmethod');

			// @class Transaction.Model
		}

		//@method getTransactionType
		//@param {Array} ids
		// @return {Transaction.Model.List.Result.Record}
	,	getTransactionType: function (ids)
		{
			ids = _.isArray(ids) ? ids : [ids];

			var results = {}
			,	filters = [new nlobjSearchFilter('internalid', null,  'anyof', ids)]
			,	columns = [new nlobjSearchColumn('recordtype')];

			if (ids && ids.length)
			{
				_.each(Application.getAllSearchResults('transaction', filters, columns) || [], function (record)
				{
					results[record.getId()] = record.getValue('recordtype');
				});
			}

			return results;
		}

		//@method getRecordAddresses Get the list of address of the current transaction
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
					internalid: this.record.getLineItemValue('iladdrbook', 'iladdrshipaddr', i)
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
			this.result.shipaddress = this.record.getFieldValue('shipaddress') ? this.addAddress({
				internalid: this.record.getFieldValue('shipaddress')
			,	country: this.record.getFieldValue('shipcountry')
			,	state: this.record.getFieldValue('shipstate')
			,	city: this.record.getFieldValue('shipcity')
			,	zip: this.record.getFieldValue('shipzip')
			,	addr1: this.record.getFieldValue('shipaddr1')
			,	addr2: this.record.getFieldValue('shipaddr2')
			,	attention: this.record.getFieldValue('shipattention')
			,	addressee: this.record.getFieldValue('shipaddressee')
			,	phone:  this.record.getFieldValue('shipphone')
			}) : null;

			// Adds Bill Address
			// @property {String} billaddress Id of the billing address
			this.result.billaddress = this.record.getFieldValue('billaddress') ? this.addAddress({
				internalid: this.record.getFieldValue('billaddress')
			,	country: this.record.getFieldValue('billcountry')
			,	state: this.record.getFieldValue('billstate')
			,	city: this.record.getFieldValue('billcity')
			,	zip: this.record.getFieldValue('billzip')
			,	addr1: this.record.getFieldValue('billaddr1')
			,	addr2: this.record.getFieldValue('billaddr2')
			,	attention: this.record.getFieldValue('billattention')
			,	addressee: this.record.getFieldValue('billaddressee')
			,	phone: this.record.getFieldValue('billphone')
			}) : null;

			//@class Transaction.Model
		}

		//@method addShippingMethod Concatenated the parameter shipping method into the list of the current result's property shipmethods
		//@param {Transaction.Model.Get.ShipMethod} shipping_method
		//@return {Number} The internal id of the added internal id
	,	addShippingMethod: function (shipping_method)
		{
			//@class Transaction.Model.Get.Result
			//@property {Array<Transaction.Model.Get.ShipMethod>} shipmethods
			this.result.shipmethods = this.result.shipmethods || {};

			if (!this.result.shipmethods[shipping_method.internalid])
			{
				this.result.shipmethods[shipping_method.internalid] = shipping_method;
			}
			return shipping_method.internalid;
			// @class Transaction.Model
		}

		//@method addAddress Auxiliary method to generate address ids from its properties
		//@param {Address.Model.Attributes} address
		//@return {String} address id
	,	addAddress: function (address)
		{
			this.result.addresses = this.result.addresses || {};

			address.fullname = (address.attention) ? address.attention : address.addressee;
			address.company = (address.attention) ? address.addressee : null;

			delete address.attention;
			delete address.addressee;

			address.internalid = this.getAddressInternalId(address);

			if (AddressModel && AddressModel.isValid)
			{
				address.isvalid = AddressModel.isValid(address) ? 'T' : 'F';
			}

			if (!this.result.addresses[address.internalid])
			{
				this.result.addresses[address.internalid] = address;
			}

			return address.internalid;
		}

		//@method getAddressInternalId Internal method used to generate the internal id of an address
		//@param {Address.Model.Attributes} address
		//@return {String}
	,	getAddressInternalId: function (address)
		{
			var address_internalid =	(address.country || '')  + '-' +
										(address.state || '') + '-' +
										(address.city || '') + '-' +
										(address.zip || '') + '-' +
										(address.addr1 || '') + '-' +
										(address.addr2 || '') + '-' +
										(address.fullname || '') + '-' +
										(address.company || '');

			return address_internalid.replace(/\s/g, '-');
		}

		//@method update Updates a transaction
		//@param {String} record_type
		//@param {Number} id
		//@param {Transaction.Model.UpdateAttributes} data_model
		//@return {Void}
	,	update: function (record_type, id, data_model)
		{
			if (record_type && id)
			{
				this.recordId = id;
				this.data = data_model;

				this.record = this.getTransactionRecord(record_type, id);
				//@property {Transaction.Model.Get.Result} currentRecord This property is used so when performing any update
				//operation you can know what is the current state
				//This property is only present when performing an update operation
				this.currentRecord = this.get(record_type, id);
				this.setPaymentMethod();
				this.setAddress('ship', this.data.shipaddress, 'billaddress');
				this.setAddress('bill', this.data.billaddress, 'shipaddress');
				this.setLines();
				this.setMemo();
				this.setTransactionBodyCustomFields();
			}
		}

		//@method setMemo Sets the memo attribute into the current transaction
		//This method does not use any parameters as it use this.data and this.record
		//@return {Void}
	,	setMemo: function ()
		{
			this.record.setFieldValue('memo', null);

			if (this.data.memo)
			{
				this.record.setFieldValue('memo', this.data.memo);
			}
		}

		//@method setPaymentMethod Update in the current record the set payment method
		//This method does not use any parameters as it use this.data and this.record
		//@return {Void}
	,	setPaymentMethod: function ()
		{
			var self = this
			,	method_name = '';

			this.removePaymentMethod();

			if (this.data.paymentmethods)
			{
				//@class Transaction.Model.UpdateAttributes
				//@property {Array<Transaction.Model.Get.PaymentMethod>} paymentmethods
				_.each(this.data.paymentmethods, function (payment_method)
				{
					method_name = 'setPaymentMethod' + payment_method.type.toUpperCase();
					if (_.isFunction(self[method_name]))
					{
						self[method_name](payment_method);
					}
				});
			}

			// @class Transaction.Model
		}

		//@method setAddress Set the shipping address for the current transaction when performing an update
		//This method does not accept any parameter as it used this.data and this.record
		//@param {String} prefix Possible values are 'bill' or 'ship' depending on the address, if it is removing billing address or shipping address
		//@param {String} address_id
		//@param {String} other_address_name Name of the other address to compare in case of address creation and
		//@return {Void}
	,	setAddress: function (prefix, address_id, other_address_name)
		{
			this.removeAddress(prefix);

			if (address_id)
			{
				if (!this.hasCurrentCustomerAddress(address_id))
				{
					var old_address_model = _.find(this.data.addresses, {internalid: address_id})
					,	old_address_id = address_id;
					address_id = this.createAddress(old_address_model);
					this.data.addresses = _.reject(this.data.addresses, function (address)
					{
						return address.internalid === old_address_id;
					});
					old_address_model.internalid = address_id;
					this.data.addresses.push(old_address_model);
					if (other_address_name && this.data[other_address_name] === old_address_id)
					{
						this.data[other_address_name] = address_id;
					}
				}

				this.record.setFieldValue(prefix + 'addresslist', address_id);
			}
		}

		//@method hasCurrentCustomerAddress Indicate if certain address id exist in the current user or not
		//@param {String} address_id
		//@return {Boolean}
	,	hasCurrentCustomerAddress: function (address_id)
		{
			try
			{
				return AddressModel ? !!AddressModel.get(address_id) : true;
			}
			catch (e)
			{
				return false;
			}
		}

		//@method createAddress Creates an address for the current user
		//@param {Address.Data.Model} address_model
		//@return {String} internal id of the new created address
	,	createAddress: function (address_model)
		{
			return AddressModel && AddressModel.create(_.clone(address_model));
		}

		//@method removeAddress Auxiliary method used when updated a transaction to remove selected address
		//This method does not accept any parameter as it used this.data and this.record
		//@param {String} prefix Possible values are 'bill' or 'ship' depending on the address, if it is removing billing address or shipping address
		//@return {Void}
	,	removeAddress: function (prefix)
		{
			var empty_value = '';
			this.record.setFieldValue(prefix + 'country', empty_value);
//			this.record.setFieldValue(prefix + 'addresslist', empty_value);
			this.record.setFieldValue(prefix + 'address', empty_value);
			this.record.setFieldValue(prefix + 'state', empty_value);
			this.record.setFieldValue(prefix + 'city', empty_value);
			this.record.setFieldValue(prefix + 'zip', empty_value);
			this.record.setFieldValue(prefix + 'addr1', empty_value);
			this.record.setFieldValue(prefix + 'addr2', empty_value);
			this.record.setFieldValue(prefix + 'attention', empty_value);
			this.record.setFieldValue(prefix + 'addressee', empty_value);
			this.record.setFieldValue(prefix + 'phone', empty_value);
		}

		//@method setLines Set the line of a transaction when performing an update
		//This method does not accept any parameter as it used this.data and this.record
		//@return {Void}
	,	setLines: function ()
		{
			this.removeAllItemLines();

			if (this.data.lines)
			{
				var self = this;

				//@class Transaction.Model.UpdateAttributes
				//@property {Array<Transaction.Model.set.Line>} lines
				_.each(this.data.lines, function (line)
				{
					self.record.selectNewLineItem('item');
					self.record.setCurrentLineItemValue('item', 'item', line.item.internalid);
					self.record.setCurrentLineItemValue('item', 'quantity', line.quantity);
					self.record.setCurrentLineItemValue('item', 'itemtype', line.item.type);
					self.record.setCurrentLineItemValue('item', 'id', line.internalid);
					
					self._addTransactionColumnFieldsToOptions(line);

					//Set Line Options
					_.each(line.options, function (option_value, option_id)
					{
						self.record.setCurrentLineItemValue('item', option_id, option_value);
					});

					self.setLinesAddUpdateLine(line, self.record);

					self.record.commitLineItem('item');
				});
			}

			//@class Transaction.Model
		}

		//@method setLinesRemoveLines Extension method used to apply extra logic when removing lines from the current transaction
		//@param {nlobjRecord} current_transaction
		//@return {Void}
	,	setLinesRemoveLines: function ()
		{
		}

		//@method setLinesUpdateLines Extension method used to set extra values into line when they are being added/updated into the current transaction
		//@param {Transaction.Model.set.Line} line
		//@param {nlobjRecord} current_transaction
		//@return {Void}
	,	setLinesAddUpdateLine: function ()
		{
		}

		//@method removeAllItemLines Auxiliary method used to remove all lines of the current transaction
		//This method does not accept any parameter as it used this.data and this.record
		//@return {Void}
	,	removeAllItemLines: function ()
		{
			var items_count = this.record.getLineItemCount('item');

			this.setLinesRemoveLines(this.record);

			for (var i = 1; i <= items_count; i++)
			{
				this.record.removeLineItem('item', i);
			}
		}

		//@method setPaymentMethodINVOICE Internal method to set an invoice payment method into the current record.
		//Used to update the current record
		//@param {Transaction.Model.Get.PaymentMethod} payment_method
		//@return {Void}
	,	setPaymentMethodINVOICE: function (payment_method)
		{
			this.record.setFieldValue('terms', payment_method.terms.internalid);
			this.record.setFieldValue('otherrefnum', payment_method.purchasenumber);
		}

		//@method setPaymentMethodCREDITCARD Internal method to set a credit card payment method into the current record.
		//Used to update the current record
		//@param {Transaction.Model.Get.PaymentMethod} payment_method
		//@return {Void}
	,	setPaymentMethodCREDITCARD: function (payment_method)
		{
			// This is done like this to solve an issue
			if (!payment_method.creditcard.ccname)
			{
				throw {
					// @property {Number} status
					status: 500
					// @property {String} code
				,	code: 'ERR_WS_INVALID_PAYMENT'
					// @property {String} message
				,	message: 'Please enter your name as it appears on your card.'
				};
			}

			var credit_card = payment_method.creditcard;

			this.record.setFieldValue('creditcard', credit_card.internalid);
			this.record.setFieldValue('paymentmethod', credit_card.paymentmethod.internalid);
			this.record.setFieldValue('creditcardprocessor', credit_card.paymentmethod.merchantid);

			if (credit_card.ccsecuritycode)
			{
				this.record.setFieldValue('ccsecuritycode', credit_card.ccsecuritycode);
			}
		}

		//@method setPaymentMethodCREDITCARD Internal method to set a external payment method into the current record.
		//Used to update the current record
		//@param {Transaction.Model.Get.PaymentMethod} payment_method
		//@return {Void}
	,	setPaymentMethodEXTERNAL: function (payment_method)
		{
			this.record.setFieldValue('paymentmethod', payment_method.internalid);
			this.record.setFieldValue('creditcardprocessor', payment_method.merchantid);
			this.record.setFieldValue('returnurl', payment_method.returnurl);
			this.record.setFieldValue('getauth', 'T');
		}

		//@method removePaymentMethod Removes the specified payment method from the current record
		//@return {Void}
	,	removePaymentMethod: function ()
		{
			this.record.setFieldValue('paymentterms', null);
		 	this.record.setFieldValue('paymentmethod', null);
			this.record.setFieldValue('thankyouurl', null);
			this.record.setFieldValue('errorurl', null);
			this.record.setFieldValue('returnurl', null);
			this.record.setFieldValue('terms', null);
			this.record.setFieldValue('otherrefnum', null);
			this.record.setFieldValue('creditcard', null);
		}

		//@method preSubmitRecord Overridable method used to execute any logic before submit a transaction record
		//@return {Void} This method does not return anything as it works with the value of this.record
	,	preSubmitRecord: function () { }

		//@method postSubmitRecord Overridable method used to execute any logic before submit a transaction record
		//@param {Transaction.Model.Confirmation} confirmation_result
		//@return {Transaction.Model.Confirmation}
	,	postSubmitRecord: function (confirmation_result)
		{
			return confirmation_result;
		}

		//@method submit Saves the current record
		//@return {Transaction.Model.Confirmation}
	,	submit: function ()
		{
			if (!this.record)
			{
				throw SC.ERROR_IDENTIFIERS.loadBeforeSubmit;
			}

			this.preSubmitRecord();

			var new_record_id = nlapiSubmitRecord(this.record)
			//@class Transaction.Model.Confirmation
			,	result = {
					//@property {String} internalid
					internalid: new_record_id
				};

			return this.postSubmitRecord(result);
			// @class Transaction.Model
		}

		//@method preList Overridable method used to execute any logic before list() executes
		//@return {Void}
	,	preList: function () {}

		//@method postList Overridable method used to execute any logic after list() executes
		//@return {Void}
	,	postList: function () {}

		//@method preGet Overridable method used to execute any logic before get() executes
		//@return {Void}
	,	preGet: function () {}

		//@method postGet Overridable method used to execute any logic after get() executes
		//@return {Void}
	,	postGet: function () {}

	});
});

//@class Transaction.Model.List.Result
//@property {Number} totalRecordsFound
//@property {Number} page
//@property {Arra<Transaction.Model.List.Result.Record>} records

//@class Transaction.Model.List.Parameters
//@property {Number?} from Date in number of milliseconds
//@property {Number?} to Date in number of milliseconds
//@property {String?} createdfrom Value used to filter the list record created from
//@property {String?} internalid Value used to filter the list record, this string contains a list of transaction internal id joined by ','
//@property {String?} types In case of being specified, this string contains a list of transaction types joined by ','
//@property {String?} sort In case of being specified, this string contains a list of column names joined by ',' used to sort the final result
//@property {String?} filter Generic filter value

//@class Transaction.Model.set.Line
//@property {Number} quantity
//@property {String} internalid
//@property {Object} options This object is used like a dictionary where each property indicate the option name and the value of the property is the property value
//@property {Item} item When updated or creating a transaction only the type and id are mandatory the rest of the field of this class are optional
