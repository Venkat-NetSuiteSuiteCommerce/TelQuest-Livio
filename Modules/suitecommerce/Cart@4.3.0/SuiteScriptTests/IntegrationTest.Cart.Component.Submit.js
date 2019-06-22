/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('IntegrationTest.Cart.Component.Submit',
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

	return describe('IntegrationTest.Cart.Component.Submit', function ()
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
		
		//submit tests

		describe('submit method', function ()
		{
			it ('should cancel the execution of submit if I throw error inside the listener of beforeSubmit', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.submit).toBeDefined();
				expect(_.isFunction(cart.submit)).toBe(true);
				
				var exception = new Error('Throwing beforeSubmit error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterSubmit handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeSubmit', handlers.handler1);
				cart.on('beforeSubmit', handlers.handler2);
				cart.on('afterSubmit', handlers.handler3);
				
				cart.submit()
					.fail(function(e){
						expect(e).toBe(exception);
						expect(handlers.handler1).toHaveBeenCalled();
						expect(handlers.handler2).toHaveBeenCalled();
						expect(handlers.handler3).not.toHaveBeenCalled();
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeSubmit', handlers.handler1);
				cart.off('beforeSubmit', handlers.handler2);
				cart.off('afterSubmit', handlers.handler3);

				testContext.session.getOrder().removeItem(line_id);
			});
		
			it ('should cancel the execution of submit if I return a rejected promise inside the listener of beforeSubmit', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.submit).toBeDefined();
				expect(_.isFunction(cart.submit)).toBe(true);
				
				var error = new Error('Rejecting beforeSubmit promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeSubmit', handler1);
				
				var handler3 = function handler3(){
					fail('afterSubmit handler should not be called');
				};
				cart.on('afterSubmit', handler3);
				
				cart.submit()
					.fail(function(e){
						expect(e).toBe(error);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				cart.off('beforeSubmit', handler1);
				cart.off('afterSubmit', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should cancel the execution of submit if I throw error inside the listener of before:LiveOrder.submit', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.submit).toBeDefined();
				expect(_.isFunction(cart.submit)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.submit error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.submit', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.submit handler should not be called');
				};
				Application.on('before:LiveOrder.submit', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.submit handler should not be called');
				};
				Application.on('after:LiveOrder.submit', handler3);
				
				cart.submit()
					.fail(function(e){
						expect(e).toBe(exception);
					})
					.done(function(){
						fail('done should not be called');
					});
				
				Application.off('before:LiveOrder.submit', handler1);
				Application.off('before:LiveOrder.submit', handler2);
				Application.off('after:LiveOrder.submit', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should trigger beforeSubmit and afterSubmit when submit', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var address_id = testContext.session.getCustomer().addAddress(shipping_address);
				testContext.session.getOrder().setShippingAddress(address_id);
				testContext.session.getOrder().setBillingAddress(address_id);

				testContext.session.getOrder().setPayment({
					paymentterms: 'CreditCard'
				,	creditcard: credit_card
				});

				var shipping_methods = testContext.session.getOrder().getAvailableShippingMethods(['shipmethod', 'shipcarrier']);
				
				testContext.session.getOrder().setShippingMethod(_.first(shipping_methods));

				testContext.session.getOrder().setTermsAndConditions(true);
				
				var items = testContext.session.getOrder().getItems([]);
				expect(items.length).toBe(1);
				var line = _.find(items, function(item){
					return item.orderitemid === line_id;
				});
				expect(line).toBeDefined();
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.submit).toBeDefined();
				expect(_.isFunction(cart.submit)).toBe(true);
				
				var handlers = {
					handler1: function handler1(data){
						expect(data).toEqual({});
					}
				,	handler3: function handler3(data){
						expect(data.result.internalid).toBeDefined();
						expect(data.result.summary).toBeDefined();
						expect(data.result.statuscode).toBe('success');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeSubmit', handlers.handler1);
				cart.on('afterSubmit', handlers.handler3);
				
				cart.submit()
					.fail(function(e){
						fail('fail should not be called\n' + e);
					})
					.done(function(confirmation){
						expect(confirmation.internalid).toBeDefined();
						expect(confirmation.summary).toBeDefined();
						expect(confirmation.statuscode).toBe('success');
					})
					.always(function(){
						expect(handlers.handler1).toHaveBeenCalled();
						expect(handlers.handler3).toHaveBeenCalled();
					});
				
				cart.off('beforeSubmit', handlers.handler1);
				cart.off('afterSubmit', handlers.handler3);
			});
		});

		//submitSync tests
		
		describe('submitSync method', function ()
		{
			it ('should cancel the execution of submitSync if I throw error inside the listener of beforeSubmit', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.submitSync).toBeDefined();
				expect(_.isFunction(cart.submitSync)).toBe(true);
				
				var exception = new Error('Throwing beforeSubmit error');
				
				var handlers = {
					handler1: function handler1(){
						throw exception;
					}
				,	handler2: function handler2(){}
				,	handler3: function handler3(){
						fail('afterSubmit handler should not be called');
					}
				};
				spyOn(handlers, 'handler1').and.callThrough();
				spyOn(handlers, 'handler2').and.callThrough();
				spyOn(handlers, 'handler3').and.callThrough();
				
				cart.on('beforeSubmit', handlers.handler1);
				cart.on('beforeSubmit', handlers.handler2);
				cart.on('afterSubmit', handlers.handler3);
				
				try
				{
					cart.submitSync();
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler2).toHaveBeenCalled();
					expect(handlers.handler3).not.toHaveBeenCalled();
				}
				
				cart.off('beforeSubmit', handlers.handler1);
				cart.off('beforeSubmit', handlers.handler2);
				cart.off('afterSubmit', handlers.handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should cancel the execution of submitSync if I return a rejected promise inside the listener of beforeSubmit', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.submitSync).toBeDefined();
				expect(_.isFunction(cart.submitSync)).toBe(true);
				
				var error = new Error('Rejecting beforeSubmit promise');
				
				var handler1 = function handler1(){
					return jQuery.Deferred().reject(error);
				};
				cart.on('beforeSubmit', handler1);
				
				var handler3 = function handler3(){
					fail('afterSubmit handler should not be called');
				};
				cart.on('afterSubmit', handler3);
				
				try
				{
					cart.submitSync();
					fail('Should updateLineSync an exception');
				}
				catch(e)
				{
					expect(e).toBe(error);
				}
				
				cart.off('beforeSubmit', handler1);
				cart.off('afterSubmit', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should cancel the execution of submitSync if I throw error inside the listener of before:LiveOrder:submit', function ()
			{
				var line_id = testContext.session.getOrder().addItem({
					internalid: dummy_line.item.internalid.toString()
				,	quantity: dummy_line.quantity
				,	options: dummy_line.options
				});
				
				var cart = Application.getComponent('Cart');
				
				expect(cart).toBeDefined();
				expect(cart.submitSync).toBeDefined();
				expect(_.isFunction(cart.submitSync)).toBe(true);
				
				var exception = new Error('Throwing before:LiveOrder.submit error');
				
				var handler1 = function handler1(){
					throw exception;
				};
				Application.on('before:LiveOrder.submit', handler1);
				
				var handler2 = function handler2(){
					fail('Second before:LiveOrder.submit handler should not be called');
				};
				Application.on('before:LiveOrder.submit', handler2);
				
				var handler3 = function handler3(){
					fail('after:LiveOrder.submit handler should not be called');
				};
				Application.on('after:LiveOrder.submit', handler3);
				
				try
				{
					cart.submitSync();
					fail('Should throw an exception');
				}
				catch(e)
				{
					expect(e).toBe(exception);
				}
				
				Application.off('before:LiveOrder.submit', handler1);
				Application.off('before:LiveOrder.submit', handler2);
				Application.off('after:LiveOrder.submit', handler3);
				
				testContext.session.getOrder().removeItem(line_id);
			});

			it ('should trigger beforeSubmit and afterSubmit when submitSync', function ()
			{
				var cart = Application.getComponent('Cart');
				var handlers = {
					handler1: function handler1(data){
						expect(data).toEqual({});
					}
				,	handler3: function handler3(data){
						expect(data.result.internalid).toBeDefined();
						expect(data.result.summary).toBeDefined();
						expect(data.result.statuscode).toBe('success');
					}
				};

				try
				{
					var line_id = testContext.session.getOrder().addItem({
						internalid: dummy_line.item.internalid.toString()
					,	quantity: dummy_line.quantity
					,	options: dummy_line.options
					});
					
					var address_id = testContext.session.getCustomer().addAddress(shipping_address);
					testContext.session.getOrder().setShippingAddress(address_id);
					testContext.session.getOrder().setBillingAddress(address_id);

					testContext.session.getOrder().setPayment({
						paymentterms: 'CreditCard'
					,	creditcard: credit_card
					});

					testContext.session.getOrder().setTermsAndConditions(true);

					var shipping_methods = testContext.session.getOrder().getAvailableShippingMethods(['shipmethod', 'shipcarrier']);
				
					testContext.session.getOrder().setShippingMethod(_.first(shipping_methods));

					var items = testContext.session.getOrder().getItems([]);
					expect(items.length).toBe(1);
					var line = _.find(items, function(item){
						return item.orderitemid === line_id;
					});
					expect(line).toBeDefined();

					expect(cart).toBeDefined();
					expect(cart.submitSync).toBeDefined();
					expect(_.isFunction(cart.submitSync)).toBe(true);

					spyOn(handlers, 'handler1').and.callThrough();
					spyOn(handlers, 'handler3').and.callThrough();

					cart.on('beforeSubmit', handlers.handler1);
					cart.on('afterSubmit', handlers.handler3);
				
					var confirmation = cart.submitSync();
					
					expect(confirmation.internalid).toBeDefined();
					expect(confirmation.summary).toBeDefined();
					expect(confirmation.statuscode).toBe('success');
					
					expect(handlers.handler1).toHaveBeenCalled();
					expect(handlers.handler3).toHaveBeenCalled();
				}
				catch(e)
				{
					fail('Should not throw an exception\n' + e);
				}
				
				cart.off('beforeSubmit', handlers.handler1);
				cart.off('afterSubmit', handlers.handler3);
			});
		});

	});
});