/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Transaction
define('Transaction.Line.Option.Collection'
,	[
		'Transaction.Line.Option.Model'

	,	'ProductLine.Option.Collection'
	]
,	function (
		TransactionLineOptionModel

	,	ProductLineOptionCollection
	)
{
	'use strict';

	//@class Transaction.Line.Option.Collection @extend ProductLine.Option.Collection
	return ProductLineOptionCollection.extend({
		//@property {Transaction.Line.Model} model
		model: TransactionLineOptionModel
	});
});