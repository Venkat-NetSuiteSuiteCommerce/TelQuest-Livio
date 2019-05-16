//Models.Init.js
// Init.js
// -------
// Global variables to be used accross models
// This is the head of combined file Model.js

/* exported container, session, settings, customer, context, order */
var container = nlapiGetWebContainer()
	,	session = container.getShoppingSession()
//,	settings = session.getSiteSettings()
	,	customer = session.getCustomer()
	,	context = nlapiGetContext()
	,	order = session.getOrder();

//Model.js
// SiteSettings.js
// ---------------
// Pre-processes the SiteSettings to be used on the site
Application.defineModel('SiteSettings', {

	cache: nlapiGetCache('Application')

	// cache duration time in seconds - by default 2 hours - this value can be between 5 mins and 2 hours
	,	cacheTtl: SC.Configuration.cache.siteSettings

	,	get: function ()
	{
		'use strict';

		var basic_settings = session.getSiteSettings(['siteid', 'touchpoints']);

		// cache name contains the siteid so each site has its own cache.
		var settings = this.cache.get('siteSettings-' + basic_settings.siteid);

		if (!settings || !this.cacheTtl) {

			var i
				,	countries
				,	shipToCountries;

			settings = session.getSiteSettings();

			// 'settings' is a global variable and contains session.getSiteSettings()
			if (settings.shipallcountries === 'F')
			{
				if (settings.shiptocountries)
				{
					shipToCountries = {};

					for (i = 0; i < settings.shiptocountries.length; i++)
					{
						shipToCountries[settings.shiptocountries[i]] = true;
					}
				}
			}

			// Get all available countries.
			var allCountries = session.getCountries();

			if (shipToCountries)
			{
				// Remove countries that are not in the shipping contuntires
				countries = {};

				for (i = 0; i < allCountries.length; i++)
				{
					if (shipToCountries[allCountries[i].code])
					{
						countries[allCountries[i].code] = allCountries[i];
					}
				}
			}
			else
			{
				countries = {};

				for (i = 0; i < allCountries.length; i++)
				{
					countries[allCountries[i].code] = allCountries[i];
				}
			}

			// Get all the states for countries.
			var allStates = session.getStates();

			if (allStates)
			{
				for (i = 0; i < allStates.length; i++)
				{
					if (countries[allStates[i].countrycode])
					{
						countries[allStates[i].countrycode].states = allStates[i].states;
					}
				}
			}

			// Adds extra information to the site settings
			settings.countries = countries;
			settings.phoneformat = context.getPreference('phoneformat');
			settings.minpasswordlength = context.getPreference('minpasswordlength');
			settings.campaignsubscriptions = context.getFeature('CAMPAIGNSUBSCRIPTIONS');
			settings.analytics.confpagetrackinghtml = _.escape(settings.analytics.confpagetrackinghtml);

			// Other settings that come in window object
			settings.groupseparator = window.groupseparator;
			settings.decimalseparator = window.decimalseparator;
			settings.negativeprefix = window.negativeprefix;
			settings.negativesuffix = window.negativesuffix;
			settings.dateformat = window.dateformat;
			settings.longdateformat = window.longdateformat;
			settings.isMultiShippingRoutesEnabled = context.getSetting('FEATURE', 'MULTISHIPTO') === 'T' && SC.Configuration.isMultiShippingEnabled;

			this.cache.put('siteSettings-' + settings.siteid, JSON.stringify(settings), this.cacheTtl);
		}
		else
		{
			settings = JSON.parse(settings);
		}

		// never cache the following:
		settings.is_logged_in = session.isLoggedIn();
		settings.touchpoints = basic_settings.touchpoints;
		settings.shopperCurrency = session.getShopperCurrency();

		// delete unused fields
		delete settings.entrypoints;

		return settings;
	}
});

//Model.js
// Account.js
// ----------
// Handles account creation, login, logout and password reset
Application.defineModel('Account', {

	login: function (email, password, redirect)
	{
		'use strict';

		session.login({
			email: email
			,	password: password
		});

		var user = Application.getModel('Profile').get();
		user.isLoggedIn = session.isLoggedIn() ? 'T' : 'F';
		user.isRecognized = session.isRecognized() ? 'T' : 'F';

		var ret = {
			touchpoints: session.getSiteSettings(['touchpoints']).touchpoints
			,	user: user
		};

		if (!redirect)
		{
			var Environment = Application.getEnvironment(session, request)
				,	language = Environment && Environment.currentLanguage || {};
			language.url = language.locale && session.getAbsoluteUrl('checkout', '/languages/' + language.locale + '.js') || '';

			_.extend(ret, {
				cart: Application.getModel('LiveOrder').get()
				,	address: Application.getModel('Address').list()
				,	creditcard: Application.getModel('CreditCard').list()
				,	language: language
				,	currency: Environment && Environment.currentCurrency || ''
			});
		}

		return ret;
	}

	,	forgotPassword: function (email)
	{
		'use strict';

		try
		{
			// this API method throws an exception if the email doesnt exist
			// 'The supplied email has not been registered as a customer at our Web store.'
			session.sendPasswordRetrievalEmail(email);
		}
		catch (e)
		{
			var error = Application.processError(e);
			// if the customer failed to log in previously
			// the password retrival email is sent but an error is thrown
			if (error.errorCode !== 'ERR_WS_CUSTOMER_LOGIN')
			{
				throw e;
			}
		}

		return  {
			success: true
		};
	}

	,	resetPassword: function (params, password)
	{
		'use strict';

		if (!session.doChangePassword(params, password))
		{
			throw new Error('An error has occurred');
		}
		else
		{
			return {
				success: true
			};
		}
	}

	,	registerAsGuest: function ()
	{
		'use strict';

		var user = {}
			,	SiteSettings = Application.getModel('SiteSettings').get();

		if (SiteSettings.registration.companyfieldmandatory === 'T')
		{
			user.company = 'Guest Shopper';
		}
		session.registerGuest(user);

		user = Application.getModel('Profile').get();
		user.isLoggedIn = session.isLoggedIn() ? 'T' : 'F';
		user.isRecognized = session.isRecognized() ? 'T' : 'F';

		return {
			touchpoints: session.getSiteSettings(['touchpoints']).touchpoints
			,	user: user
			,	cart: Application.getModel('LiveOrder').get()
			,	address: Application.getModel('Address').list()
			,	creditcard: Application.getModel('CreditCard').list()
		};
	}

	// Check suitelet to verify if account already exists in NS
	,   getStatus: function (email)
	{
		'use strict';

		var subsidiary = session.getShopperSubsidiary();

		var duplicate_email_suitelet = nlapiResolveURL('SUITELET','customscript_ec_duplicate_email_check','customdeploy_ec_duplicate_email_check',true);
		var postdata = { email: email, subsidiary: subsidiary};

		var request = nlapiRequestURL(duplicate_email_suitelet, postdata);
		var response = JSON.parse(request.getBody());


		return {'dup': response.dup};
	}

	,	register: function (user_data)
	{
		'use strict';

		// var check_object = {
		// email: user_data.email
		// };

		// var duplicateRecords = nlapiSearchDuplicate('customer', check_object);
		// if (duplicateRecords && duplicateRecords.length)
		// {
		// throw new Error('You alerady have an account');
		// }

		var customer = session.getCustomer();

		/*************** Check for account status ***************/

		var response = this.getStatus(user_data.email);

		var is_dup = response.dup == true;

		if (is_dup) {

			throw new Error('This email is already in our system.  Please sign in or use the forgot password link to reset your password.');

		}

		/*************** Check for account status ***************/

		if (customer.isGuest())
		{
			var guest_data = customer.getFieldValues();

			customer.setLoginCredentials({
				internalid: guest_data.internalid
				,	email: user_data.email
				,	password: user_data.password
			});

			session.login({
				email: user_data.email
				,	password: user_data.password
			});

			customer = session.getCustomer();

			customer.updateProfile({
				internalid: guest_data.internalid
				,	firstname: user_data.firstname
				,	lastname: user_data.lastname
				,	company: user_data.company
				,	emailsubscribe: (user_data.emailsubscribe && user_data.emailsubscribe !== 'F') ? 'T' : 'F'
			});
		}
		else
		{
			user_data.emailsubscribe = (user_data.emailsubscribe && user_data.emailsubscribe !== 'F') ? 'T' : 'F';

			session.registerCustomer({
				firstname: user_data.firstname
				,	lastname: user_data.lastname
				,	companyname: user_data.company
				,	email:user_data.email
				,	password:user_data.password
				,	password2:user_data.password2
				,	emailsubscribe: (user_data.emailsubscribe && user_data.emailsubscribe !== 'F') ? 'T' : 'F'
			});
		}

		var user = Application.getModel('Profile').get();
		user.isLoggedIn = session.isLoggedIn() ? 'T' : 'F';
		user.isRecognized = session.isRecognized() ? 'T' : 'F';

		return {
			touchpoints: session.getSiteSettings(['touchpoints']).touchpoints
			,	user: user
			,	cart: Application.getModel('LiveOrder').get()
			,	address: Application.getModel('Address').list()
			,	creditcard: Application.getModel('CreditCard').list()
		};
	}
});

