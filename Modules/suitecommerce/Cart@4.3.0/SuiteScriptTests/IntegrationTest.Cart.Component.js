/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/


define('IntegrationTest.Cart.Component',
	[
		'Application'
	,	'LiveOrder.Model'
	,	'Cart.Component'
	,	'jQuery.Deferred'
	,	'preconditions'
	,	'underscore'
	]
	, function (
		Application
	,	LiveOrderModel
	,	CartComponent
	,	jQuery
	,	Preconditions
	,	_
	)
{
	'use strict';

	return describe('IntegrationTest.Cart.Component', function ()
	{
		var dummy_line
		,	shipping_address
		,	credit_card;
		
		beforeAll(function()
		{
			Preconditions.start(
				'create_and_login_customer'
			,	'get_not_matrix_item_line'
			,	'generate_one_shipping_address_data'
			,	'generate_one_visa_credit_card_data'
			,	function(err, customer, line, address, card)
			{
				shipping_address = Preconditions.Address.unwrapAddress(address);
				credit_card = {
					ccnumber: card.cardNumber
				,	ccname: card.name
				,	ccexpiredate: new Date(
						card.expYear
					,	card.expMonth - 1
					,	10	
					).toISOString()
				,	expmonth: card.expMonth
				,	expyear:  card.expYear
				,	ccsecuritycode: card.securityNumber
				,	paymentmethod: {
						internalid: card.cardTypeId
					,	name: card.cardType
					,	creditcard: true
					,	ispaypal: false
					}
				};
				
				dummy_line = line;
			});
		});

		beforeEach(function ()
		{
		});

		describe('Public interface', function ()
		{
			it ('should define/implement all public methods', function ()
			{
				var cart = Application.getComponent('Cart');
				expect(cart).toBeDefined();				
				
				expect(cart.addLine).toBeDefined();
				expect(cart.addLineSync).toBeDefined();
				expect(_.isFunction(cart.addLine)).toBe(true);
				expect(_.isFunction(cart.addLineSync)).toBe(true);
				
				expect(cart.getLines).toBeDefined();
				expect(cart.getLinesSync).toBeDefined();
				expect(_.isFunction(cart.getLines)).toBe(true);
				expect(_.isFunction(cart.getLinesSync)).toBe(true);
				
				expect(cart.getSummary).toBeDefined();
				expect(cart.getSummarySync).toBeDefined();
				expect(_.isFunction(cart.getSummary)).toBe(true);
				expect(_.isFunction(cart.getSummarySync)).toBe(true);
				
				expect(cart.removeLine).toBeDefined();
				expect(cart.removeLineSync).toBeDefined();
				expect(_.isFunction(cart.removeLine)).toBe(true);
				expect(_.isFunction(cart.removeLineSync)).toBe(true);
				
				expect(cart.updateLine).toBeDefined();
				expect(cart.updateLineSync).toBeDefined();
				expect(_.isFunction(cart.updateLine)).toBe(true);
				expect(_.isFunction(cart.updateLineSync)).toBe(true);
				
				expect(cart.addPayment).toBeDefined();
				expect(cart.addPaymentSync).toBeDefined();
				expect(_.isFunction(cart.addPayment)).toBe(true);
				expect(_.isFunction(cart.addPaymentSync)).toBe(true);
				
				expect(cart.addPromotion).toBeDefined();
				expect(cart.addPromotionSync).toBeDefined();
				expect(_.isFunction(cart.addPromotion)).toBe(true);
				expect(_.isFunction(cart.addPromotionSync)).toBe(true);
				
				expect(cart.removePromotion).toBeDefined();
				expect(cart.removePromotionSync).toBeDefined();
				expect(_.isFunction(cart.removePromotion)).toBe(true);
				expect(_.isFunction(cart.removePromotionSync)).toBe(true);
				
				expect(cart.estimateShipping).toBeDefined();
				expect(cart.estimateShippingSync).toBeDefined();
				expect(_.isFunction(cart.estimateShipping)).toBe(true);
				expect(_.isFunction(cart.estimateShippingSync)).toBe(true);
				
				expect(cart.removeShipping).toBeDefined();
				expect(cart.removeShippingSync).toBeDefined();
				expect(_.isFunction(cart.removeShipping)).toBe(true);
				expect(_.isFunction(cart.removeShippingSync)).toBe(true);
				
				expect(cart.submit).toBeDefined();
				expect(cart.submitSync).toBeDefined();
				expect(_.isFunction(cart.submit)).toBe(true);
				expect(_.isFunction(cart.submitSync)).toBe(true);
			});
		});
		
		//addLine tests

		describe('addLine method', function ()
		{
			it ('should cancel the execution of addLine if I throw error inside the listener of beforeAddLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLine).toBeDefined();
				expect(_.isFunction(cart.addLine)).toBe(true);
				
				var exception = new Error('Throwing beforeAddLine error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterAddLine handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeAddLine', handlers.handler1);
				cart.on('beforeAddLine', handlers.handler2);
				cart.on('afterAddLine', handlers.handler3);
				
				cart.addLine({line: dummy_line})
					.fail(function(e){
						expect(e).toBe(exception);
						expect(handlers.handler1).toHaveBeenCalled();
						expect(handlers.handler2).toHaveBeenCalled();
						expect(handlers.handler3).not.toHaveBeenCalled();
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeAddLine', handlers.handler1);
				cart.off('beforeAddLine', handlers.handler2);
				cart.off('afterAddLine', handlers.handler3);

			});
		
			it ('should cancel the execution of addLine if I return a rejected promise inside the listener of beforeAddLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLine).toBeDefined();
				expect(_.isFunction(cart.addLine)).toBe(true);
				
				var error = new Error('Rejecting beforeAddLine promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeAddLine', handler1);
				
				var handler3 = function handler3(){
					fail('afterAddLine handler should not be called');
				};
				cart.on('afterAddLine', handler3);
				
				cart.addLine({line: dummy_line})
					.fail(function(e){
						expect(e).toBe(error);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeAddLine', handler1);
				cart.off('afterAddLine', handler3);
				
			});

			it ('should cancel the execution of addLine if I throw error inside the listener of before:LiveOrder.addLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLine).toBeDefined();
				expect(_.isFunction(cart.addLine)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.addLine error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.addLine', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.addLine handler should not be called');
				};
				Application.on('before:LiveOrder.addLine', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.addLine handler should not be called');
				};
				Application.on('after:LiveOrder.addLine', handler3);
				
				cart.addLine({line: dummy_line})
					.fail(function(e){
						expect(e).toBe(exception);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				Application.off('before:LiveOrder.addLine', handler1);
				Application.off('before:LiveOrder.addLine', handler2);
				Application.off('after:LiveOrder.addLine', handler3);
			});

			it ('should trigger beforeAddLine and afterAddLine when addLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLine).toBeDefined();
				expect(_.isFunction(cart.addLine)).toBe(true);
				
				var result_line_id
				,	handlers = {
						handler1: function handler1(data){
							expect(data.line.quantity).toEqual(dummy_line.quantity);
							expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
							expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
						}
					,	handler3: function handler3(data){
							result_line_id = data.result;
							expect(data.line.quantity).toEqual(dummy_line.quantity);
							expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
							expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
						}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeAddLine', handlers.handler1);
				cart.on('afterAddLine', handlers.handler3);
				
				cart.addLine({line: dummy_line})
					.fail(function(e){
						fail('fail should not be called');
					})
					.done(function(line_id){
						expect(result_line_id).toBe(line_id);
						testContext.session.getOrder().removeItem(line_id);
					})
					.always(function(){
						expect(handlers.handler1).toHaveBeenCalled();
						expect(handlers.handler3).toHaveBeenCalled();
					});
				
				cart.off('beforeAddLine', handlers.handler1);
				cart.off('afterAddLine', handlers.handler3);
			});
		});

		//addLineSync tests
				
		describe('addLineSync method', function ()
		{
			it ('should cancel the execution of addLineSync if I throw error inside the listener of beforeAddLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLineSync).toBeDefined();
				expect(_.isFunction(cart.addLineSync)).toBe(true);
				
				var exception = new Error('Throwing beforeAddLine error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterAddLine handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				
				cart.on('beforeAddLine', handlers.handler1);
				cart.on('beforeAddLine', handlers.handler2);
				cart.on('afterAddLine', handlers.handler3);
				
				try
				{
					cart.addLineSync({line: dummy_line});
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler2).toHaveBeenCalled();
					expect(handlers.handler3).not.toHaveBeenCalled();
				}
				
				cart.off('beforeAddLine', handlers.handler1);
				cart.off('beforeAddLine', handlers.handler2);
				cart.off('afterAddLine', handlers.handler3);
			});

			it ('should cancel the execution of addLineSync if I return a rejected promise inside the listener of beforeAddLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLineSync).toBeDefined();
				expect(_.isFunction(cart.addLineSync)).toBe(true);
				
				var error = new Error('Rejecting beforeAddLine promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeAddLine', handler1);
				
				var handler3 = function handler3(){
					fail('afterAddLine handler should not be called');
				};
				cart.on('afterAddLine', handler3);
				
				try
				{
					cart.addLineSync({line: dummy_line});
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(error);
				}
				
				cart.off('beforeAddLine', handler1);
				cart.off('afterAddLine', handler3);
			});

			it ('should cancel the execution of addLineSync if I throw error inside the listener of before:LiveOrder:addLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLineSync).toBeDefined();
				expect(_.isFunction(cart.addLineSync)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.addLine error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.addLine', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.addLine handler should not be called');
				};
				Application.on('before:LiveOrder.addLine', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.addLine handler should not be called');
				};
				Application.on('after:LiveOrder.addLine', handler3);
				
				try
				{
					cart.addLineSync({line: dummy_line});
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
				}
				
				Application.off('before:LiveOrder.addLine', handler1);
				Application.off('before:LiveOrder.addLine', handler2);
				Application.off('after:LiveOrder.addLine', handler3);
			});

			it ('should trigger beforeAddLine and afterAddLine when addLineSync', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLineSync).toBeDefined();
				expect(_.isFunction(cart.addLineSync)).toBe(true);
				
				var result_line_id
				,	handlers = {
						handler1: function handler1(data){
							expect(data.line.quantity).toEqual(dummy_line.quantity);
							expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
							expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
						}
					,	handler3: function handler3(data){
							result_line_id = data.result;
							expect(data.line.quantity).toEqual(dummy_line.quantity);
							expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
							expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
						}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeAddLine', handlers.handler1);
				cart.on('afterAddLine', handlers.handler3);
				
				try
				{
					var line_id = cart.addLineSync({line: dummy_line});
					expect(result_line_id).toBe(line_id);
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler3).toHaveBeenCalled();
				}
				catch(e)
				{
					fail('Should not throw an exception');
				}
				
				cart.off('beforeAddLine', handlers.handler1);
				cart.off('afterAddLine', handlers.handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});
		});
		
		//getLines tests
		
		describe('getLines method', function ()
		{
			it ('should get the lines added in the order', function ()
			{
				try
				{
					var pre_added_line_id = testContext.session.getOrder().addItem({
						internalid: dummy_line.item.internalid.toString()
					,	quantity: dummy_line.quantity
					,	options: dummy_line.options
					});
				
					var cart = Application.getComponent('Cart');

					expect(cart).toBeDefined();
					expect(cart.getLines).toBeDefined();
					expect(_.isFunction(cart.getLines)).toBe(true);

					cart.getLines()
						.fail(function(e){
							fail('fail should not be called');
						})
						.done(function(lines){
							expect(lines).toBeDefined();
							expect(lines.length).toBe(1);
						
							var line = _.find(lines, function(line){
								return line.internalid === pre_added_line_id;
							});
						
							expect(line).toBeDefined();
							expect(line.extras).toBeDefined();
							expect(line.item).toBeDefined();
							expect(line.item.extras).toBeDefined();
							expect(line.item.internalid).toBe(dummy_line.item.internalid);
						})
						.always(function(){
							testContext.session.getOrder().removeItem(pre_added_line_id);
						});
				}
				catch(e)
				{
					fail('Should not throw an exception');
				}
				
			});
		});
		
		//getLinesSync tests
		
		describe('getLinesSync method', function ()
		{
			it ('should get the lines added in the order', function ()
			{
				try
				{
					var pre_added_line_id = testContext.session.getOrder().addItem({
						internalid: dummy_line.item.internalid.toString()
					,	quantity: dummy_line.quantity
					,	options: dummy_line.options
					});
				
					var cart = Application.getComponent('Cart');

					expect(cart).toBeDefined();
					expect(cart.getLinesSync).toBeDefined();
					expect(_.isFunction(cart.getLinesSync)).toBe(true);

					var lines = cart.getLinesSync();
					expect(lines).toBeDefined();
					expect(lines.length).toBe(1);

					var line = _.find(lines, function(line){
						return line.internalid === pre_added_line_id;
					});
					expect(line).toBeDefined();
					expect(line.extras).toBeDefined();
					expect(line.item).toBeDefined();
					expect(line.item.extras).toBeDefined();
					expect(line.item.internalid).toBe(dummy_line.item.internalid);
				}
				catch(e)
				{
					fail('Should not throw an exception');
				}
				testContext.session.getOrder().removeItem(pre_added_line_id);
				
			});
		});
		
		//getSummary tests
		
		describe('getSummary method', function ()
		{
			it ('should get the summary of the order', function ()
			{
				try
				{
					var pre_added_line_id = testContext.session.getOrder().addItem({
						internalid: dummy_line.item.internalid.toString()
					,	quantity: dummy_line.quantity
					,	options: dummy_line.options
					});
				
					var cart = Application.getComponent('Cart');

					expect(cart).toBeDefined();
					expect(cart.getSummary).toBeDefined();
					expect(_.isFunction(cart.getSummary)).toBe(true);

					cart.getSummary()
						.fail(function(e){
							fail('fail should not be called');
						})
						.done(function(summary){
							expect(summary).toBeDefined();
							expect(summary.total).toBeDefined();
							expect(summary.extras).toBeDefined();
							expect(summary.extras.discounttotal_formatted).toBeDefined();
							expect(summary.extras.taxonshipping_formatted).toBeDefined();
							expect(summary.extras.taxondiscount_formatted).toBeDefined();
							expect(summary.extras.taxonhandling_formatted).toBeDefined();
							expect(summary.extras.itemcount).toBeDefined();
							expect(summary.extras.itemcount).toBe(dummy_line.quantity);
						})
						.always(function(){
							testContext.session.getOrder().removeItem(pre_added_line_id);
						});
				}
				catch(e)
				{
					fail('Should not throw an exception');
				}
				
			});
		});
		
		//getSummarySync tests
		
		describe('getSummarySync method', function ()
		{
			it ('should get the summary of the order', function ()
			{
				try
				{
					var pre_added_line_id = testContext.session.getOrder().addItem({
						internalid: dummy_line.item.internalid.toString()
					,	quantity: dummy_line.quantity
					,	options: dummy_line.options
					});
				
					var cart = Application.getComponent('Cart');

					expect(cart).toBeDefined();
					expect(cart.getSummarySync).toBeDefined();
					expect(_.isFunction(cart.getSummarySync)).toBe(true);

					var summary = cart.getSummarySync();
					expect(summary).toBeDefined();
					expect(summary.total).toBeDefined();
					expect(summary.extras).toBeDefined();
					expect(summary.extras.discounttotal_formatted).toBeDefined();
					expect(summary.extras.taxonshipping_formatted).toBeDefined();
					expect(summary.extras.taxondiscount_formatted).toBeDefined();
					expect(summary.extras.taxonhandling_formatted).toBeDefined();
					expect(summary.extras.itemcount).toBeDefined();
					expect(summary.extras.itemcount).toBe(dummy_line.quantity);
					
					testContext.session.getOrder().removeItem(pre_added_line_id);
				}
				catch(e)
				{
					fail('Should not throw an exception');
				}
				
			});
		});
		
		//removeLine tests

		describe('removeLine method', function ()
		{
			it ('should cancel the execution of removeLine if I throw error inside the listener of beforeRemoveLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.removeLine).toBeDefined();
				expect(_.isFunction(cart.removeLine)).toBe(true);
				
				var exception = new Error('Throwing beforeRemoveLine error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterRemoveLine handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeRemoveLine', handlers.handler1);
				cart.on('beforeRemoveLine', handlers.handler2);
				cart.on('afterRemoveLine', handlers.handler3);
				
				cart.removeLine({internalid: line_id})
					.fail(function(e){
						expect(e).toBe(exception);
						expect(handlers.handler1).toHaveBeenCalled();
						expect(handlers.handler2).toHaveBeenCalled();
						expect(handlers.handler3).not.toHaveBeenCalled();
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeRemoveLine', handlers.handler1);
				cart.off('beforeRemoveLine', handlers.handler2);
				cart.off('afterRemoveLine', handlers.handler3);

				testContext.session.getOrder().removeItem(line_id);
			});
		
			it ('should cancel the execution of removeLine if I return a rejected promise inside the listener of beforeRemoveLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.removeLine).toBeDefined();
				expect(_.isFunction(cart.removeLine)).toBe(true);
				
				var error = new Error('Rejecting beforeRemoveLine promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeRemoveLine', handler1);
				
				var handler3 = function handler3(){
					fail('afterRemoveLine handler should not be called');
				};
				cart.on('afterRemoveLine', handler3);
				
				cart.removeLine({internalid: line_id})
					.fail(function(e){
						expect(e).toBe(error);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeRemoveLine', handler1);
				cart.off('afterRemoveLine', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should cancel the execution of removeLine if I throw error inside the listener of before:LiveOrder.removeLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.removeLine).toBeDefined();
				expect(_.isFunction(cart.removeLine)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.removeLine error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.removeLine', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.removeLine handler should not be called');
				};
				Application.on('before:LiveOrder.removeLine', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.removeLine handler should not be called');
				};
				Application.on('after:LiveOrder.removeLine', handler3);
				
				cart.removeLine({internalid: line_id})
					.fail(function(e){
						expect(e).toBe(exception);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				Application.off('before:LiveOrder.removeLine', handler1);
				Application.off('before:LiveOrder.removeLine', handler2);
				Application.off('after:LiveOrder.removeLine', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should trigger beforeRemoveLine and afterRemoveLine when removeLine', function ()
			{
				try{
					var line_id = testContext.session.getOrder().addItem({
						internalid: dummy_line.item.internalid.toString()
					,	quantity: dummy_line.quantity
					,	options: dummy_line.options
					});

					var items = testContext.session.getOrder().getItems([]);
					expect(items.length).toBe(1);
					var line = _.find(items, function(item){
						return item.orderitemid === line_id;
					});
					expect(line).toBeDefined();

					var cart = Application.getComponent('Cart');

					expect(cart).toBeDefined();
					expect(cart.removeLine).toBeDefined();
					expect(_.isFunction(cart.removeLine)).toBe(true);

					var handlers = {
						handler1: function handler1(data){
							expect(data.internalid).toEqual(line_id);
						}
					,	handler3: function handler3(data){
							expect(data.internalid).toEqual(line_id);
						}
					};
					spyOn(handlers, 'handler1').and.callThrough();
					spyOn(handlers, 'handler3').and.callThrough();

					cart.on('beforeRemoveLine', handlers.handler1);
					cart.on('afterRemoveLine', handlers.handler3);

					cart.removeLine({internalid: line_id})
						.fail(function(e){
							fail('fail should not be called');
						})
						.done(function(){
							expect(testContext.session.getOrder().getItems([])).toBeNull();
						})
						.always(function(){
							expect(handlers.handler1).toHaveBeenCalled();
							expect(handlers.handler3).toHaveBeenCalled();
						});

					cart.off('beforeRemoveLine', handlers.handler1);
					cart.off('afterRemoveLine', handlers.handler3);
				}
				catch(e)
				{
					fail('fail should not throw an exception');
				}
			});
		});

		//removeLineSync tests
		
		describe('removeLineSync method', function ()
		{
			it ('should cancel the execution of removeLineSync if I throw error inside the listener of beforeRemoveLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.removeLineSync).toBeDefined();
				expect(_.isFunction(cart.removeLineSync)).toBe(true);
				
				var exception = new Error('Throwing beforeRemoveLine error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterRemoveLine handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeRemoveLine', handlers.handler1);
				cart.on('beforeRemoveLine', handlers.handler2);
				cart.on('afterRemoveLine', handlers.handler3);
				
				try
				{
					cart.removeLineSync({internalid: line_id});
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler2).toHaveBeenCalled();
					expect(handlers.handler3).not.toHaveBeenCalled();
				}
				
				cart.off('beforeRemoveLine', handlers.handler1);
				cart.off('beforeRemoveLine', handlers.handler2);
				cart.off('afterRemoveLine', handlers.handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should cancel the execution of removeLineSync if I return a rejected promise inside the listener of beforeRemoveLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.removeLineSync).toBeDefined();
				expect(_.isFunction(cart.removeLineSync)).toBe(true);
				
				var error = new Error('Rejecting beforeRemoveLine promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeRemoveLine', handler1);
				
				var handler3 = function handler3(){
					fail('afterRemoveLine handler should not be called');
				};
				cart.on('afterRemoveLine', handler3);
				
				try
				{
					cart.removeLineSync({internalid: line_id});
					fail('Should removeLineSync an exception');
				}
				catch(e)
				{
					expect(e).toBe(error);
				}
				
				cart.off('beforeRemoveLine', handler1);
				cart.off('afterRemoveLine', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should cancel the execution of removeLineSync if I throw error inside the listener of before:LiveOrder:removeLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.removeLineSync).toBeDefined();
				expect(_.isFunction(cart.removeLineSync)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.removeLine error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.removeLine', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.removeLine handler should not be called');
				};
				Application.on('before:LiveOrder.removeLine', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.removeLine handler should not be called');
				};
				Application.on('after:LiveOrder.removeLine', handler3);
				
				try
				{
					cart.removeLineSync({internalid: line_id});
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
				}
				
				Application.off('before:LiveOrder.removeLine', handler1);
				Application.off('before:LiveOrder.removeLine', handler2);
				Application.off('after:LiveOrder.removeLine', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should trigger beforeRemoveLine and afterRemoveLine when removeLineSync', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var items = testContext.session.getOrder().getItems([]);
				
				expect(items.length).toBe(1);
				var line = _.find(items, function(item){
					return item.orderitemid === line_id;
				});
				expect(line).toBeDefined();
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.removeLineSync).toBeDefined();
				expect(_.isFunction(cart.removeLineSync)).toBe(true);
				
				var handlers = {
					handler1: function handler1(data){
						expect(data.internalid).toEqual(line_id);
					}
				,	handler3: function handler3(data){
						expect(data.internalid).toEqual(line_id);
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeRemoveLine', handlers.handler1);
				cart.on('afterRemoveLine', handlers.handler3);
				
				try
				{
					cart.removeLineSync({internalid: line_id});
					expect(testContext.session.getOrder().getItems([])).toBeNull();
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler3).toHaveBeenCalled();
				}
				catch(e)
				{
					fail('Should not throw an exception');
				}
				
				cart.off('beforeRemoveLine', handlers.handler1);
				cart.off('afterRemoveLine', handlers.handler3);
			});
		});
		
		//addLines tests

		describe('addLines method', function ()
		{
			it ('should cancel the execution of addLines if I throw error inside the listener of beforeAddLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLines).toBeDefined();
				expect(_.isFunction(cart.addLines)).toBe(true);
				
				var exception = new Error('Throwing beforeAddLine error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterAddLine handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeAddLine', handlers.handler1);
				cart.on('beforeAddLine', handlers.handler2);
				cart.on('afterAddLine', handlers.handler3);
				
				cart.addLines({lines: [dummy_line]})
					.fail(function(e){
						expect(e).toBe(exception);
						expect(handlers.handler1).toHaveBeenCalled();
						expect(handlers.handler2).toHaveBeenCalled();
						expect(handlers.handler3).not.toHaveBeenCalled();
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeAddLine', handlers.handler1);
				cart.off('beforeAddLine', handlers.handler2);
				cart.off('afterAddLine', handlers.handler3);

			});
		
			it ('should cancel the execution of addLines if I return a rejected promise inside the listener of beforeAddLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLines).toBeDefined();
				expect(_.isFunction(cart.addLines)).toBe(true);
				
				var error = new Error('Rejecting beforeAddLine promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeAddLine', handler1);
				
				var handler3 = function handler3(){
					fail('afterAddLine handler should not be called');
				};
				cart.on('afterAddLine', handler3);
				
				cart.addLines({lines: [dummy_line]})
					.fail(function(e){
						expect(e).toBe(error);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeAddLine', handler1);
				cart.off('afterAddLine', handler3);
				
			});

			it ('should cancel the execution of addLines if I throw error inside the listener of before:LiveOrder.addLines', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLines).toBeDefined();
				expect(_.isFunction(cart.addLines)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.addLine error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.addLines', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.addLines handler should not be called');
				};
				Application.on('before:LiveOrder.addLines', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.addLines handler should not be called');
				};
				Application.on('after:LiveOrder.addLines', handler3);
				
				cart.addLines({lines: [dummy_line]})
					.fail(function(e){
						expect(e).toBe(exception);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				Application.off('before:LiveOrder.addLines', handler1);
				Application.off('before:LiveOrder.addLines', handler2);
				Application.off('after:LiveOrder.addLines', handler3);
			});

			it ('should trigger beforeAddLine and afterAddLine when addLines', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLines).toBeDefined();
				expect(_.isFunction(cart.addLines)).toBe(true);
				
				var result_line_id
				,	handlers = {
						handler1: function handler1(data){
							expect(data.line.quantity).toEqual(dummy_line.quantity);
							expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
							expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
						}
					,	handler3: function handler3(data){
							result_line_id = data.result;
							expect(data.line.quantity).toEqual(dummy_line.quantity);
							expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
							expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
						}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeAddLine', handlers.handler1);
				cart.on('afterAddLine', handlers.handler3);
				
				cart.addLines({lines: [dummy_line]})
					.fail(function(e){
						fail('fail should not be called');
					})
					.done(function(lines_ids){
						expect(lines_ids.length).toBe(1);
						expect(result_line_id).toBe(lines_ids[0]);
						testContext.session.getOrder().removeItem(lines_ids[0]);
					})
					.always(function(){
						expect(handlers.handler1).toHaveBeenCalled();
						expect(handlers.handler3).toHaveBeenCalled();
					});
				
				cart.off('beforeAddLine', handlers.handler1);
				cart.off('afterAddLine', handlers.handler3);
			});
		});

		//addLinesSync tests

		describe('addLinesSync method', function ()
		{
			it ('should cancel the execution of addLinesSync if I throw error inside the listener of beforeAddLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLinesSync).toBeDefined();
				expect(_.isFunction(cart.addLinesSync)).toBe(true);
				
				var exception = new Error('Throwing beforeAddLine error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterAddLine handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeAddLine', handlers.handler1);
				cart.on('beforeAddLine', handlers.handler2);
				cart.on('afterAddLine', handlers.handler3);
				
				try
				{
					cart.addLinesSync({lines: [dummy_line]});
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler2).toHaveBeenCalled();
					expect(handlers.handler3).not.toHaveBeenCalled();
				}
				
				cart.off('beforeAddLine', handlers.handler1);
				cart.off('beforeAddLine', handlers.handler2);
				cart.off('afterAddLine', handlers.handler3);
			});

			it ('should cancel the execution of addLinesSync if I return a rejected promise inside the listener of beforeAddLine', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLinesSync).toBeDefined();
				expect(_.isFunction(cart.addLinesSync)).toBe(true);
				
				var error = new Error('Rejecting beforeAddLine promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeAddLine', handler1);
				
				var handler3 = function handler3(){
					fail('afterAddLine handler should not be called');
				};
				cart.on('afterAddLine', handler3);
				
				try
				{
					cart.addLinesSync({lines: [dummy_line]});
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(error);
				}
				
				cart.off('beforeAddLine', handler1);
				cart.off('afterAddLine', handler3);
			});

			it ('should cancel the execution of addLinesSync if I throw error inside the listener of before:LiveOrder:addLines', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLinesSync).toBeDefined();
				expect(_.isFunction(cart.addLinesSync)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.addLines error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.addLines', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.addLines handler should not be called');
				};
				Application.on('before:LiveOrder.addLines', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.addLines handler should not be called');
				};
				Application.on('after:LiveOrder.addLines', handler3);
				
				try
				{
					cart.addLinesSync({lines: [dummy_line]});
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
				}
				
				Application.off('before:LiveOrder.addLines', handler1);
				Application.off('before:LiveOrder.addLines', handler2);
				Application.off('after:LiveOrder.addLines', handler3);
			});

			it ('should trigger beforeAddLine and afterAddLine when addLinesSync', function ()
			{
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.addLinesSync).toBeDefined();
				expect(_.isFunction(cart.addLinesSync)).toBe(true);
				
				var result_line_id
				,	handlers = {
						handler1: function handler1(data){
							expect(data.line.quantity).toEqual(dummy_line.quantity);
							expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
							expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
						}
					,	handler3: function handler3(data){
							result_line_id = data.result;
							expect(data.line.quantity).toEqual(dummy_line.quantity);
							expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
							expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
						}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeAddLine', handlers.handler1);
				cart.on('afterAddLine', handlers.handler3);
				
				try
				{
					var lines_ids = cart.addLinesSync({lines: [dummy_line]});
					expect(lines_ids.length).toBe(1);
					expect(result_line_id).toBe(lines_ids[0]);
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler3).toHaveBeenCalled();
				}
				catch(e)
				{
					fail('Should not throw an exception');
				}
				
				cart.off('beforeAddLine', handlers.handler1);
				cart.off('afterAddLine', handlers.handler3);
				
				testContext.session.getOrder().removeItem(lines_ids[0]);
			});
		});
		
		//updateLine tests

		describe('updateLine method', function ()
		{
			it ('should cancel the execution of updateLine if I throw error inside the listener of beforeUpdateLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.updateLine).toBeDefined();
				expect(_.isFunction(cart.updateLine)).toBe(true);
				
				var exception = new Error('Throwing beforeUpdateLine error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterUpdateLine handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeUpdateLine', handlers.handler1);
				cart.on('beforeUpdateLine', handlers.handler2);
				cart.on('afterUpdateLine', handlers.handler3);
				
				var data = {line: dummy_line};
				data.line.internalid = line_id;
				data.line.quantity = 33;
				
				cart.updateLine(data)
					.fail(function(e){
						expect(e).toBe(exception);
						expect(handlers.handler1).toHaveBeenCalled();
						expect(handlers.handler2).toHaveBeenCalled();
						expect(handlers.handler3).not.toHaveBeenCalled();
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeUpdateLine', handlers.handler1);
				cart.off('beforeUpdateLine', handlers.handler2);
				cart.off('afterUpdateLine', handlers.handler3);

				testContext.session.getOrder().removeItem(line_id);
			});
		
			it ('should cancel the execution of updateLine if I return a rejected promise inside the listener of beforeUpdateLine', function ()
			{
				var line_id = testContext.session.order.addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.updateLine).toBeDefined();
				expect(_.isFunction(cart.updateLine)).toBe(true);
				
				var error = new Error('Rejecting beforeUpdateLine promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeUpdateLine', handler1);
				
				var handler3 = function handler3(){
					fail('afterUpdateLine handler should not be called');
				};
				cart.on('afterUpdateLine', handler3);
				
				var data = {line: dummy_line};
				data.line.internalid = line_id;
				data.line.quantity = 33;
				
				cart.updateLine(data)
					.fail(function(e){
						expect(e).toBe(error);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeUpdateLine', handler1);
				cart.off('afterUpdateLine', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should cancel the execution of updateLine if I throw error inside the listener of before:LiveOrder.updateLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.updateLine).toBeDefined();
				expect(_.isFunction(cart.updateLine)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.updateLine error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.updateLine', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.updateLine handler should not be called');
				};
				Application.on('before:LiveOrder.updateLine', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.updateLine handler should not be called');
				};
				Application.on('after:LiveOrder.updateLine', handler3);
				
				var data = {line: dummy_line};
				data.line.internalid = line_id;
				data.line.quantity = 33;
				
				cart.updateLine(data)
					.fail(function(e){
						expect(e).toBe(exception);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				Application.off('before:LiveOrder.updateLine', handler1);
				Application.off('before:LiveOrder.updateLine', handler2);
				Application.off('after:LiveOrder.updateLine', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should trigger beforeUpdateLine and afterUpdateLine when updateLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var items = testContext.session.getOrder().getItems([]);
				expect(items.length).toBe(1);
				var line = _.find(items, function(item){
					return item.orderitemid === line_id;
				});
				expect(line).toBeDefined();
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.updateLine).toBeDefined();
				expect(_.isFunction(cart.updateLine)).toBe(true);
				
				var handlers = {
					handler1: function handler1(data){
						expect(data.line.internalid).toEqual(line_id);
						expect(data.line.quantity).toEqual(dummy_line.quantity);
						expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
						expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
					}
				,	handler3: function handler3(data){
						expect(data.line.internalid).toEqual(line_id);
						expect(data.line.quantity).toEqual(dummy_line.quantity);
						expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
						expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeUpdateLine', handlers.handler1);
				cart.on('afterUpdateLine', handlers.handler3);
				
				var data = {line: dummy_line};
				data.line.internalid = line_id;
				data.line.quantity = 33;
				
				cart.updateLine(data)
					.fail(function(e){
						fail('fail should not be called');
					})
					.done(function(){
						items = testContext.session.getOrder().getItems([]);
						expect(items.length).toBe(1);
						expect(items[0].quantity).toBe(data.line.quantity);
					})
					.always(function(){
						expect(handlers.handler1).toHaveBeenCalled();
						expect(handlers.handler3).toHaveBeenCalled();
						testContext.session.getOrder().removeItem(line_id);
					});
				
				cart.off('beforeUpdateLine', handlers.handler1);
				cart.off('afterUpdateLine', handlers.handler3);
			});
		});

		//updateLineSync tests
		
		describe('updateLineSync method', function ()
		{
			it ('should cancel the execution of updateLineSync if I throw error inside the listener of beforeUpdateLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.updateLineSync).toBeDefined();
				expect(_.isFunction(cart.updateLineSync)).toBe(true);
				
				var exception = new Error('Throwing beforeUpdateLine error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterUpdateLine handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeUpdateLine', handlers.handler1);
				cart.on('beforeUpdateLine', handlers.handler2);
				cart.on('afterUpdateLine', handlers.handler3);
				
				try
				{
					var data = {line: dummy_line};
					data.line.internalid = line_id;
					data.line.quantity = 33;
					
					cart.updateLineSync(data);
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler2).toHaveBeenCalled();
					expect(handlers.handler3).not.toHaveBeenCalled();
				}
				
				cart.off('beforeUpdateLine', handlers.handler1);
				cart.off('beforeUpdateLine', handlers.handler2);
				cart.off('afterUpdateLine', handlers.handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should cancel the execution of updateLineSync if I return a rejected promise inside the listener of beforeUpdateLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.updateLineSync).toBeDefined();
				expect(_.isFunction(cart.updateLineSync)).toBe(true);
				
				var error = new Error('Rejecting beforeUpdateLine promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeUpdateLine', handler1);
				
				var handler3 = function handler3(){
					fail('afterUpdateLine handler should not be called');
				};
				cart.on('afterUpdateLine', handler3);
				
				try
				{
					var data = {line: dummy_line};
					data.line.internalid = line_id;
					data.line.quantity = 33;
					
					cart.updateLineSync(data);
					fail('Should updateLineSync an exception');
				}
				catch(e)
				{
					expect(e).toBe(error);
				}
				
				cart.off('beforeUpdateLine', handler1);
				cart.off('afterUpdateLine', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should cancel the execution of updateLineSync if I throw error inside the listener of before:LiveOrder:updateLine', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.updateLineSync).toBeDefined();
				expect(_.isFunction(cart.updateLineSync)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.updateLine error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.updateLine', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.updateLine handler should not be called');
				};
				Application.on('before:LiveOrder.updateLine', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.updateLine handler should not be called');
				};
				Application.on('after:LiveOrder.updateLine', handler3);
				
				try
				{
					var data = {line: dummy_line};
					data.line.internalid = line_id;
					data.line.quantity = 33;
					
					cart.updateLineSync(data);
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
				}
				
				Application.off('before:LiveOrder.updateLine', handler1);
				Application.off('before:LiveOrder.updateLine', handler2);
				Application.off('after:LiveOrder.updateLine', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should trigger beforeUpdateLine and afterUpdateLine when updateLineSync', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var items = testContext.session.getOrder().getItems([]);
				expect(items.length).toBe(1);
				var line = _.find(items, function(item){
					return item.orderitemid === line_id;
				});
				expect(line).toBeDefined();
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.updateLineSync).toBeDefined();
				expect(_.isFunction(cart.updateLineSync)).toBe(true);
				
				var handlers = {
					handler1: function handler1(data){
						expect(data.line.internalid).toEqual(line_id);
						expect(data.line.quantity).toEqual(dummy_line.quantity);
						expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
						expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
					}
				,	handler3: function handler3(data){
						expect(data.line.internalid).toEqual(line_id);
						expect(data.line.quantity).toEqual(dummy_line.quantity);
						expect(data.line.item.internalid).toEqual(dummy_line.item.internalid);
						expect(data.line.item.itemtype).toEqual(dummy_line.item.itemtype);
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeUpdateLine', handlers.handler1);
				cart.on('afterUpdateLine', handlers.handler3);
				
				try
				{
					var data = {line: dummy_line};
					data.line.internalid = line_id;
					data.line.quantity = 33;
					
					cart.updateLineSync(data);
					
					items = testContext.session.getOrder().getItems([]);
					expect(items.length).toBe(1);
					expect(items[0].quantity).toBe(data.line.quantity);
					
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler3).toHaveBeenCalled();
				}
				catch(e)
				{
					fail('Should not throw an exception');
				}
				
				cart.off('beforeUpdateLine', handlers.handler1);
				cart.off('afterUpdateLine', handlers.handler3);
				testContext.session.getOrder().removeItem(line_id);
			});
		});

	});
});