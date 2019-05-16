/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*jshint laxcomma:true*/
define(
	[
		'UnitTest.OrderWizard.Module.Address.Preconditions'
	,	'Wizard.Module'
	,	'OrderWizard.Module.Address'
	,	'PaymentWizard.Router'
	,	'Address.Collection'
	,	'Address.Model'
	,	'LivePayment.Model'
	,	'Profile.Model'
	,	'Application'
	,	'Utils'
	,	'jasmine2-typechecking-matchers'
	]
,	function (
		Preconditions
	,	WizardModel
	,	OrderWizardModuleAddress
	,	Router
	,	AddressCollection
	,	AddressModel
	,	LivePaymentModel
	,	ProfileModel
	)
{
	'use strict';

	return describe('Order Wizard Module Address', function ()
	{
		var application = SC.Application('MyAccount')
		,	address_collection
		,	view
		,	live_payment_model = new LivePaymentModel({}, {application: application});

		beforeEach(function (){
			view = new OrderWizardModuleAddress({
				wizard: new Router(application, {
					profile: ProfileModel.getInstance()
				,	model: live_payment_model
				})
			});

			address_collection = new AddressCollection([{
					fullname: 'FULL NAME'
				,	addr1: 'ADDRESS 1'
				,	company: 'COMPANY'
				,	country: 'COUNTRY'
				,	state: 'STATE'
				,	city :'CITY'
				,	zip: 'ZIP'
				,	phone : '123456'
				}]);
		});

		describe('manageError', function ()
		{
			it('should call manageError on WizardModel when error param and code <> "ERR_CHK_INCOMPLETE_ADDRESS"', function () {
				spyOn(WizardModel.prototype,'manageError');
				view.manageError({
					errorCode:'foo'
				});
				expect(WizardModel.prototype.manageError).toHaveBeenCalled();
			});

			it('should NOT call manageError on WizardModel when not error param or code is "ERR_CHK_INCOMPLETE_ADDRESS"', function () {

				spyOn(WizardModel.prototype,'manageError');
				view.manageError({
					errorCode:'ERR_CHK_INCOMPLETE_ADDRESS'
				});
				expect(WizardModel.prototype.manageError).not.toHaveBeenCalled();

				view.manageError();
				expect(WizardModel.prototype.manageError).not.toHaveBeenCalled();
			});
		});

		describe('getAddressesToShow', function()
		{
			it ('should create a new address collection is the user is NOT guest', function ()
			{
				view.addresses = address_collection;
				view.isGuest = false;

				var result  = view.getAddressesToShow();

				expect(result.length).toBe(address_collection.length);
				expect(result.first()).toEqual(address_collection.first());
				expect(result.models).toEqual(address_collection.models);
			});

			it ('if the addresses collection is empty should return empty', function ()
			{
				var empty_address_collection = new AddressCollection([]);

				view.addresses = empty_address_collection;
				view.isGuest = false;

				var result  = view.getAddressesToShow();

				expect(result.length).toBe(empty_address_collection.length);
				expect(result.first()).toEqual(empty_address_collection.first());
			});

			xit ('when is not guest and the address collection is undefined should throw an error', function (){
				view.isGuest = false;

				expect(function(){view.getAddressesToShow();}).toThrow(new Error('Cannot read property \'models\' of undefined'));
			});

			it ('should return all the collection oif the user IS guest and SameAs fgeature is not enable', function ()
			{
				view.addresses = address_collection;
				view.isSameAsEnabled = false;
				view.isGuest = true;

				var result  = view.getAddressesToShow();

				expect(result.length).toBe(address_collection.length);
				expect(result.first()).toEqual(address_collection.first());
				expect(result.models).toEqual(address_collection.models);
			});

			it ('should return all the collection of the user IS guest and SameAs fgeature is not enable', function ()
			{
				address_collection.add({
					fullname: 'FULL NAME 2'
				,	addr1: 'ADDRESS 1 2'
				,	company: 'COMPANY 2'
				,	country: 'COUNTRY 2'
				,	state: 'STATE 2'
				,	city :'CITY 2'
				,	zip: 'ZIP 2'
				,	phone : '123456 2'
				});
				view.addresses = address_collection;
				view.isSameAsEnabled = false;
				view.isGuest = true;

				var result  = view.getAddressesToShow();

				expect(result.length).toBe(address_collection.length);
				expect(result.models).toEqual(address_collection.models);
			});

			it ('should filter SameAs address in case if IS guest and sameAs feature is enable', function ()
			{
				var internal_id = '12'
				,	fake_address_model = new AddressModel({
						fullname: 'FULL NAME 2'
					,	internalid: internal_id
					,	addr1: 'ADDRESS 1 2'
					,	company: 'COMPANY 2'
					,	country: 'COUNTRY 2'
					,	state: 'STATE 2'
					,	city :'CITY 2'
					,	zip: 'ZIP 2'
					,	phone : '123456 2'
					});
				fake_address_model.id = internal_id ; //Fake created model
				address_collection.add(fake_address_model);

				view.addresses = address_collection;
				view.isSameAsEnabled = true;
				view.sameAsManage = 'fake_address_id';
				view.model.set(view.sameAsManage, internal_id);
				view.isGuest = true;

				var result  = view.getAddressesToShow();

				expect(result.length).toBe(address_collection.length - 1);
				expect(result.findWhere({internalid: internal_id})).toBeUndefined();
			});

			it ('should return a new collection of address without filtering it when is guest and sameAs is enable but there is NOT sameAs address set', function ()
			{
				address_collection.add({
					fullname: 'FULL NAME 2'
				,	addr1: 'ADDRESS 1 2'
				,	company: 'COMPANY 2'
				,	country: 'COUNTRY 2'
				,	state: 'STATE 2'
				,	city :'CITY 2'
				,	zip: 'ZIP 2'
				,	phone : '123456 2'
				});
				view.addresses = address_collection;
				view.isSameAsEnabled = false;
				view.sameAsManage = 'fake_address_id';
				view.model.unset(view.sameAsManage);
				view.isGuest = true;

				var result  = view.getAddressesToShow();

				expect(result.length).toBe(address_collection.length);
				expect(result.models).toEqual(address_collection.models);
			});
		});

		describe('getEmptyAddress', function()
		{
			it ('returns a new empty Address Model if isSameAsEnabled is enable and sameAs is truthy', function () {

				view.isSameAsEnabled = true;
				view.sameAs = true;

				var result_adress_model = view.getEmptyAddress();

				expect(result_adress_model).toBeA(AddressModel);
				expect(result_adress_model.attributes).toEqual({});
			});

			it ('returns a new empty Address Model if isSameAsEnabled is NOT enable and the model doesnt have a temp address set', function () {

				view.isSameAsEnabled = true;
				view.sameAs = false;
				view.manage = 'billaddresss';
				view.model.unset('temp' + view.manage);

				var result_adress_model = view.getEmptyAddress();

				expect(result_adress_model).toBeA(AddressModel);
				expect(result_adress_model.attributes).toEqual({});
			});

			it ('returns a new empty Address Model if sameAs is NOT truthy and the model doesnt have a temp address set', function () {

				view.isSameAsEnabled = false;
				view.sameAs = true;
				view.manage = 'billaddress';
				view.model.unset('temp' + view.manage);

				var result_adress_model = view.getEmptyAddress();

				expect(result_adress_model).toBeA(AddressModel);
				expect(result_adress_model.attributes).toEqual({});
			});

			it ('returns a new empty Address Model if isSameAsEnabled is NOT enable and sameAs is NOT truthy and the model doesnt have a temp address set', function () {

				view.isSameAsEnabled = false;
				view.sameAs = false;
				view.manage = 'billaddresss';
				view.model.unset('temp' + view.manage);

				var result_adress_model = view.getEmptyAddress();

				expect(result_adress_model).toBeA(AddressModel);
				expect(result_adress_model.attributes).toEqual({});
			});

			it ('returns a new Address Model with the temp address copy if isSameAsEnabled is NOT enable or sameAs is NOT truthy', function () {

				view.isSameAsEnabled = false;
				view.sameAs = false;
				view.manage = 'billaddress';
				var temp_address_value = {test:'true'};
				view.model.set('temp' + view.manage, temp_address_value);

				var result_adress_model = view.getEmptyAddress();

				expect(result_adress_model).toBeA(AddressModel);

				expect(result_adress_model.attributes).toEqual(temp_address_value);
			});
		});

		describe('getFixedAddress', function ()
		{
			it('returns the first address getAddressesToShow of there is any', function()
			{
				var fake_address_model = new AddressModel();
				view.getAddressesToShow = jasmine.createSpy('fake get Addresses').and.callFake(function()
				{
					return new AddressCollection([fake_address_model]);
				});

				var result = view.getFixedAddress();

				expect(result).toEqual(fake_address_model);
			});

			it('otherwise return getEmptyAddress', function()
			{
				var fake_address_model = new AddressModel();
				view.getAddressesToShow = jasmine.createSpy('fake get Addresses').and.callFake(function()
				{
					return [];
				});
				view.getEmptyAddress= jasmine.createSpy('fake get emptyAddress').and.callFake(function ()
				{
					return fake_address_model;
				});

				var result = view.getFixedAddress();
				expect(result).toEqual(fake_address_model);
			});


			it('will throw excpetion if getAddressToShow returns null', function()
			{
				view.getAddressesToShow = jasmine.createSpy('fake get Addresses').and.callFake(function()
				{
					return null;
				});

				expect(function() {view.getFixedAddress();}).toThrow();
			});
		});

		describe('getTheOtherAddress', function()
		{
			it ('should return the adddress which id is the same as the model sameAsManage attribute if it is present', function ()
			{
				var internal_id = '12'
				,	fake_address_model = new AddressModel({
					fullname: 'FULL NAME 2'
				,	id : internal_id
				,	internalid : internal_id
				,	addr1: 'ADDRESS 1 2'
				,	company: 'COMPANY 2'
				,	country: 'COUNTRY 2'
				,	state: 'STATE 2'
				,	city :'CITY 2'
				,	zip: 'ZIP 2'
				,	phone : '123456 2'
				});
				view.sameAsManage = 'sameAsAddressId';
				view.model.set(view.sameAsManage, internal_id);

				address_collection.add(fake_address_model);
				view.addresses = address_collection;

				var result = view.getTheOtherAddress();
				expect(result).toEqual(fake_address_model);
			});

			it ('should return undefined when the model sameAsManage attribute it is not present', function ()
			{
				var internal_id = '12';
				view.sameAsManage = 'sameAsAddressId';
				view.model.set(view.sameAsManage, internal_id);

				view.addresses = address_collection;

				var result = view.getTheOtherAddress();
				expect(result).toBeUndefined();
			});
		});

		describe('getSelectedAddress', function ()
		{
			it ('should return the address of the addresses collection if address id is set', function ()
			{
				var internal_id = '12'
				,	fake_address_model = new AddressModel({
						fullname: 'FULL NAME 2'
					,	id : internal_id
					,	internalid : internal_id
					,	addr1: 'ADDRESS 1 2'
					,	company: 'COMPANY 2'
					,	country: 'COUNTRY 2'
					,	state: 'STATE 2'
					,	city :'CITY 2'
					,	zip: 'ZIP 2'
					,	phone : '123456 2'
					});
				address_collection.add(fake_address_model);
				view.addresses = address_collection;
				view.addressId = internal_id;

				var result = view.getSelectedAddress();
				expect(result).toEqual(fake_address_model);
			});

			it ('will return empty address if the address id is set but not present in the addresses collection', function ()
			{
				var internal_id = '12'
				,	fake_address_model = new AddressModel({
						fullname: 'FULL NAME 2'
					,	id : internal_id
					,	internalid : internal_id
					,	addr1: 'ADDRESS 1 2'
					,	company: 'COMPANY 2'
					,	country: 'COUNTRY 2'
					,	state: 'STATE 2'
					,	city :'CITY 2'
					,	zip: 'ZIP 2'
					,	phone : '123456 2'
					});
				view.getEmptyAddress = jasmine.createSpy('fake get empty address').and.callFake(function()
				{
					return fake_address_model;
				});
				view.addresses = new AddressCollection();
				view.addressId = internal_id;

				var result = view.getSelectedAddress();
				expect(result).toEqual(fake_address_model);
			});

			it ('should return a new address model in case the address id is not set and sameAs and tempAddress are truthy', function ()
			{
				view.addressId = false;
				view.sameAs = true;
				view.tempAddress = {key:'value'};

				var result = view.getSelectedAddress();

				expect(result).toBeA(AddressModel);
				expect(result.get('key')).toEqual('value');

			});

			it ('otherwise with an address id not set and if is guest it will retuen getFixedAddress', function ()
			{
				var expected_result = 'RESULT VALUE';
				view.addressId = false;
				view.sameAs = false;
				view.isGuest = true;
				view.getFixedAddress = jasmine.createSpy('fake get fixed address').and.callFake(function ()
				{
					return expected_result;
				});

				var result = view.getSelectedAddress();

				expect(result).toEqual(expected_result);

			});
		});

		describe('markSameAs', function ()
		{
			var address_called_result;

			beforeEach(function()
			{
				spyOn(view,'render');
				view.setAddress = jasmine.createSpy('fake set Address').and.callFake(function (param)
				{
					address_called_result = param;
				});
			});

			it ('should set sameAs, tempAddress call setAddress and render when set FALSE', function ()
			{
				view.sameAs = null;
				view.tempAddress = true;

				view.markSameAs(false);

				expect(view.render).toHaveBeenCalled();
				expect(view.sameAs).toBe(false);
				expect(view.tempAddress).toBe(null);
				expect(address_called_result).toBe(null);
			});

			it ('should set setAddress with model sameAsManage attribute on TRUE value', function ()
			{
				view.sameAs = null;
				view.tempAddress = true;
				view.sameAsManage = 'fake';
				var expected_result = 'RESULT';
				view.model.set(view.sameAsManage, expected_result);
				view.model.set('temp' + view.sameAsManage, expected_result);

				view.markSameAs(true);

				expect(view.sameAs).toBe(true);
				expect(address_called_result).toEqual(expected_result);
				expect(view.tempAddress).toEqual(expected_result);
			});
		});

		describe('isValid', function ()
		{
			it ('returns valid if there is a tempAddress', function ()
			{
				view.tempAddress = true;
				var result = view.isValid();

				expect(result.state()).toEqual('resolved');
			});

			it ('should return error if there is not tempAddress neither a selected address', function ()
			{
				view.tempAddress = true;
				var result = view.isValid();

				expect(result.state()).toEqual('resolved');
			});

			it ('should return valid if there is not tempAddress and do is a valid selected address', function ()
			{
				view.tempAddress = null;
				var internal_id = '12'
				,	fake_address_model = new AddressModel({
						fullname: 'FULL NAME 2'
					,	id : internal_id
					,	internalid : internal_id
					,	addr1: 'ADDRESS 1 2'
					,	company: 'COMPANY 2'
					,	country: 'COUNTRY 2'
					,	state: 'STATE 2'
					,	city :'CITY 2'
					,	zip: 'ZIP 2'
					,	phone : '123456 2'
					,	isvalid: 'T'
					});

				address_collection.add(fake_address_model);
				view.wizard.options.profile.set('addresses', address_collection, {silent:true});
				view.manage = 'billaddress';
				view.model.set(view.manage, internal_id);

				var result = view.isValid();

				expect(result.state()).toEqual('resolved');
			});

			it ('should return invalid if there is not temp address and the selected address is invalid', function ()
			{
				view.tempAddress = null;
				var internal_id = '12'
				,	fake_address_model = new AddressModel({
						fullname: 'FULL NAME 2'
					,	id : internal_id
					,	internalid : internal_id
					,	addr1: 'ADDRESS 1 2'
					,	company: 'COMPANY 2'
					,	country: 'COUNTRY 2'
					,	state: 'STATE 2'
					,	city :'CITY 2'
					,	zip: 'ZIP 2'
					,	phone : '123456 2'
					,	isvalid: 'F'
					});

				address_collection.add(fake_address_model);
				view.wizard.options.profile.set('addresses', address_collection, {silent:true});
				view.manage = 'billaddress';
				view.model.set(view.manage, internal_id);

				var result = view.isValid();

				expect(result.state()).toEqual('rejected');
				result.fail(function (e)
				{
					expect(e.errorCode).toBeDefined();
					expect(e.errorCode).toEqual(view.invalidAddressErrorMessage.errorCode);
				});
			});
		});

		describe('submit', function ()
		{
			it('should return isValid() if there is no addressView', function ()
			{
				var expected_result = 'RESULT';
				view.addressView = false;
				view.isValid = jasmine.createSpy('fake isValid').and.callFake(function()
				{
					return expected_result;
				});

				var result = view.submit();

				expect(result).toEqual(expected_result);
			});

			it('should save addressView form is there is any view', function ()
			{
				var fake_saveForm = jasmine.createSpy('fake save form').and.callFake(function()
					{
						return false;
					})
				,	fake_jQuery = function() {
						return {
							get: function() {}
						};
					};

				view.addressView = {
					saveForm: fake_saveForm
				,	$: fake_jQuery
				};

				view.submit();

				expect(view.addressView.saveForm).toHaveBeenCalled();
			});

			it('and if it returns falsy value should return invalid error', function ()
			{
				var fake_saveForm = jasmine.createSpy('fake save form').and.callFake(function()
					{
						return false;
					})
				,	fake_jQuery = function() {
						return {
							get: function() {}
						};
					};

				view.addressView = {
					saveForm: fake_saveForm
				,	$: fake_jQuery
				};

				var result = view.submit();

				expect(result.state()).toEqual('rejected');
			});

			it('otherwise should set the new address as the selected one and add it into the addressess collection, clear the temp address and render the view', function ()
			{
				var fake_saveForm = jasmine.createSpy('fake save form').and.callFake(function()
					{
						return jQuery.Deferred().resolve({internalid: 12});
					})
				,	fake_jQuery = function() {
						return {
							get: function() {}
						};
					};

				view.addressView = {
					saveForm: fake_saveForm
				,	$: fake_jQuery
				};
				view.addresses = address_collection;

				spyOn(view,'setAddress');
				spyOn(view.addresses,'add');
				spyOn(view,'render');

				var result = view.submit();

				expect(view.setAddress).toHaveBeenCalledWith(12);
				expect(view.render).toHaveBeenCalled();
				expect(view.addresses.add).toHaveBeenCalled();
			});
		});

		describe('changeAddress', function()
		{
			it ('should not execute is we pass is disable true', function ()
			{
				spyOn(view,'unsetAddress');
				view.changeAddress(true);

				expect(view.unsetAddress).not.toHaveBeenCalled();
			});

			it('should unset the address and navigate to edit if is disabled is false and options edit url is truthy', function ()
			{
				spyOn(view,'unsetAddress');
				view.options.edit_url = "MYURL";

				spyOn(Backbone.history, 'navigate');

				view.changeAddress(false);

				expect(view.unsetAddress).toHaveBeenCalledWith(true);
				expect(Backbone.history.navigate).toHaveBeenCalledWith('MYURL?force=true',{ trigger : true });
			});

			it ('will call unset address if is enabled and there is not edit url', function ()
			{
				spyOn(view,'unsetAddress');
				view.options.edit_url = false;

				view.changeAddress(false);

				expect(view.unsetAddress).toHaveBeenCalled();
			});
		});

		describe('unsetAddress', function()
		{
			it ('shoudl call setAddress and set temp address to null', function ()
			{
				spyOn(view,'render');
				spyOn(view,'setAddress');
				view.tempAddress = 'algo';

				view.unsetAddress(true, {test:'yes'});

				expect(view.setAddress).toHaveBeenCalledWith(null,{test:'yes'});
				expect(view.tempAddress).toEqual(null);
				expect(view.render).not.toHaveBeenCalled();
			});

			it ('and in case we pass false render should be called', function()
			{
				spyOn(view,'render');
				spyOn(view,'setAddress');
				view.tempAddress = 'algo';

				view.unsetAddress(false, {test:'yes'});

				expect(view.setAddress).toHaveBeenCalledWith(null,{test:'yes'});
				expect(view.tempAddress).toEqual(null);
				expect(view.render).toHaveBeenCalled();
			});
		});

		describe('setAddress', function()
		{
			it('should set the address id into the model with the specified options and set the address id attribute', function()
			{
				view.manage = 'billingaddress';

				var result = view.setAddress('12');

				expect(view.model.get(view.manage)).toEqual('12');
				expect(view.addressId).toEqual('12');
				expect(result).toEqual(view);
			});
		});

		describe('validateAddressRemoval', function()
		{
			beforeEach(function (){

				address_collection.add({
					id: 12345
				,	fullname: 'FULL NAME 2'
				,	addr1: 'ADDRESS 1 2'
				,	company: 'COMPANY 2'
				,	country: 'COUNTRY 2'
				,	state: 'STATE 2'
				,	city :'CITY 2'
				,	zip: 'ZIP 2'
				,	phone : '123456 2'
				});

				view.addresses = address_collection;

			});


			xit('should destroy address if not in use', function ()
			{
				// arrange
				spyOn(view,'isAddressIdValidForRemoval').and.returnValue(true);

				var address_to_delete = address_collection.at(1);
				spyOn(address_to_delete, 'destroy');
				spyOn(window, 'confirm').and.returnValue(true);

				// act
				view.validateAddressRemoval(address_to_delete.get('id'));

				// assert
				expect(address_to_delete.destroy).toHaveBeenCalled();
			});

			xit('MST: deleting an address in use by a package (billing or shipping) should prompt the user for confirmation', function ()
			{
				// arrange
				spyOn(view,'isAddressIdValidForRemoval').and.returnValue(true);

				spyOn(window, 'confirm').and.returnValue(false);

				// act
				view.validateAddressRemoval(1);

				// assert
				expect(window.confirm).toHaveBeenCalled();
			});

			xit('MST: deleting an address in use by a package (billing or shipping) should prompt the user for confirmation and not delete if cancel', function ()
			{
				// arrange
				spyOn(view,'isAddressIdValidForRemoval').and.returnValue(true);

				var address_to_delete = address_collection.at(1);
				spyOn(address_to_delete, 'destroy');
				spyOn(window, 'confirm').and.returnValue(false);

				// act
				view.validateAddressRemoval(address_to_delete.get('id'));

				// assert
				expect(address_to_delete.destroy).not.toHaveBeenCalled();
			});

			xit('MST: deleting an address in use by a package (billing or shipping) should prompt the user for confirmation and delete on confimation', function ()
			{
				// arrange
				spyOn(view,'isAddressIdValidForRemoval').and.returnValue(false);

				var address_to_delete = address_collection.at(1);
				spyOn(address_to_delete, 'destroy').and.callFake(function(e){
					e.success({});
				});
				spyOn(window, 'confirm').and.returnValue(true);
				spyOn(view, 'invalidAddressRemovalCheck');

				// act
				view.validateAddressRemoval(address_to_delete.get('id'));

				// assert
				expect(address_to_delete.destroy).toHaveBeenCalled();
				expect(view.invalidAddressRemovalCheck).toHaveBeenCalled();
			});
		});

		describe('invalidAddressRemovalCheck', function()
		{
			xit('should not navigate if select shipping address url is not configured on billing step', function ()
			{
				spyOn(Backbone.history, 'navigate');

				view.invalidAddressRemovalCheck();

				expect(Backbone.history.navigate).not.toHaveBeenCalled();
			});

			xit('should navigate to select shipping address url as configured on billing step', function ()
			{
				spyOn(Backbone.history, 'navigate');
				var expected_url = 'selectshipping/url';
				view.options.select_shipping_address_url = expected_url;

				view.invalidAddressRemovalCheck();

				expect(Backbone.history.navigate).toHaveBeenCalledWith(expected_url + '?force=true', { trigger: true });
			});
		});
	});
});