//Model.js
// Address.js
// ----------
// Handles fetching, creating and updating addresses
Application.defineModel('Address', {

	// model validation
	validation: {
		addressee: {required: true, msg: 'Full Name is required'}
		,	addr1: {required: true, msg: 'Address is required'}
		,	country: {required: true, msg: 'Country is required'}
		,	state: function (value, attr, computedState)
		{
			'use strict';

			var selected_country = computedState.country;

			if (selected_country && session.getStates([selected_country]) && !value)
			{
				return 'State is required';
			}
		}
		,	city: {required: true, msg: 'City is required'}
		,	zip: function (value, attr, computedState)
		{
			'use strict';

			var selected_country = computedState.country
				,	countries = session.getCountries();

			if (!selected_country && !value || selected_country && countries[selected_country] && countries[selected_country].isziprequired === 'T' && !value)
			{
				return 'State is required';
			}
		}
		,	phone: {required: true, msg: 'Phone Number is required'}
	}

// our model has "fullname" and "company" insted of  the fields "addresse" and "attention" used on netsuite.
// this function prepare the address object for sending it to the frontend
	,	wrapAddressee: function (address)
	{
		'use strict';

		if (address.attention && address.addressee)
		{
			address.fullname = address.attention;
			address.company = address.addressee;
		}
		else
		{
			address.fullname = address.addressee;
			address.company = null;
		}

		delete address.attention;
		delete address.addressee;

		return address;
	}

// this function prepare the address object for sending it to the frontend
	,	unwrapAddressee: function (address)
	{
		'use strict';

		if (address.company)
		{
			address.attention = address.fullname;
			address.addressee = address.company;
		}
		else
		{
			address.addressee = address.fullname;
			address.attention = null;
		}

		delete address.fullname;
		delete address.company;
		delete address.check;

		return address;
	}

// return an address by id
	,	get: function (id)
	{
		'use strict';

		return this.wrapAddressee(customer.getAddress(id));
	}

// return default billing address
	,	getDefaultBilling: function ()
	{
		'use strict';

		return _.find(customer.getAddressBook(), function (address)
		{
			return (address.defaultbilling === 'T');
		});
	}

// return default shipping address
	,	getDefaultShipping: function ()
	{
		'use strict';

		return _.find(customer.getAddressBook(), function (address)
		{
			return address.defaultshipping === 'T';
		});
	}

// returns all user's addresses
	,	list: function ()
	{
		'use strict';

		var self = this;

		return  _.map(customer.getAddressBook(), function (address)
		{
			return self.wrapAddressee(address);
		});
	}

// update an address
	,	update: function (id, data)
	{
		'use strict';

		data = this.unwrapAddressee(data);

		// validate the model
		this.validate(data);
		data.internalid = id;

		return customer.updateAddress(data);
	}

// add a new address to a customer
	,	create: function (data)
	{
		'use strict';

		data = this.unwrapAddressee(data);
		// validate the model
		this.validate(data);

		return customer.addAddress(data);
	}

// remove an address
	,	remove: function (id)
	{
		'use strict';

		return customer.removeAddress(id);
	}
});

