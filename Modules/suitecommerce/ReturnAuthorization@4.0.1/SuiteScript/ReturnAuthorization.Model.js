/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ReturnAuthorization.Model.js
// ----------------
//
define(
	'ReturnAuthorization.Model'
,	[	'Transaction.Model'
	,	'Utils'
	,	'Application'
	,	'StoreItem.Model'
	,	'SiteSettings.Model'

	,	'underscore'
	]
,	function (
		Transaction
	,	Utils
	,	Application
	,	StoreItem
	,	SiteSettings

	,	_
	)
{
	'use strict';

	// @class ReturnAuthorization.Model Defines the model used by the ReturnAuthorization.Service.ss service
	// @extends Transaction
	return Transaction.extend({

		//@property {String} name
		name: 'ReturnAuthorization'

		//@property {Object} validation
	,	validation: {}

	,	isSCISIntegrationEnabled: SiteSettings.isSCISIntegrationEnabled()

	,	getExtraRecordFields: function ()
		{
			this.result.isCancelable = this.isCancelable();
			
			if (this.isSCISIntegrationEnabled && this.result.recordtype === 'creditmemo')
			{

				this.result.amountpaid = Utils.toCurrency(this.record.getFieldValue('amountpaid'));
				this.result.amountpaid_formatted = Utils.formatCurrency(this.record.getFieldValue('amountpaid'));
				this.result.amountremaining = Utils.toCurrency(this.record.getFieldValue('amountremaining'));
				this.result.amountremaining_formatted = Utils.formatCurrency(this.record.getFieldValue('amountremaining'));

				this.getApply();
			}
			
		}

		//@method isCancelable
		//@return {Boolean}
	,	isCancelable: function ()
		{
			return this.result.recordtype === 'returnauthorization' && this.result.status.internalid === 'pendingApproval';
		}
	,	getExtraLineFields: function (result, record, i)
		{
			result.reason = this.result.recordtype === 'creditmemo' ? '' : record.getLineItemValue('item', 'description', i);
		}
	,	getApply: function()
		{
			var self = this
			,	ids = [];

			this.result.applies = {};

			for (var i = 1; i <= this.record.getLineItemCount('apply'); i++)
			{
				if (self.record.getLineItemValue('apply', 'apply', i) === 'T')
				{
					var internalid = self.record.getLineItemValue('apply', 'internalid', i);

					ids.push(internalid);

					self.result.applies[internalid] = {
							line: i
						,	internalid: internalid
						,	tranid: self.record.getLineItemValue('apply', 'refnum', i)
						,	applydate: self.record.getLineItemValue('apply', 'applydate', i)
						,	recordtype: self.record.getLineItemValue('apply', 'type', i)
						,	currency: self.record.getLineItemValue('apply', 'currency', i)
						,	amount: Utils.toCurrency(self.record.getLineItemValue('apply', 'amount', i))
						,	amount_formatted: Utils.formatCurrency(self.record.getLineItemValue('apply', 'amount', i))
					};
				}
			}

			if (ids && ids.length)
			{
				_.each(this.getTransactionType(ids) || {}, function (recordtype, internalid)
				{
					self.result.applies[internalid].recordtype = recordtype;
				});	
			}
			this.result.applies = _.values(this.result.applies);
		}

	,	update: function (id, data, headers)
		{
			if (data.status === 'cancelled')
			{
				var url = 'https://' + Application.getHost() + '/app/accounting/transactions/returnauthmanager.nl?type=cancel&id=' + id;
				nlapiRequestURL(url, null, headers);
			}
		}

		//@method create
		//@param data
		//@return {Number}
	,	create: function (data)
        {
        	var return_authorization = nlapiTransformRecord(data.type, data.id, 'returnauthorization')
        	,   transaction_lines = this.getTransactionLines(data.id);

        	this.setLines(return_authorization, data.lines, transaction_lines);
        	return_authorization.setFieldValue('memo', data.comments);
			
			return nlapiSubmitRecord(return_authorization);
        }
	,	getTransactionLines: function (transaction_internalid)
		{
			var filters = {
				mainline: ['mainline', 'is', 'F']
			,   mainline_operator: 'and'
			,   internalid: ['internalid', 'is', transaction_internalid]
			}
			
			,   columns = [
				new nlobjSearchColumn('line')
			,   new nlobjSearchColumn('rate')
			];

			var search_results = Application.getAllSearchResults('transaction', _.values(filters), columns)
			,	item_lines = [];            

			_.each(search_results, function (search_result) 
			{
				var item_line = {
					line: transaction_internalid + '_' + search_result.getValue('line')
				,   rate: search_result.getValue('rate')
				};

				item_lines.push(item_line);
			});
			
			return item_lines;
		}

		//@method findLine
		//@param line_id
		//@param lines
	,	getCreatedFrom: function()
		{
			var created_from_internalid
			,	created_from_name
			,	recordtype
			,	tranid;

			if (this.isSCISIntegrationEnabled && this.result.recordtype === 'creditmemo')
			{
				created_from_internalid = this.record.getFieldValue('custbody_ns_pos_created_from');
				created_from_name = this.record.getFieldText('custbody_ns_pos_created_from');
			}
			else
			{
				created_from_internalid = nlapiLookupField(this.result.recordtype, this.result.internalid, 'createdfrom');
				created_from_name = created_from_internalid && nlapiLookupField(this.result.recordtype, this.result.internalid, 'createdfrom', true);
			}
			
			recordtype = created_from_internalid ? Utils.getTransactionType(created_from_internalid) : '';
			tranid = recordtype ? nlapiLookupField(recordtype, created_from_internalid, 'tranid') : '';

			this.result.createdfrom =
			{
					internalid: created_from_internalid
				,	name: created_from_name
				,	recordtype: recordtype
				,	tranid: tranid
			};
		}
	,	getStatus: function ()
		{
			this.result.status =
			{
				internalid: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status')
			,	name: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status', true)
			};
		}

	,	findLine: function (line_id, lines)
		{
			return _.findWhere(lines, {
				id: line_id
			});
		}

		//@method setLines
		//@param return_authorization
		//@param lines
		//@return {ReturnAuthorization.Model}
 	,	setLines: function (return_authorization, lines, transaction_lines)
 		{
 			var line_count = return_authorization.getLineItemCount('item')
 			,   add_line = true
 			,   i = 1;

			while (i <= line_count)
			{
				var line_item_value = return_authorization.getLineItemValue('item', 'id', i);

				add_line = this.findLine(line_item_value, lines);

				if (add_line)
				{
					var transaction_line = _.findWhere(transaction_lines, { line: line_item_value });

					if (transaction_line)
					{
						return_authorization.setLineItemValue('item', 'rate', i, transaction_line.rate);
					}

					return_authorization.setLineItemValue('item', 'quantity', i, add_line.quantity);
					return_authorization.setLineItemValue('item', 'description', i, add_line.reason);
				}
				else
				{
					return_authorization.setLineItemValue('item', 'quantity', i, 0);
				}

				i++;
			}
        }

		//@method list
		//@param {Object} data
		//@return {Object}
	,	setExtraListFilters: function ()
		{
			if (this.data.getLines && this.data.page === 'all')
			{
				delete this.filters.mainline;
				delete this.filters.mainline_operator;

				this.filters.shipping_operator = 'and';
				this.filters.shipping = ['shipping','is', 'F'];

				this.filters.taxline_operator = 'and';
				this.filters.taxline = ['taxline', 'is', 'F'];

				this.filters.quantity_operator = 'and';
				this.filters.quantity = ['quantity', 'notequalto', 0];

				this.filters.cogs_operator = 'and';
				this.filters.cogs = ['cogs', 'is', 'F'];

				this.filters.transactiondiscount_operator = 'and';
				this.filters.transactiondiscount = ['transactiondiscount', 'is', 'F'];

			}

			if (this.isSCISIntegrationEnabled)
			{
				this.filters.scisrecords_operator = 'and';
				this.filters.scisrecords = [
						[
							['type', 'anyof', ['CustCred']]
						,	'and'
						,	[ 'location.locationtype', 'is', SC.Configuration.locationTypeMapping.store.internalid ]
						,	'and'
						,	[ 'source', 'is', '@NONE@' ]
						] 
					,	'or'
					,	[
							['type', 'anyof', ['RtnAuth']]
						]
				];	
				
			}
			else
			{
				this.filters.type_operator = 'and';
				this.filters.type = ['type', 'anyof', ['RtnAuth']];
			}

			if (this.data.createdfrom)
			{
				delete this.filters.createdfrom;
				delete this.filters.createdfrom_operator;
				
				this.data.createdfrom = _.isArray(this.data.createdfrom) ? this.data.createdfrom : this.data.createdfrom.split(',');

				var internal_ids = []
				,	filters = [
						[
							['createdfrom', 'anyof', this.data.createdfrom]
						,	'and'
						,	['type', 'anyof', ['RtnAuth']]
						]
					]
				,	columns = nlobjSearchColumn('internalid');


				if (this.isSCISIntegrationEnabled)
				{
					
					filters.push('or');
					filters.push([
						['custbody_ns_pos_created_from', 'anyof', this.data.createdfrom]
					,	'and'
					,	[
								['type', 'anyof', ['CustCred']]
							,	'and'
							,	[ 'location.locationtype', 'is', SC.Configuration.locationTypeMapping.store.internalid ]
							,	'and'
							,	[ 'source', 'is', '@NONE@' ]
						]
					]);

				}

				internal_ids = _(Application.getAllSearchResults('transaction', _.values(filters), columns) || []).pluck('id');

				if (this.data.internalid && this.data.internalid.length)
				{
					internal_ids = _.intersection(internal_ids, this.data.internalid);
				}

				internal_ids = internal_ids.length ? internal_ids : [0];

				this.filters.internalid_operator = 'and';
				this.filters.internalid  =  ['internalid', 'anyof', internal_ids];
			}

		}
	,	setExtraListColumns: function ()
		{
			if (this.data.getLines && this.data.page === 'all')
			{
				this.columns.mainline = new nlobjSearchColumn('mainline');
				this.columns.internalid_item = new nlobjSearchColumn('internalid', 'item');
				this.columns.type_item = new nlobjSearchColumn('type', 'item');
				this.columns.parent_item = new nlobjSearchColumn('parent', 'item');
				this.columns.displayname_item = new nlobjSearchColumn('displayname', 'item');
				this.columns.storedisplayname_item = new nlobjSearchColumn('storedisplayname', 'item');
				this.columns.rate = new nlobjSearchColumn('rate');
				this.columns.total = new nlobjSearchColumn('total');
				this.columns.options = new nlobjSearchColumn('options');
				this.columns.line = new nlobjSearchColumn('line').setSort();
				this.columns.quantity = new nlobjSearchColumn('quantity');
			}
		}
	,	mapListResult : function (result, record)
		{

			result.amount = Math.abs(result.amount || 0);
			result.amount_formatted =  Utils.formatCurrency(result.amount);

			result.lines = record.getValue(this.columns.lines);
		
			if (this.data.getLines)
			{
				result.mainline = record.getValue('mainline');
			}

			return result;
		}
	,	postList: function ()
		{
			if (this.data.getLines && this.data.page === 'all')
			{
				this.results = _.where(this.results, {mainline: '*'});

				var items_to_preload = {}
				,	self = this;

				_.each(this.search_results || [], function (record)
				{
					if (record.getValue('mainline') !== '*')
					{
						var record_id = record.getId()
						,	result = _.findWhere(self.results, {internalid: record_id});

						if (result)
						{
							result.lines = result.lines || [];

							var item_id = record.getValue('internalid', 'item')
							,	item_type = record.getValue('type', 'item');

							if (item_type !== 'Discount')
							{
							result.lines.push({
								internalid: record_id + '_' + record.getValue('line')
							,	quantity: Math.abs(record.getValue('quantity'))
							,	rate: Utils.toCurrency(record.getValue('rate'))
							,	rate_formatted: Utils.formatCurrency(record.getValue('rate'))
							,	tax_amount: Utils.toCurrency(Math.abs(record.getValue('taxtotal')))
							,	tax_amount_formatted: Utils.formatCurrency(Math.abs(record.getValue('taxtotal')))
							,	amount: Utils.toCurrency(Math.abs(record.getValue(self.amountField)))
							,	amount_formatted: Utils.formatCurrency(Math.abs(record.getValue(self.amountField)))
							,	options: self.parseLineOptions(record.getValue('options'))

							,	item: {
										internalid: item_id
									,	type: item_type
									,	parent: record.getValue('parent', 'item')
									,	displayname: record.getValue('displayname', 'item')
									,	storedisplayname: record.getValue('storedisplayname', 'item')
									,	itemid: record.getValue('itemid', 'item')
								}
							});

							items_to_preload[item_id] = {
								id: item_id
							,	type: item_type
							};
						}
			
						}
					}
				});
				
				this.store_item = StoreItem;

				this.store_item.preloadItems( _.values(items_to_preload));

				_.each(this.results, function (result)
				{
					_.each(result.lines, function (line)
					{
						var item_details = self.store_item.get(line.item.internalid, line.item.type);

						if (item_details && !_.isUndefined(item_details.itemid))
						{
							line.item = item_details;
						}
					});
				});
			}
			else if (this.results.records && this.results.records.length)
			{
				var filters = {}
				,	columns = [
						new nlobjSearchColumn('internalid', null, 'group')
					,	new nlobjSearchColumn('quantity', null, 'sum')
					]
				,	quantities = {};

				filters.internalid  =  ['internalid', 'anyof', _(this.results.records || []).pluck('internalid')];
				filters.mainline_operator = 'and';	
				filters.mainline = ['mainline','is', 'F'];
				filters.cogs_operator = 'and';
				filters.cogs = ['cogs', 'is', 'F'];
				filters.taxline_operator = 'and';
				filters.taxline = ['taxline', 'is', 'F'];
				filters.shipping_operator = 'and';
				filters.shipping = ['shipping','is', 'F'];

				Application.getAllSearchResults('transaction', _.values(filters), columns).forEach(function (record) {
				 	quantities[record.getValue('internalid', null, 'group')] = record.getValue('quantity', null, 'sum');
				});

				_.each(this.results.records, function (record) {
					record.quantity = Math.abs(quantities[record.internalid] || 0);	
				});
			}
		}

	,	postGet: function () 
		{
			var filters = {}
			,	columns = [
				new nlobjSearchColumn('createdfrom')
			,	new nlobjSearchColumn('tranid', 'createdfrom')
			]
			,	self = this
			,	isCreditMemo = this.result.recordtype === 'creditmemo'
			,	record_type = ''
			,	created_from_internalid = ''
			,	created_from_name = ''
			,	cretaed_from_tranid = '';

			filters.internalid  =  ['internalid', 'is', this.result.internalid];
				
			if (isCreditMemo)
			{
				columns.push(new nlobjSearchColumn('line'));
				columns.push(new nlobjSearchColumn('custcol_ns_pos_returnreason'));

				filters.mainline_operator = 'and';	
				filters.mainline = ['mainline','is', 'F'];
				filters.cogs_operator = 'and';
				filters.cogs = ['cogs', 'is', 'F'];
				filters.taxline_operator = 'and';
				filters.taxline = ['taxline', 'is', 'F'];
				filters.shipping_operator = 'and';
				filters.shipping = ['shipping','is', 'F'];
			}
			else
			{
				filters.createdfrom_operator = 'and';
				filters.createdfrom = ['createdfrom', 'noneof', '@NONE@'];
			}


			Application.getAllSearchResults('transaction', _.values(filters), columns).forEach(function (record) 
			{
				created_from_internalid = record.getValue('createdfrom');
				created_from_name = record.getText('createdfrom');
				cretaed_from_tranid = record.getValue('tranid', 'createdfrom');

				if (isCreditMemo)
				{
					var line = self.result.lines[self.result.internalid + '_' + record.getValue('line')];
					
					if (line)
					{
				 		line.reason = record.getText('custcol_ns_pos_returnreason');
					}
				}

			});

			if (created_from_internalid)
			{
				record_type = Utils.getTransactionType(created_from_internalid);
			}

			this.result.createdfrom =
			//@class CreatedFrom
			{
				//@property {String} internalid
				internalid: created_from_internalid
				//@property {String} name
			,	name: created_from_name
				//@property {String} recordtype
			,	recordtype: record_type || ''
				//@property {String} tranid
			,	tranid: cretaed_from_tranid
			};
			
			this.result.lines = _.reject(this.result.lines, function (line)
			{
				return line.quantity === 0;
			});
		}

	});
});