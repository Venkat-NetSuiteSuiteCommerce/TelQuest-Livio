/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/


// @module ExternalPayment
define(
	'ExternalPayment.Model'
,	[
		'SC.Model'
	,	'underscore'
	,	'SC.Models.Init'
	,	'SiteSettings.Model'
	,	'Utils'
	]
,	function (
		SCModel
	,	_
	,	ModelsInit
	,	SiteSettings
	,	Utils
	)
{
	'use strict';

	// @class ExternalPayment.Model
	// @extends SCModel
	return SCModel.extend({

		name: 'ExternalPayment'

	,	errorCode: ['externalPaymentValidationStatusFail', 'externalPaymentRequestInvalidParameters', 'externalPaymentMissingImplementation', 'externalPaymentRecordValidationStatusFail']

	,	generateUrl: function (id, record_type)
		{
			this.siteSettings = this.siteSettings || SiteSettings.get();

			var parameters = [
				'nltranid=' + id
			,	'orderId=' + id
			,	'n=' + this.siteSettings.siteid
			,	'recordType=' + record_type
			,	'goToExternalPayment=T'
			];

			return ModelsInit.session.getAbsoluteUrl('/external_payment.ssp?' + parameters.join('&'));
		}

	,	goToExternalPayment: function (request)
		{
			var record_type = request.getParameter('recordType')
			,	id = request.getParameter('orderId') || request.getParameter('nltranid')
			,	touchpoint = request.getParameter('touchpoint')
			,	result = {parameters: {}}
			,	record = this._loadRecord(record_type, id);

			if (!this._validateRecordStatus(record))
			{
				result.touchpoint = touchpoint;
				result.parameters.errorCode = 'externalPaymentValidationStatusFail';
			}
			else
			{
				ModelsInit.context.setSessionObject('external_nltranid_' + id, id);
				result.url = record.getFieldValue('redirecturl');
			}

			return result;
		}

	,	backFromExternalPayment: function (request)
		{
			var id = request.getParameter('orderId') || request.getParameter('nltranid')
			,	record_type = request.getParameter('recordType')
			,	touchpoint = request.getParameter('touchpoint')
			,	result = {
					touchpoint: touchpoint
				,	parameters: {
						nltranid: id
					,	recordType: record_type
					,	externalPayment: this._isDone(request, record_type) ? 'DONE' : (this._isReject(request, record_type) ? 'FAIL' : '')
					}
				};

			if (!this._preventDefault(request, record_type))
			{
				var record = this._loadRecord(record_type, id);

				if (!this._validateRecordStatus(record))
				{
					result.parameters.errorCode = 'externalPaymentRecordValidationStatusFail';
				}
				else if (!this._validateStatusFromRequest(request, record_type) || !this._validateTransactionId(id))
				{
					result.parameters.errorCode = 'externalPaymentRequestInvalidParameters';
				}
				else
				{
					var method_name = '_updatePaymentMethod' + record_type.toUpperCase();

					if (_.isFunction(this[method_name]))
					{
						this[method_name](record, request);
					}
					else
					{
						result.parameters.errorCode = 'externalPaymentMissingImplementation';
					}
				}
			}

			ModelsInit.context.setSessionObject('external_nltranid_' + id, '');

			return result;
		}

	,	getParametersFromRequest: function (request)
		{
			var nltranid = parseInt(request.getParameter('nltranid') || request.getParameter('orderId'), 10)
			,	record_type = request.getParameter('recordType')
			,	external_payment = request.getParameter('externalPayment')
			,	error_code = request.getParameter('errorCode')
			,	result;


			if ((external_payment === 'DONE' || external_payment === 'FAIL') && !_.isNaN(nltranid) && record_type && Utils.recordTypeExists(record_type))
			{
				result = {
					recordType: record_type
				,	nltranid: nltranid
				,	externalPayment: external_payment
				,	errorCode: error_code ? _.contains(this.errorCode, error_code) ? error_code : 'externalPaymentRequestInvalidParameters' : ''
				};
			}

			return result;
		}

	,	_updatePaymentMethodCUSTOMERPAYMENT: function (record, request)
		{
			var record_type = 'customerpayment';

			if (this._isDone(request, record_type))
			{
				record.setFieldValue('datafromredirect', this._getDataFromRedirect(request, record_type));
				record.setFieldValue('chargeit', 'T');

				nlapiSubmitRecord(record);
			}
		}

	,	_updatePaymentMethodSALESORDER: function (record, request)
		{
			var record_type = 'salesorder';

			if (this._isDone(request, record_type))
			{
				record.setFieldValue('datafromredirect', this._getDataFromRedirect(request, record_type));
				record.setFieldValue('getauth', 'T');
				record.setFieldValue('paymentprocessingmode', 'PROCESS');

				nlapiSubmitRecord(record, false, true);
			}

		}

	,	_isDone: function (request, record_type)
		{
			var status = this._getStatusFromRequest(request, record_type)
			,	status_accept_value = this._getConfiguration(record_type, 'statusAcceptValue', 'ACCEPT')
			,	status_hold_value = this._getConfiguration(record_type, 'statusHoldValue', 'HOLD');

			return status === status_accept_value || status === status_hold_value;
		}

	,	_isReject: function (request, record_type)
		{
			var status = this._getStatusFromRequest(request, record_type)
			,	status_reject_value = this._getConfiguration(record_type, 'statusRejectValue', 'REJECT');

			return status === status_reject_value;
		}

	,	_loadRecord: function (record_type, id)
		{
			return nlapiLoadRecord(record_type, id);
		}

	,	_validateRecordStatus: function (record)
		{
			return record.getFieldValue('paymenteventholdreason') === 'FORWARD_REQUESTED';
		}

	,	_getStatusFromRequest: function (request, record_type)
		{
			return request.getParameter(this._getConfiguration(record_type, 'statusParameterName' , 'status'));
		}

	,	_validateStatusFromRequest: function (request, record_type)
		{
			var status = this._getStatusFromRequest(request, record_type)
			,	status_accept_value = this._getConfiguration(record_type, 'statusAcceptValue' , 'ACCEPT')
			,	status_hold_value = this._getConfiguration(record_type, 'statusHoldValue' , 'HOLD')
			,	status_reject_value = this._getConfiguration(record_type, 'statusRejectValue' , 'REJECT');

			return status === status_accept_value || status === status_hold_value || status === status_reject_value;
		}

	,	_validateTransactionId: function (nltranid)
		{
			return ModelsInit.context.getSessionObject('external_nltranid_' + nltranid) === nltranid;
		}

	,	_getDataFromRedirect: function (request, record_type)
		{
			var request_parameters = request.getAllParameters()
			,	configration_parameters = this._getConfiguration(record_type, 'parameters' , ['tranid', 'authcode', 'status'])
			,	data_from_redirect = [];

			_.each(_.keys(request_parameters), function (parameter_name)
			{
				if (_.contains(configration_parameters, parameter_name))
				{
					data_from_redirect.push( parameter_name + '=' + request_parameters[parameter_name] );
				}
			});

			console.log(JSON.stringify(data_from_redirect));

			return data_from_redirect.join('&');
		}

	,	_preventDefault: function (request, record_type)
		{
			var prevent_default_value = this._getConfiguration(record_type, 'preventDefaultValue', 'T')
			,	prevent_default_parameter_name = this._getConfiguration(record_type, 'preventDefaultParameterName', 'preventDefault');

			return request.getParameter(prevent_default_parameter_name) === prevent_default_value;
		}


	,	_getConfiguration: function (record_type, property, default_value)
		{
			this.siteSettings = this.siteSettings || SiteSettings.get();

			var external_payment_configuration = this.siteSettings.externalPayment || {}
			,	record_configuration = external_payment_configuration[record_type.toUpperCase()] || {};

			if (_.isUndefined(record_configuration[property]))
			{
				return default_value;
			}
			else
			{
				return record_configuration[property];
			}
		}
	});
});