//Model.js
// Profile.js
// ----------------
// This file define the functions to be used on profile service
Application.defineModel('Profile', {

	validation: {
		firstname: {required: true, msg: 'First Name is required'}

		// This code is commented temporally, because of the inconsistences between Checkout and My Account regarding the require data from profile information (Checkout can miss last name)
		,	lastname: {required: true, msg: 'Last Name is required'}

		,	email: {required: true, pattern: 'email', msg: 'Email is required'}
		,	confirm_email: {equalTo: 'email', msg: 'Emails must match'}
	}

	,	get: function ()
	{
		'use strict';

		var profile = {};

		//Only can you get the profile information if you are logged in.
		if (session.isLoggedIn()) {

			//Define the fields to be returned
			this.fields = this.fields || ['isperson', 'email', 'internalid', 'name', 'overduebalance', 'phoneinfo', 'companyname', 'firstname', 'lastname', 'middlename', 'emailsubscribe', 'campaignsubscriptions', 'paymentterms', 'creditlimit', 'balance', 'creditholdoverride'];

			profile = customer.getFieldValues(this.fields);

			//Make some attributes more friendly to the response
			profile.phone = profile.phoneinfo.phone;
			profile.altphone = profile.phoneinfo.altphone;
			profile.fax = profile.phoneinfo.fax;
			profile.priceLevel = (session.getShopperPriceLevel().internalid) ? session.getShopperPriceLevel().internalid : session.getSiteSettings(['defaultpricelevel']).defaultpricelevel;
			profile.type = profile.isperson ? 'INDIVIDUAL' : 'COMPANY';
			profile.isGuest = session.getCustomer().isGuest() ? 'T' : 'F';

			profile.creditlimit = parseFloat(profile.creditlimit || 0);
			profile.creditlimit_formatted = formatCurrency(profile.creditlimit);

			profile.balance = parseFloat(profile.balance || 0);
			profile.balance_formatted = formatCurrency(profile.balance);

			profile.balance_available = profile.creditlimit - profile.balance;
			profile.balance_available_formatted = formatCurrency(profile.balance_available);
		}

		return profile;
	}

	,	update: function (data)
	{
		'use strict';

		var login = nlapiGetLogin();

		if (data.current_password && data.password && data.password === data.confirm_password)
		{
			//Updating password
			return login.changePassword(data.current_password, data.password);
		}

		this.currentSettings = customer.getFieldValues();

		//Define the customer to be updated

		var customerUpdate = {
			internalid: parseInt(nlapiGetUser(), 10)
		};

		//Assign the values to the customer to be updated

		customerUpdate.firstname = data.firstname;

		if(data.lastname !== '')
		{
			customerUpdate.lastname = data.lastname;
		}

		if(this.currentSettings.lastname === data.lastname)
		{
			delete this.validation.lastname;
		}

		customerUpdate.companyname = data.companyname;


		customerUpdate.phoneinfo = {
			altphone: data.altphone
			,	phone: data.phone
			,	fax: data.fax
		};

		if(data.phone !== '')
		{
			customerUpdate.phone = data.phone;
		}

		if(this.currentSettings.phone === data.phone)
		{
			delete this.validation.phone;
		}

		customerUpdate.emailsubscribe = (data.emailsubscribe && data.emailsubscribe !== 'F') ? 'T' : 'F';

		if (!(this.currentSettings.companyname === '' || this.currentSettings.isperson || session.getSiteSettings(['registration']).registration.companyfieldmandatory !== 'T'))
		{
			this.validation.companyname = {required: true, msg: 'Company Name is required'};
		}

		if (!this.currentSettings.isperson)
		{
			delete this.validation.firstname;
			delete this.validation.lastname;
		}

		//Updating customer data
		if (data.email && data.email !== this.currentSettings.email && data.email === data.confirm_email)
		{
			if(data.isGuest === 'T')
			{
				customerUpdate.email = data.email;
			}
			else
			{
				login.changeEmail(data.current_password, data.email, true);
			}
		}

		// Patch to make the updateProfile call work when the user is not updating the email
		data.confirm_email = data.email;

		this.validate(data);
		// check if this throws error
		customer.updateProfile(customerUpdate);

		if (data.campaignsubscriptions)
		{
			customer.updateCampaignSubscriptions(data.campaignsubscriptions);
		}

		return this.get();

	}
});

