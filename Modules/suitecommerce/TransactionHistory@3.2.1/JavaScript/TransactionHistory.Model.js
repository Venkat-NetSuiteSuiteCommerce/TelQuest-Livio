/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module TransactionHistory
define('TransactionHistory.Model'
,	[	'underscore'
	,	'Transaction.Model'
	,	'Utils'
	]
,	function (
		_
	,	TransactionModel
	)
{
	'use strict';

	//@class TransactionHistory.Model @extend Backbone.Model
	return TransactionModel.extend({

		urlRoot: 'services/TransactionHistory.Service.ss'
		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
	,	cacheSupport: true
		//@method getTypeLabel @return {String}
	,	getTypeLabel: function ()
		{
			var type;

			switch(this.get('recordtype'))
			{
				case 'creditmemo':
					type = _('Credit Memo').translate();
				break;
				case 'customerpayment':
					type = _('Payment').translate();
				break;
				case 'customerdeposit':
					type = _('Deposit').translate();
				break;
				case 'depositapplication':
					type = _('Deposit Application').translate();
				break;
				case 'invoice':
					type = _('Invoice').translate();
				break;
				case 'cashsale':
					type = _('Cash Receipt').translate();
				break;
			}

			return type;
		}

		//@method getTypeUrl @return {String}
	,	getTypeUrl: function ()
		{
			var type = this.get('recordtype')
			,	record_root_url = 'transactionhistory/' + type;

			if (type === 'invoice')
			{
				record_root_url = 'transactionhistory/invoices';
			}
			else if (type === 'returnauthorization')
			{
				record_root_url = 'returns';
			}

			return record_root_url + '/' + this.get('internalid');
		}
	});
});