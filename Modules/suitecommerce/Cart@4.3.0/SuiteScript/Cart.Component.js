/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('Cart.Component'
,	[
		'ICart.Component'
	,	'LiveOrder.Model'

	,	'Application'

	,	'Utils'
	,	'jQuery.Deferred'
	,	'underscore'
	]
,	function (
		ICartComponent
	,	LiveOrderModel

	,	Application

	,	Utils
	,	jQuery
	,	_
	)
{
	'use strict';

	//@class Cart.Component @extend ICart.Component
	var cart_component = ICartComponent.extend({
			
		addLine: function addLine(data)
		{
			var deferred = jQuery.Deferred();
			try
			{
				this._validateLine(data.line);
				deferred.resolve(LiveOrderModel.addLine(data.line));
			}
			catch(e)
			{
				deferred.reject(e);
			}

			return deferred;
		}
	,	addLines: function addLines(data)
		{
			var deferred = jQuery.Deferred();
			try
			{
				var self = this;
				_.map(data.lines, function(line){
					self._validateLine(line);
				});
				var lines = _.map(LiveOrderModel.addLines(data.lines), function(added_line){
					return added_line.orderitemid;
				});
				deferred.resolve(lines);
			}
			catch(e)
			{
				deferred.reject(e);
			}

			return deferred;
		}
	,	getLines: function getLines()
		{
			var deferred = jQuery.Deferred();
			try
			{
				var self = this;
				var lines = _.map(LiveOrderModel.getLinesOnly(), function(line){
					return self._normalizeLine(line);
				});
				deferred.resolve(lines);
			}
			catch(e)
			{	
				deferred.reject(e);
			}
			return deferred;
		}
	,	removeLine: function removeLine(data)
		{
			var deferred = jQuery.Deferred();
			try
			{
				if(!data.internalid || !_.isString(data.internalid))
				{
					this._reportError('INVALID_PARAM', 'Invalid id: Must be a defined string');
				}
				deferred.resolve(LiveOrderModel.removeLine(data.internalid));
			}
			catch(e)
			{	
				deferred.reject(e);
			}
			return deferred;
		}
	,	updateLine: function updateLine(data)
		{
			var deferred = jQuery.Deferred();
			try
			{
				this._validateEditLine(data.line);
				deferred.resolve(LiveOrderModel.updateLine(data.line.internalid, data.line));
			}
			catch(e)
			{	
				deferred.reject(e);
			}
			return deferred;
		}
	,	getSummary: function getSummary()
		{
			var deferred = jQuery.Deferred();
			try
			{
				var summary = LiveOrderModel.getSummary();
				deferred.resolve(this._normalizeSummary(summary));
			}
			catch(e)
			{
				deferred.reject(e);
			}
			return deferred;
		}
	,	submit: function submit()
		{
			var deferred = jQuery.Deferred();
			try
			{
				deferred.resolve(LiveOrderModel.submit());
			}
			catch(e)
			{
				deferred.reject(e);
			}
			return deferred;
		}
	});
	
	cart_component._generateSyncMethods();
	
	//Maps inner events to the outer events to be triggered and a normalize function to be used in order to transform the inenr arguments to the outers
	var innerToOuterMap = [
		{inner: 'before:LiveOrder.addLine', outer: 'beforeAddLine', normalize: cart_component._normalizeAddLineBefore}
	,	{inner: 'after:LiveOrder.addLine', outer: 'afterAddLine', normalize: cart_component._normalizeAddLineAfter}
	,	{inner: 'before:LiveOrder.removeLine', outer: 'beforeRemoveLine', normalize: cart_component._normalizeRemoveLineBefore}
	,	{inner: 'after:LiveOrder.removeLine', outer: 'afterRemoveLine', normalize: cart_component._normalizeRemoveLineAfter}
	,	{inner: 'before:LiveOrder.submit', outer: 'beforeSubmit', normalize: cart_component._normalizeSubmitBefore}
	,	{inner: 'after:LiveOrder.submit', outer: 'afterSubmit', normalize: cart_component._normalizeSubmitAfter}
	,	{inner: 'before:LiveOrder.updateLine', outer: 'beforeUpdateLine', normalize: cart_component._normalizeUpdateLineBefore, disableEvents: ['beforeAddLine', 'afterAddLine', 'beforeRemoveLine', 'afterRemoveLine']}
	,	{inner: 'after:LiveOrder.updateLine', outer: 'afterUpdateLine', normalize: cart_component._normalizeUpdateLineAfter, enableEvents: ['beforeAddLine', 'afterAddLine', 'beforeRemoveLine', 'afterRemoveLine']}
	/*
	,	{inner: 'before:LiveOrder.setShippingAddress', outer: 'beforeEstimateShipping', normalize: null}
	,	{inner: 'after:LiveOrder.setShippingAddress', outer: 'afterEstimateShipping', normalize: null}
	,	{inner: 'before:LiveOrder.setPromoCodes', outer: 'beforeAddPromotion', normalize: null}
	,	{inner: 'after:LiveOrder.setPromoCodes', outer: 'afterAddPromotion', normalize: null}
	,	{inner: 'before:LiveOrder.removeAllPromocodes', outer: 'beforeRemovePromotion', normalize: null}
	,	{inner: 'after:LiveOrder.removeAllPromocodes', outer: 'afterRemovePromotion', normalize: null}
	,	{inner: 'before:LiveOrder.delete', outer: 'beforeDelete', normalize: null}
	,	{inner: 'after:LiveOrder.delete', outer: 'afterDelete', normalize: null}
	,	{inner: 'before:LiveOrder.suspend', outer: 'beforeSuspend', normalize: null}
	,	{inner: 'after:LiveOrder.suspend', outer: 'afterSuspend', normalize: null}
	,	{inner: 'before:LiveOrder.setPaymentMethods', outer: 'beforeAddPayment', normalize: null}
	,	{inner: 'after:LiveOrder.setPaymentMethods', outer: 'afterAddPayment', normalize: null}
	*/
	];
	cart_component._suscribeToInnerEvents(innerToOuterMap);
	
	Application.on('before:LiveOrder.addLines', function (model, lines)
	{
		var lines_copy = Utils.deepCopy(lines);
		
		var	lines_deferred = _.map(lines_copy, function(line){
			var args = cart_component._normalizeAddLineBefore([line]);
			return cart_component.cancelableTrigger('beforeAddLine', args);	
		})
		, result = jQuery.Deferred();
		
		jQuery.when.apply(jQuery, lines_deferred)
			.fail(cart_component._asyncErrorHandle(result))
			.done(result.resolve);
		
		return result;
	});
	
	Application.on('after:LiveOrder.addLines', function (model, lines_ids, lines)
	{
		var lines_copy = Utils.deepCopy(lines);
		var lines_ids_copy = Utils.deepCopy(lines_ids);
		
		var	lines_deferred = _.map(lines_copy, function(line){

			try
			{
				var line_id = _.find(lines_ids_copy, function(line_id){
					return line_id.internalid === line.item.internalid.toString();
				}).orderitemid;
				
				var args = cart_component._normalizeAddLineAfter([line_id, line]);
				return cart_component.cancelableTrigger('afterAddLine', args);
			}
			catch(e)
			{
				return jQuery.Deferred().reject(e);
			}
		})
		, result = jQuery.Deferred();
		
		jQuery.when.apply(jQuery, lines_deferred)
			.fail(cart_component._asyncErrorHandle(result))
			.done(result.resolve);
		
		return result;
	});

	Application.registerComponent(cart_component);
	
});