//Model.js
/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https://groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
// LiveOrder.js
// -------
// Defines the model used by the live-order.ss service
// Available methods allow fetching and updating Shopping Cart's data
Application.defineModel('LiveOrder', {

	get: function (data)
	{
		'use strict';

		nlapiLogExecution('debug', 'LiveOrder.get', 'start');

		var order_fields = this.getFieldValues()
			,	result = {};

		try
		{
			result.lines = this.getLines(order_fields);
		}
		catch (e)
		{
			if (e.code === 'ERR_CHK_ITEM_NOT_FOUND')
			{
				return this.get();
			}
			else
			{
				throw e;
			}
		}

		order_fields = this.hidePaymentPageWhenNoBalance(order_fields);

		result.lines_sort = this.getLinesSort();
		result.latest_addition = context.getSessionObject('latest_addition');

		result.promocode = this.getPromoCode(order_fields);

		result.ismultishipto = this.getIsMultiShipTo(order_fields);
		// Ship Methods
		if (result.ismultishipto)
		{
			result.multishipmethods = this.getMultiShipMethods(result.lines);

			// These are set so it is compatible with non multiple shipping.
			result.shipmethods = [];
			result.shipmethod = null;
		}
		else
		{
			result.shipmethods = this.getShipMethods(order_fields);
			result.shipmethod = order_fields.shipmethod ? order_fields.shipmethod.shipmethod : null;
		}

		// Addresses
		result.addresses = this.getAddresses(order_fields);
		result.billaddress = order_fields.billaddress ? order_fields.billaddress.internalid : null;
		result.shipaddress = !result.ismultishipto ? order_fields.shipaddress.internalid : null;

		// Payment
		result.paymentmethods = this.getPaymentMethods(order_fields);

		// Paypal complete
		result.isPaypalComplete = context.getSessionObject('paypal_complete') === 'T';

		// Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints
		result.touchpoints = session.getSiteSettings(['touchpoints']).touchpoints;

		// Terms And Conditions
		result.agreetermcondition = order_fields.agreetermcondition === 'T';

		// Summary
		result.summary = order_fields.summary;

		// Transaction Body Field
		result.options = this.getTransactionBodyField();

		try {
			//nlapiLogExecution('debug', 'calling updateOrder', 'start');
			Application.getModel('Pacejet').updateOrder(result, order, data);

			//var original_shipmethod = order_fields.shipmethod ? order_fields.shipmethod.shipmethod : null;
			//var updated_shipmethod = result.shipmethod || null;
			//nlapiLogExecution('debug', 'original_shipmethod', original_shipmethod);
			//nlapiLogExecution('debug', 'updated_shipmethod', updated_shipmethod);
			//nlapiLogExecution('debug', 'order_fields', JSON.stringify(order_fields,null,2));

			// if the shipmethod has changed, update LiveOrder.  only in checkout.
			this.setShippingMethod(_.pick(result,['ismultishipto','shipmethod']), {
				shipmethod: order_fields.shipmethod,
				shipmethods: this.getShipMethods(order_fields)
			});
		}
		catch (e) {
			nlapiLogExecution('debug', 'calling updateOrder: exception', e);
		}

		return result;
	}

	,	update: function (data)
	{
		'use strict';

		nlapiLogExecution('debug', 'update: data.shipmethod', JSON.stringify(data.shipmethod,null,2));

		var current_order = this.get(data);
		nlapiLogExecution('debug', 'update: current_order.shipmethod', JSON.stringify(current_order.shipmethod,null,2));

		// Only do this if it's capable of shipping multiple items.
		if (this.isMultiShippingEnabled)
		{
			if (this.isSecure && this.isLoggedIn)
			{
				order.setEnableItemLineShipping(!!data.ismultishipto);
			}

			// Do the following only if multishipto is active (is the data recevie determine that MST is enabled and pass the MST Validation)
			if (data.ismultishipto)
			{
				order.removeShippingAddress();

				order.removeShippingMethod();

				this.removePromoCode(current_order);

				this.splitLines(data,current_order);

				this.setShippingAddressAndMethod(data, current_order);
			}
		}

		if (!this.isMultiShippingEnabled || !data.ismultishipto)
		{

			this.setShippingAddress(data, current_order);

			this.setShippingMethod(data, current_order);

			this.setPromoCode(data, current_order);
		}

		this.setBillingAddress(data, current_order);

		this.setPaymentMethods(data);

		this.setTermsAndConditions(data);

		this.setTransactionBodyField(data);

	}

	,	submit: function ()
	{
		'use strict';

		nlapiLogExecution('debug', 'LiveOrder.submit', 'start');
		nlapiLogExecution('debug', 'order.getFieldValues([shipmethod,shipmethods])', JSON.stringify(order.getFieldValues(['shipmethod','shipmethods']),null,2));

		var paypal_address = _.find(customer.getAddressBook(), function (address){ return !address.phone && address.isvalid === 'T'; })
			,	confirmation = order.submit();
		// We need remove the paypal's address because after order submit the address is invalid for the next time.
		this.removePaypalAddress(paypal_address);

		context.setSessionObject('paypal_complete', 'F');

		if (this.isMultiShippingEnabled)
		{
			order.setEnableItemLineShipping(false); // By default non order should be MST
		}

		return confirmation;
	}

	,	isSecure: request.getURL().indexOf('https') === 0

	,	isLoggedIn: session.isLoggedIn()

	,	isMultiShippingEnabled: context.getSetting('FEATURE', 'MULTISHIPTO') === 'T' && SC.Configuration.isMultiShippingEnabled

	,	addAddress: function (address, addresses)
	{
		'use strict';

		if (!address)
		{
			return null;
		}

		addresses = addresses || {};

		if (!address.fullname)
		{
			address.fullname = address.attention ? address.attention : address.addressee;
		}

		if (!address.company)
		{
			address.company = address.attention ? address.addressee : null;
		}

		delete address.attention;
		delete address.addressee;

		if (!address.internalid)
		{
			address.internalid =	(address.country || '') + '-' +
				(address.state || '') + '-' +
				(address.city || '') + '-' +
				(address.zip || '') + '-' +
				(address.addr1 || '') + '-' +
				(address.addr2 || '') + '-' +
				(address.fullname || '') + '-' +
				address.company;

			address.internalid = address.internalid.replace(/\s/g, '-');
		}

		if (address.internalid !== '-------null')
		{
			addresses[address.internalid] = address;
		}

		return address.internalid;
	}

	,	hidePaymentPageWhenNoBalance: function (order_fields)
	{
		'use strict';

		if (this.isSecure && this.isLoggedIn && order_fields.payment && session.getSiteSettings(['checkout']).checkout.hidepaymentpagewhennobalance === 'T' && order_fields.summary.total === 0)
		{
			order.removePayment();
			order_fields = this.getFieldValues();
		}
		return order_fields;
	}

	,	redirectToPayPal: function ()
	{
		'use strict';

		var touchpoints = session.getSiteSettings( ['touchpoints'] ).touchpoints
			,	continue_url = 'https://' + request.getHeader('Host') + touchpoints.checkout
			,	joint = ~continue_url.indexOf('?') ? '&' : '?';

		continue_url = continue_url + joint + 'paypal=DONE&fragment=' + request.getParameter('next_step');

		session.proceedToCheckout({
			cancelurl: touchpoints.viewcart
			,	continueurl: continue_url
			,	createorder: 'F'
			,	type: 'paypalexpress'
			,	shippingaddrfirst: 'T'
			,	showpurchaseorder: 'T'
		});
	}

	,	redirectToPayPalExpress: function ()
	{
		'use strict';

		var touchpoints = session.getSiteSettings( ['touchpoints'] ).touchpoints
			,	continue_url = 'https://' + request.getHeader('Host') + touchpoints.checkout
			,	joint = ~continue_url.indexOf('?') ? '&' : '?';

		continue_url = continue_url + joint + 'paypal=DONE';

		session.proceedToCheckout({
			cancelurl: touchpoints.viewcart
			,	continueurl: continue_url
			,	createorder: 'F'
			,	type: 'paypalexpress'
		});
	}

	,	backFromPayPal: function ()
	{
		'use strict';

		var Profile = Application.getModel('Profile')
			,	customer_values = Profile.get()
			,	bill_address = order.getBillingAddress()
			,	ship_address = order.getShippingAddress();

		if (customer_values.isGuest === 'T' && session.getSiteSettings(['registration']).registration.companyfieldmandatory === 'T')
		{
			customer_values.companyname = 'Guest Shopper';
			customer.updateProfile(customer_values);
		}

		if (ship_address.internalid && ship_address.isvalid === 'T' && !bill_address.internalid)
		{
			order.setBillingAddress(ship_address.internalid);
		}

		context.setSessionObject('paypal_complete', 'T');
	}

	// remove the shipping address or billing address if phone number is null (address not valid created by Paypal.)

	,	removePaypalAddress: function (paypal_address)
	{
		'use strict';

		try
		{
			if (paypal_address && paypal_address.internalid)
			{
				customer.removeAddress(paypal_address.internalid);
			}
		}
		catch (e)
		{
			// ignore this exception, it is only for the cases that we can't remove paypal's address.
			// This exception will not send to the front-end
			var error = Application.processError(e);
			console.log('Error ' + error.errorStatusCode + ': ' + error.errorCode + ' - ' + error.errorMessage);
		}
	}

	,	addLine: function (line_data)
	{
		'use strict';

		// Adds the line to the order
		var line_id = order.addItem({
			internalid: line_data.item.internalid.toString()
			,	quantity: _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
			,	options: line_data.options || {}
		});


		if (this.isMultiShippingEnabled)
		{
			// Sets it ship address (if present)
			line_data.shipaddress && order.setItemShippingAddress(line_id, line_data.shipaddress);

			// Sets it ship method (if present)
			line_data.shipmethod && order.setItemShippingMethod(line_id, line_data.shipmethod);
		}

		// Stores the latest addition
		context.setSessionObject('latest_addition', line_id);

		// Stores the current order
		var lines_sort = this.getLinesSort();
		lines_sort.unshift(line_id);
		this.setLinesSort(lines_sort);

		return line_id;
	}

	,	addLines: function (lines_data)
	{
		'use strict';

		var items = [];

		_.each(lines_data, function (line_data)
		{
			var item = {
				internalid: line_data.item.internalid.toString()
				,	quantity:  _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
				,	options: line_data.options || {}
			};

			items.push(item);
		});

		var lines_ids = order.addItems(items)
			,	latest_addition = _.last(lines_ids).orderitemid
		// Stores the current order
			,	lines_sort = this.getLinesSort();

		lines_sort.unshift(latest_addition);
		this.setLinesSort(lines_sort);

		context.setSessionObject('latest_addition', latest_addition);

		return lines_ids;
	}

	,	removeLine: function (line_id)
	{
		'use strict';

		// Removes the line
		order.removeItem(line_id);

		// Stores the current order
		var lines_sort = this.getLinesSort();
		lines_sort = _.without(lines_sort, line_id);
		this.setLinesSort(lines_sort);
	}

	,	updateLine: function (line_id, line_data)
	{
		'use strict';

		var lines_sort = this.getLinesSort()
			,	current_position = _.indexOf(lines_sort, line_id)
			,	original_line_object = order.getItem(line_id);

		this.removeLine(line_id);

		if (!_.isNumber(line_data.quantity) || line_data.quantity > 0)
		{
			var new_line_id;
			try
			{
				new_line_id = this.addLine(line_data);
			}
			catch (e)
			{
				// we try to roll back the item to the original state
				var roll_back_item = {
					item: { internalid: parseInt(original_line_object.internalid, 10) }
					,	quantity: parseInt(original_line_object.quantity, 10)
				};

				if (original_line_object.options && original_line_object.options.length)
				{
					roll_back_item.options = {};
					_.each(original_line_object.options, function (option)
					{
						roll_back_item.options[option.id.toLowerCase()] = option.value;
					});
				}

				new_line_id = this.addLine(roll_back_item);

				e.errorDetails = {
					status: 'LINE_ROLLBACK'
					,	oldLineId: line_id
					,	newLineId: new_line_id
				};

				throw e;
			}

			lines_sort = _.without(lines_sort, line_id, new_line_id);
			lines_sort.splice(current_position, 0, new_line_id);
			this.setLinesSort(lines_sort);
		}
	}

	,	splitLines: function (data, current_order)
	{
		'use strict';
		_.each(data.lines, function (line)
		{
			if (line.splitquantity)
			{
				var splitquantity = typeof line.splitquantity === 'string' ? parseInt(line.splitquantity,10) : line.splitquantity
					,	original_line = _.find(current_order.lines, function (order_line)
				{
					return order_line.internalid === line.internalid;
				})
					,	remaining = original_line ? (original_line.quantity - splitquantity) : -1;

				if (remaining > 0 && splitquantity > 0)
				{
					order.splitItem({
						'orderitemid' : original_line.internalid
						,	'quantities': [
							splitquantity
							,	remaining
						]
					});
				}
			}
		});
	}

	,	removePromoCode: function(current_order)
	{
		'use strict';
		if(current_order.promocode && current_order.promocode.code)
		{
			order.removePromotionCode(current_order.promocode.code);
		}
	}

	,	getFieldValues: function ()
	{
		'use strict';

		var order_field_keys = this.isSecure ? SC.Configuration.order_checkout_field_keys : SC.Configuration.order_shopping_field_keys;

		if (this.isMultiShippingEnabled)
		{
			if (!_.contains(order_field_keys.items, 'shipaddress'))
			{
				order_field_keys.items.push('shipaddress');
			}
			if (!_.contains(order_field_keys.items, 'shipmethod'))
			{
				order_field_keys.items.push('shipmethod');
			}
			order_field_keys.ismultishipto = null;
		}

		return order.getFieldValues(order_field_keys, false);
	}

	,	getPromoCode: function (order_fields)
	{
		'use strict';

		if (order_fields.promocodes && order_fields.promocodes.length)
		{
			return {
				internalid: order_fields.promocodes[0].internalid
				,	code: order_fields.promocodes[0].promocode
				,	isvalid: true
			};
		}
		else
		{
			return null;
		}
	}

	,	getMultiShipMethods: function (lines)
	{
		'use strict';
		// Get multi ship methods
		var multishipmethods = {};

		_.each(lines, function (line)
		{
			if (line.shipaddress)
			{
				multishipmethods[line.shipaddress] = multishipmethods[line.shipaddress] || [];

				multishipmethods[line.shipaddress].push(line.internalid);
			}
		});

		_.each(_.keys(multishipmethods), function (address)
		{
			var methods = order.getAvailableShippingMethods(multishipmethods[address], address);

			_.each(methods, function (method)
			{
				method.internalid = method.shipmethod;
				method.rate_formatted = formatCurrency(method.rate);
				delete method.shipmethod;
			});

			multishipmethods[address] = methods;
		});

		return multishipmethods;
	}

	,	getShipMethods: function (order_fields)
	{
		'use strict';

		var shipmethods = _.map(order_fields.shipmethods, function (shipmethod)
		{
			var rate = toCurrency(shipmethod.rate.replace( /^\D+/g, '')) || 0;

			return {
				internalid: shipmethod.shipmethod
				,	name: shipmethod.name
				,	shipcarrier: shipmethod.shipcarrier
				,	rate: rate
				,	rate_formatted: shipmethod.rate
			};
		});

		return shipmethods;
	}

	,	getLinesSort: function ()
	{
		'use strict';
		return context.getSessionObject('lines_sort') ? context.getSessionObject('lines_sort').split(',') : [];
	}

	,	getPaymentMethods: function (order_fields)
	{
		'use strict';
		var paymentmethods = []
			,	giftcertificates = order.getAppliedGiftCertificates()
			,	paypal = _.findWhere(session.getPaymentMethods(), {ispaypal: 'T'});

		if (order_fields.payment && order_fields.payment.creditcard && order_fields.payment.creditcard.paymentmethod && order_fields.payment.creditcard.paymentmethod.creditcard === 'T' && order_fields.payment.creditcard.paymentmethod.ispaypal !== 'T')
		{
			// Main
			var cc = order_fields.payment.creditcard;
			paymentmethods.push({
				type: 'creditcard'
				,	primary: true
				,	creditcard: {
					internalid: cc.internalid
					,	ccnumber: cc.ccnumber
					,	ccname: cc.ccname
					,	ccexpiredate: cc.expmonth + '/' + cc.expyear
					,	ccsecuritycode: cc.ccsecuritycode
					,	expmonth: cc.expmonth
					,	expyear: cc.expyear
					,	paymentmethod: {
						internalid: cc.paymentmethod.internalid
						,	name: cc.paymentmethod.name
						,	creditcard: cc.paymentmethod.creditcard === 'T'
						,	ispaypal: cc.paymentmethod.ispaypal === 'T'
					}
				}
			});
		}
		else if (order_fields.payment && paypal && paypal.internalid === order_fields.payment.paymentmethod)
		{
			paymentmethods.push({
				type: 'paypal'
				,	primary: true
				,	complete: context.getSessionObject('paypal_complete') === 'T'
			});
		}
		else if (order_fields.payment && order_fields.payment.paymentterms === 'Invoice')
		{
			var customer_invoice = customer.getFieldValues([
				'paymentterms'
				,	'creditlimit'
				,	'balance'
				,	'creditholdoverride'
			]);

			paymentmethods.push({
				type: 'invoice'
				,	primary: true
				,	paymentterms: customer_invoice.paymentterms
				,	creditlimit: parseFloat(customer_invoice.creditlimit || 0)
				,	creditlimit_formatted: formatCurrency(customer_invoice.creditlimit)
				,	balance: parseFloat(customer_invoice.balance || 0)
				,	balance_formatted: formatCurrency(customer_invoice.balance)
				,	creditholdoverride: customer_invoice.creditholdoverride
				,	purchasenumber: order_fields.purchasenumber
			});
		}

		if (giftcertificates && giftcertificates.length)
		{
			_.forEach(giftcertificates, function (giftcertificate)
			{
				paymentmethods.push({
					type: 'giftcertificate'
					,	giftcertificate: {
						code: giftcertificate.giftcertcode

						,	amountapplied: toCurrency(giftcertificate.amountapplied || 0)
						,	amountapplied_formatted: formatCurrency(giftcertificate.amountapplied || 0)

						,	amountremaining: toCurrency(giftcertificate.amountremaining || 0)
						,	amountremaining_formatted: formatCurrency(giftcertificate.amountremaining || 0)

						,	originalamount: toCurrency(giftcertificate.originalamount || 0)
						,	originalamount_formatted: formatCurrency(giftcertificate.originalamount || 0)
					}
				});
			});
		}

		return paymentmethods;
	}

	,	getTransactionBodyField: function ()
	{
		'use strict';

		var options = {};

		if (this.isSecure)
		{
			_.each(order.getCustomFieldValues(), function (option)
			{
				options[option.name] = option.value;
			});

		}
		return options;
	}

	,	getAddresses: function (order_fields)
	{
		'use strict';

		var self = this
			,	addresses = {}
			,	address_book = this.isLoggedIn && this.isSecure ? customer.getAddressBook() : [];

		address_book = _.object(_.pluck(address_book, 'internalid'), address_book);
		// General Addresses
		if (order_fields.ismultishipto === 'T')
		{
			_.each(order_fields.items || [], function (line)
			{
				if (line.shipaddress && !addresses[line.shipaddress])
				{
					self.addAddress(address_book[line.shipaddress], addresses);
				}
			});
		}
		else
		{
			this.addAddress(order_fields.shipaddress, addresses);
		}

		this.addAddress(order_fields.billaddress, addresses);

		return _.values(addresses);
	}

	// Set Order Lines into the result
	// Standarizes the result of the lines
	,	getLines: function (order_fields)
	{
		'use strict';

		var lines = [];
		if (order_fields.items && order_fields.items.length)
		{
			var self = this
				,	items_to_preload = []
				,	address_book = this.isLoggedIn && this.isSecure ? customer.getAddressBook() : []
				,	item_ids_to_clean = [];

			address_book = _.object(_.pluck(address_book, 'internalid'), address_book);

			_.each(order_fields.items, function (original_line)
			{
				// Total may be 0
				var	total = (original_line.promotionamount) ? toCurrency(original_line.promotionamount) : toCurrency(original_line.amount)
					,	discount = toCurrency(original_line.promotiondiscount) || 0
					,	line_to_add
					,	is_shippable = original_line.isfulfillable !== false;

				line_to_add = {
					internalid: original_line.orderitemid
					,	quantity: original_line.quantity
					,	rate: parseFloat(original_line.rate)
					,	rate_formatted: original_line.rate_formatted
					,	amount: toCurrency(original_line.amount)
					,	tax_amount: 0
					,	tax_rate: null
					,	tax_code: null
					,	discount: discount
					,	total: total
					,	item: original_line.internalid
					,	itemtype: original_line.itemtype
					,	isshippable: is_shippable
					,	options: original_line.options
					,	shipaddress: original_line.shipaddress
					,	shipmethod: original_line.shipmethod
					,	custitem_pacejet_item_length: original_line.custitem_pacejet_item_length
					,	custitem_pacejet_item_width: original_line.custitem_pacejet_item_width
					,	custitem_pacejet_item_height: original_line.custitem_pacejet_item_height
				};

				lines.push(line_to_add);

				if (line_to_add.shipaddress && !address_book[line_to_add.shipaddress])
				{
					line_to_add.shipaddress = null;
					line_to_add.shipmethod = null;
					item_ids_to_clean.push(line_to_add.internalid);
				}
				else
				{
					items_to_preload.push({
						id: original_line.internalid
						,	type: original_line.itemtype
					});
				}
			});

			if (item_ids_to_clean.length)
			{
				order.setItemShippingAddress(item_ids_to_clean, null);
				order.setItemShippingMethod(item_ids_to_clean, null);
			}

			var store_item = Application.getModel('StoreItem')
				,	restart = false;

			store_item.preloadItems(items_to_preload);

			lines.forEach(function (line)
			{
				line.item = store_item.get(line.item, line.itemtype);

				if (!line.item)
				{
					self.removeLine(line.internalid);
					restart = true;
				}
				else
				{
					line.rate_formatted = formatCurrency(line.rate);
					line.amount_formatted = formatCurrency(line.amount);
					line.tax_amount_formatted = formatCurrency(line.tax_amount);
					line.discount_formatted = formatCurrency(line.discount);
					line.total_formatted = formatCurrency(line.total);
				}
			});

			if (restart)
			{
				throw {code: 'ERR_CHK_ITEM_NOT_FOUND'};
			}

			// Sort the items in the order they were added, this is because the update operation alters the order
			var lines_sort = this.getLinesSort();

			if (lines_sort.length)
			{
				lines = _.sortBy(lines, function (line)
				{
					return _.indexOf(lines_sort, line.internalid);
				});
			}
			else
			{
				this.setLinesSort(_.pluck(lines, 'internalid'));
			}
		}

		return lines;
	}

	,	getIsMultiShipTo: function (order_fields)
	{
		'use strict';
		return this.isMultiShippingEnabled && order_fields.ismultishipto === 'T';
	}

	,	setLinesSort: function (lines_sort)
	{
		'use strict';
		return context.setSessionObject('lines_sort', lines_sort || []);
	}

	,	setBillingAddress: function (data, current_order)
	{
		'use strict';

		if (data.sameAs)
		{
			data.billaddress = data.shipaddress;
		}

		if (data.billaddress !== current_order.billaddress)
		{
			if (data.billaddress)
			{
				if (data.billaddress && !~data.billaddress.indexOf('null'))
				{
					// Heads Up!: This "new String" is to fix a nasty bug
					order.setBillingAddress(new String(data.billaddress).toString());
				}
			}
			else if (this.isSecure)
			{
				order.removeBillingAddress();
			}
		}
	}

	,	setShippingAddressAndMethod: function (data, current_order)
	{
		'use strict';

		var current_package
			,	packages = {}
			,	item_ids_to_clean = []
			,	original_line;

		_.each(data.lines, function (line)
		{
			original_line = _.find(current_order.lines, function (order_line)
			{
				return order_line.internalid === line.internalid;
			});

			if (original_line && original_line.isshippable)
			{
				if (line.shipaddress)
				{
					packages[line.shipaddress] = packages[line.shipaddress] || {
							shipMethodId: null,
							itemIds: []
						};

					packages[line.shipaddress].itemIds.push(line.internalid);
					if (!packages[line.shipaddress].shipMethodId && line.shipmethod)
					{
						packages[line.shipaddress].shipMethodId = line.shipmethod;
					}
				}
				else
				{
					item_ids_to_clean.push(line.internalid);
				}
			}
		});

		//CLEAR Shipping address and shipping methods
		if (item_ids_to_clean.length)
		{
			order.setItemShippingAddress(item_ids_to_clean, null);
			order.setItemShippingMethod(item_ids_to_clean, null);
		}

		//SET Shipping address and shipping methods
		_.each(_.keys(packages), function (address_id)
		{
			current_package = packages[address_id];
			order.setItemShippingAddress(current_package.itemIds, parseInt(address_id, 10));

			if (current_package.shipMethodId)
			{
				order.setItemShippingMethod(current_package.itemIds, parseInt(current_package.shipMethodId, 10));
			}
		});
	}

	,	setShippingAddress: function (data, current_order)
	{
		'use strict';

		if (data.shipaddress !== current_order.shipaddress)
		{
			if (data.shipaddress)
			{
				if (this.isSecure && !~data.shipaddress.indexOf('null'))
				{
					// Heads Up!: This "new String" is to fix a nasty bug
					order.setShippingAddress(new String(data.shipaddress).toString());
				}
				else
				{
					var address = _.find(data.addresses, function (address)
					{
						return address.internalid === data.shipaddress;
					});

					address && order.estimateShippingCost(address);
				}
			}
			else if (this.isSecure)
			{
				order.removeShippingAddress();
			}
			else
			{
				order.estimateShippingCost({
					zip: null
					,	country: null
				});
			}
		}
	}

	,	setPaymentMethods: function (data)
	{
		'use strict';

		// Because of an api issue regarding Gift Certificates, we are going to handle them separately
		var gift_certificate_methods = _.where(data.paymentmethods, {type: 'giftcertificate'})
			,	non_certificate_methods = _.difference(data.paymentmethods, gift_certificate_methods);

		// Payment Methods non gift certificate
		if (this.isSecure && non_certificate_methods && non_certificate_methods.length && this.isLoggedIn)
		{
			_.sortBy(non_certificate_methods, 'primary').forEach(function (paymentmethod)
			{

				if (paymentmethod.type === 'creditcard' && paymentmethod.creditcard)
				{

					var credit_card = paymentmethod.creditcard
						,	require_cc_security_code = session.getSiteSettings(['checkout']).checkout.requireccsecuritycode === 'T'
						,	cc_obj = credit_card && {
							internalid: credit_card.internalid
							,	ccnumber: credit_card.ccnumber
							,	ccname: credit_card.ccname
							,	ccexpiredate: credit_card.ccexpiredate
							,	expmonth: credit_card.expmonth
							,	expyear:  credit_card.expyear
							,	paymentmethod: {
								internalid: credit_card.paymentmethod.internalid
								,	name: credit_card.paymentmethod.name
								,	creditcard: credit_card.paymentmethod.creditcard ? 'T' : 'F'
								,	ispaypal:  credit_card.paymentmethod.ispaypal ? 'T' : 'F'
							}
						};

					if (credit_card.ccsecuritycode)
					{
						cc_obj.ccsecuritycode = credit_card.ccsecuritycode;
					}

					if (!require_cc_security_code || require_cc_security_code && credit_card.ccsecuritycode)
					{
						// the user's default credit card may be expired so we detect this using try&catch and if it is we remove the payment methods.
						try
						{
							order.removePayment();

							order.setPayment({
								paymentterms: 'CreditCard'
								,	creditcard: cc_obj
							});

							context.setSessionObject('paypal_complete', 'F');
						}
						catch (e)
						{
							if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT')
							{
								order.removePayment();
							}
							throw e;
						}
					}
					// if the the given credit card don't have a security code and it is required we just remove it from the order
					else if (require_cc_security_code && !credit_card.ccsecuritycode)
					{
						order.removePayment();
					}
				}
				else if (paymentmethod.type === 'invoice')
				{
					order.removePayment();

					try
					{
						order.setPayment({ paymentterms: 'Invoice' });
					}
					catch (e)
					{
						if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT')
						{
							order.removePayment();
						}
						throw e;
					}


					paymentmethod.purchasenumber && order.setPurchaseNumber(paymentmethod.purchasenumber);

					context.setSessionObject('paypal_complete', 'F');
				}
				else if (paymentmethod.type === 'paypal' && context.getSessionObject('paypal_complete') === 'F')
				{
					order.removePayment();

					var paypal = _.findWhere(session.getPaymentMethods(), {ispaypal: 'T'});
					paypal && order.setPayment({paymentterms: '', paymentmethod: paypal.internalid});
				}
			});
		}
		else if (this.isSecure && this.isLoggedIn)
		{
			order.removePayment();
		}

		gift_certificate_methods = _.map(gift_certificate_methods, function (gift_certificate) { return gift_certificate.giftcertificate; });
		this.setGiftCertificates(gift_certificate_methods);
	}

	,	setGiftCertificates:  function (gift_certificates)
	{
		'use strict';

		// Remove all gift certificates so we can re-enter them in the appropriate order
		order.removeAllGiftCertificates();

		_.forEach(gift_certificates, function (gift_certificate)
		{
			order.applyGiftCertificate(gift_certificate.code);
		});
	}

	,	setShippingMethod: function (data, current_order)
	{
		'use strict';

		if ((!this.isMultiShippingEnabled || !data.ismultishipto) && this.isSecure && data.shipmethod !== current_order.shipmethod)
		{
			var shipmethod = _.findWhere(current_order.shipmethods, {internalid: data.shipmethod});

			if (shipmethod)
			{
				order.setShippingMethod({
					shipmethod: shipmethod.internalid
					,	shipcarrier: shipmethod.shipcarrier
				});
			}
			else
			{
				order.removeShippingMethod();
			}
		}
	}

	,	setPromoCode: function (data, current_order)
	{
		'use strict';
		if (data.promocode && (!current_order.promocode || data.promocode.code !== current_order.promocode.code))
		{
			try
			{
				order.applyPromotionCode(data.promocode.code);
			}
			catch (e)
			{
				order.removePromotionCode(data.promocode.code);
				current_order.promocode && order.removePromotionCode(current_order.promocode.code);
				throw e;
			}
		}
		else if (!data.promocode && current_order.promocode)
		{
			order.removePromotionCode(current_order.promocode.code);
		}
	}

	,	setTermsAndConditions: function(data)
	{
		'use strict';
		var require_terms_and_conditions = session.getSiteSettings(['checkout']).checkout.requiretermsandconditions;

		if (require_terms_and_conditions.toString() === 'T' && this.isSecure && !_.isUndefined(data.agreetermcondition))
		{
			order.setTermsAndConditions(data.agreetermcondition);
		}
	}

	,	setTransactionBodyField: function(data)
	{
		'use strict';
		// Transaction Body Field
		if (this.isSecure && !_.isEmpty(data.options))
		{
			order.setCustomFieldValues(data.options);
		}
	}

});


//Model.js
// CreditCard.js
// ----------------
// This file define the functions to be used on Credit Card service
Application.defineModel('CreditCard', {

	validation: {
		ccname: {required: true, msg: 'Name is required'}
		,	paymentmethod: {required: true, msg: 'Card Type is required'}
		,	ccnumber: {required: true, msg: 'Card Number is required'}
		,	expmonth: {required: true, msg: 'Expiration is required'}
		,	expyear: {required: true, msg: 'Expiration is required'}
	}

	,	get: function (id)
	{
		'use strict';

		//Return a specific credit card
		return customer.getCreditCard(id);
	}

	,	getDefault: function ()
	{
		'use strict';

		//Return the credit card that the customer setted to default
		return _.find(customer.getCreditCards(), function (credit_card)
		{
			return credit_card.ccdefault === 'T';
		});
	}

	,	list: function ()
	{
		'use strict';

		//Return all the credit cards with paymentmethod
		return _.filter(customer.getCreditCards(), function (credit_card)
		{
			return credit_card.paymentmethod;
		});
	}

	,	update: function (id, data)
	{
		'use strict';

		//Update the credit card if the data is valid
		this.validate(data);
		data.internalid = id;

		return customer.updateCreditCard(data);
	}

	,	create: function (data)
	{
		'use strict';

		//Create a new credit card if the data is valid
		this.validate(data);

		return customer.addCreditCard(data);
	}

	,	remove: function (id)
	{
		'use strict';

		//Remove a specific credit card
		return customer.removeCreditCard(id);
	}
});

//Model.js
// StoreItem.js
// ----------
// Handles the fetching of items information for a collection of order items
// If you want to fetch multiple items please use preloadItems before/instead calling get() multiple times.

/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https:// groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
Application.defineModel('StoreItem', {

	// Returns a collection of items with the items iformation
	// the 'items' parameter is an array of objects {id,type}
	preloadItems: function (items)
	{
		'use strict';

		var self = this
			,	items_by_id = {}
			,	parents_by_id = {};

		items = items || [];

		this.preloadedItems = this.preloadedItems || {};

		items.forEach(function (item)
		{
			if (!item.id || !item.type || item.type === 'Discount' || item.type === 'OthCharge' || item.type === 'Markup')
			{
				return;
			}
			if (!self.preloadedItems[item.id])
			{
				items_by_id[item.id] = {
					internalid: new String(item.id).toString()
					,	itemtype: item.type
					,	itemfields: SC.Configuration.items_fields_standard_keys
				};
			}
		});

		if (!_.size(items_by_id))
		{
			return this.preloadedItems;
		}

		var items_details = this.getItemFieldValues(items_by_id);

		// Generates a map by id for easy access. Notice that for disabled items the array element can be null
		_.each(items_details, function (item)
		{
			if (item && typeof item.itemid !== 'undefined')
			{
				if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child')
				{
					parents_by_id[item.itemoptions_detail.parentid] = {
						internalid: new String(item.itemoptions_detail.parentid).toString()
						,	itemtype: item.itemtype
						,	itemfields: SC.Configuration.items_fields_standard_keys
					};
				}

				self.preloadedItems[item.internalid] = item;
			}
		});

		if (_.size(parents_by_id))
		{
			var parents_details = this.getItemFieldValues(parents_by_id);

			_.each(parents_details, function (item)
			{
				if (item && typeof item.itemid !== 'undefined')
				{
					self.preloadedItems[item.internalid] = item;
				}
			});
		}

		// Adds the parent inforamtion to the child
		_.each(this.preloadedItems, function (item)
		{
			if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child')
			{
				item.matrix_parent = self.preloadedItems[item.itemoptions_detail.parentid];
			}
		});

		return this.preloadedItems;
	}

	,	getItemFieldValues: function (items_by_id)
	{
		'use strict';

		var	item_ids = _.values(items_by_id)
			,	is_advanced = session.getSiteSettings(['sitetype']).sitetype === 'ADVANCED';

		// Check if we have access to fieldset
		if (is_advanced)
		{
			try
			{
				// SuiteCommerce Advanced website have fieldsets
				return session.getItemFieldValues(SC.Configuration.items_fields_advanced_name, _.pluck(item_ids, 'internalid')).items;
			}
			catch (e)
			{
				throw invalidItemsFieldsAdvancedName;
			}
		}
		else
		{
			// Sitebuilder website version doesn't have fieldsets
			return session.getItemFieldValues(item_ids);
		}
	}

	// Return the information for the given item
	,	get: function (id, type)
	{
		'use strict';

		this.preloadedItems = this.preloadedItems || {};

		if (!this.preloadedItems[id])
		{
			this.preloadItems([{
				id: id
				,	type: type
			}]);
		}
		return this.preloadedItems[id];
	}

	,	set: function (item)
	{
		'use strict';

		this.preloadedItems = this.preloadedItems || {};

		if (item.internalid)
		{
			this.preloadedItems[item.internalid] = item;
		}
	}
});

