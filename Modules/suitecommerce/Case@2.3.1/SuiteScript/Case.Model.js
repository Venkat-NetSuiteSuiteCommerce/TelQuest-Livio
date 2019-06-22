/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Case
define('Case.Model'
,	[
		'SC.Model'
	,	'Application'
	,	'Utils'
	,	'underscore'
	]
,	function (
		SCModel
	,	Application
	,	Utils
	,	_
	)
{
	'use strict';

	// @class Case.Model Defines the model used by the Case.Service.ss and Case.Fields.Service.ss services.
	// Handles fetching, creating and updating cases. @extends SCModel
	return SCModel.extend({
		name: 'Case'

		// @property configuration general settings
	,	configuration: SC.Configuration.cases

		// @property dummy_date for cases with no messages. Not common, but it could happen.
	,	dummy_date: new Date()

		// @method getNew
		// @returns a new Case record
	,	getNew: function ()
		{
			var case_record = nlapiCreateRecord('supportcase');

			var category_field = case_record.getField('category');
			var category_options = category_field.getSelectOptions();
			var category_option_values = [];

			_(category_options).each(function (category_option) {
				var category_option_value = {
					id: category_option.id
				,	text: category_option.text
				};

				category_option_values.push(category_option_value);
			});

			// Origins
			var origin_field = case_record.getField('origin');
			var origin_options = origin_field.getSelectOptions();
			var origin_option_values = [];

			_(origin_options).each(function (origin_option) {
				var origin_option_value = {
					id: origin_option.id
				,	text: origin_option.text
				};

				origin_option_values.push(origin_option_value);
			});

			// Statuses
			var status_field = case_record.getField('status');
			var status_options = status_field.getSelectOptions();
			var status_option_values = [];

			_(status_options).each(function (status_option) {
				var status_option_value = {
					id: status_option.id
				,	text: status_option.text
				};

				status_option_values.push(status_option_value);
			});

			// Priorities
			var priority_field = case_record.getField('priority');
			var priority_options = priority_field.getSelectOptions();
			var priority_option_values = [];

			_(priority_options).each(function (priority_option) {
				var priority_option_value = {
					id: priority_option.id
				,	text: priority_option.text
				};

				priority_option_values.push(priority_option_value);
			});

			// New record to return
			// @class Case.Fields.Model.Attributes
			var newRecord = {
				// @property {Array<Case.Fields.Model.Attributes.Category>} categories
				// @class Case.Fields.Model.Attributes.Category
					// @property {String} id
					// @property {String} text
				// @class Case.Fields.Model.Attributes
				categories: category_option_values

				// @property {Array<Case.Fields.Model.Attributes.Origin>} origins
				// @class Case.Fields.Model.Attributes.Origin
					// @property {String} id
					// @property {String} text
				// @class Case.Fields.Model.Attributes
			,	origins: origin_option_values

				// @property {Array<Case.Fields.Model.Attributes.Status>} statuses
				// @class Case.Fields.Model.Attributes.Status
					// @property {String} id
					// @property {String} text
				// @class Case.Fields.Model.Attributes
			,	statuses: status_option_values

				// @property {Array<Case.Fields.Model.Attributes.Priority>} priorities
				// @class Case.Fields.Model.Attributes.Priority
					// @property {String} id
					// @property {String} text
				// @class Case.Fields.Model.Attributes
			,	priorities: priority_option_values
			};

			// @class Case.Model
			return newRecord;
		}

		// @method getColumnsArray
		// Helper method for defining search columns.
	,	getColumnsArray: function ()
		{
			return [
				new nlobjSearchColumn('internalid')
			,	new nlobjSearchColumn('casenumber')
			,	new nlobjSearchColumn('title')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('origin')
			,	new nlobjSearchColumn('category')
			,	new nlobjSearchColumn('company')
			,	new nlobjSearchColumn('createddate')
			,	new nlobjSearchColumn('lastmessagedate')
			,	new nlobjSearchColumn('priority')
			,	new nlobjSearchColumn('email')
			];
		}

		// @method get
		// @param {String} id
		// @returns {Case.Model.Attributes}
	,	get: function (id)
		{
			var filters = [new nlobjSearchFilter('internalid', null, 'is', id),	new nlobjSearchFilter('isinactive', null, 'is', 'F')]
			,	columns = this.getColumnsArray()
			,	result = this.searchHelper(filters, columns, 1, true);

			if (result.records.length >= 1)
			{
				return result.records[0];
			}
			else
			{
				throw notFoundError;
			}
		}

		// @method get
		// @param {String} customer_id
		// @param {Object} list_header_data
		// @returns {Array<Case.Model.Attributes>}
	,	search: function (customer_id, list_header_data)
		{
			var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')]
			,	columns = this.getColumnsArray()
			,	selected_filter = parseInt(list_header_data.filter, 10);

			if (!_.isNaN(selected_filter))
			{
				filters.push(new nlobjSearchFilter('status', null, 'anyof', selected_filter));
			}

			this.setSortOrder(list_header_data.sort, list_header_data.order, columns);

			return this.searchHelper(filters, columns, list_header_data.page, false);
		}

		// @method searchHelper
		// @param {Array<String>} filters
		// @param {Array<String>} columns
		// @param {Number} page
		// @param {Boolean} join_messages
		// @returns {Array<Case.Model.Attributes>}
	,	searchHelper: function (filters, columns, page, join_messages)
		{
			var self = this
			,	result = Application.getPaginatedSearchResults({
					record_type: 'supportcase'
				,	filters: filters
				,	columns: columns
				,	page: page
				});

			result.records = _.map(result.records, function (case_record)
			{
				// @class Case.Model.Attributes
				var current_record_id = case_record.getId()
				,	created_date = nlapiStringToDate(case_record.getValue('createddate'))
				,	last_message_date = nlapiStringToDate(case_record.getValue('lastmessagedate'))
				,	support_case = {
						//@property {String} internalid
						internalid: current_record_id

						//@property {String} caseNumber
					,	caseNumber: case_record.getValue('casenumber')

						//@property {String} title
					,	title: case_record.getValue('title')

						// @property {Array<String, Case.Model.Attributes.Message>} grouped_messages
						// @class Case.Model.Attributes.Message
							// @property {String} author
							// @property {String} text
							// @property {String} messageDate
							// @property {String} initialDate
						// @class Case.Model.Attributes
					,	grouped_messages: []

						// @property {Case.Model.Attributes.Status} status
						// @class Case.Model.Attributes.Status
							// @property {String} id
							// @property {String} text
						// @class Case.Model.Attributes
					,	status: {
							id: case_record.getValue('status')
						,	name: case_record.getText('status')
						}

						// @property {Case.Model.Attributes.Origin} origin
						// @class Case.Model.Attributes.Origin
							// @property {String} id
							// @property {String} text
						// @class Case.Model.Attributes
					,	origin: {
							id: case_record.getValue('origin')
						,	name: case_record.getText('origin')
						}

						// @property {Case.Model.Attributes.Category} category
						// @class Case.Model.Attributes.Category
							// @property {String} id
							// @property {String} text
						// @class Case.Model.Attributes
					,	category: {
							id: case_record.getValue('category')
						,	name: case_record.getText('category')
						}

						// @property {Case.Model.Attributes.Company} company
						// @class Case.Model.Attributes.Company
							// @property {String} id
							// @property {String} text
						// @class Case.Model.Attributes
					,	company: {
							id: case_record.getValue('company')
						,	name: case_record.getText('company')
						}

						// @property {Case.Model.Attributes.Priority} priority
						// @class Case.Model.Attributes.Priority
							// @property {String} id
							// @property {String} text
						// @class Case.Model.Attributes
					,	priority: {
							id: case_record.getValue('priority')
						,	name: case_record.getText('priority')
						}
						//@property {String} createdDate
					,	createdDate: nlapiDateToString(created_date ? created_date : self.dummy_date, 'date')

						//@property {String} lastMessageDate
					,	lastMessageDate: nlapiDateToString(last_message_date ? last_message_date : self.dummy_date, 'date')

						//@property {String} email
					,	email: case_record.getValue('email')
					};

				if (join_messages)
				{
					self.appendMessagesToCase(support_case);
				}

				return support_case;
			});

			// @class Case.Model
			return result;
		}

		// @method stripHtmlFromMessage
		// @param {String} message with HTML
		// @returns {String} message without HTML
	,	stripHtmlFromMessage: function (message)
		{
			return message.replace(/<br\s*[\/]?>/gi, '\n').replace(/<(?:.|\n)*?>/gm, '');
		}

		// @method appendMessagesToCase When requesting a case detail, messages are included in the response.
		// @param {Case.Model.Attributes}
	,	appendMessagesToCase: function (support_case)
		{
			var message_columns = {
						message_col: new nlobjSearchColumn('message', 'messages')
					,	message_date_col: new nlobjSearchColumn('messagedate', 'messages').setSort(true)
					,	author_col: new nlobjSearchColumn('author', 'messages')
					,	message_id: new nlobjSearchColumn('internalid', 'messages')
				}
			,	message_filters = [new nlobjSearchFilter('internalid', null, 'is', support_case.internalid), new nlobjSearchFilter('internalonly', 'messages', 'is', 'F')]
			,	message_records = Application.getAllSearchResults('supportcase', message_filters, _.values(message_columns))
			,	grouped_messages = []
			,	messages_count = 0
			,	self = this;

			_(message_records).each(function (message_record)
			{
				var customer_id = nlapiGetUser() + ''
				,	message_date_tmp = nlapiStringToDate(message_record.getValue('messagedate', 'messages'))
				,	message_date = message_date_tmp ? message_date_tmp : self.dummy_date
				,	message_date_to_group_by = message_date.getFullYear() + '-' + (message_date.getMonth() + 1) + '-' + message_date.getDate()
				,	message = {
						author: message_record.getValue('author', 'messages') === customer_id ? 'You' : message_record.getText('author', 'messages')
					,	text: self.stripHtmlFromMessage(message_record.getValue('message', 'messages'))
					,	messageDate: nlapiDateToString(message_date, 'timeofday')
					,	internalid: message_record.getValue('internalid', 'messages')
					,	initialMessage: false
					};

				if (grouped_messages[message_date_to_group_by])
				{
					grouped_messages[message_date_to_group_by].messages.push(message);
				}
				else
				{
					grouped_messages[message_date_to_group_by] = {
						date: self.getMessageDate(message_date)
					,	messages: [message]
					};
				}

				messages_count ++;

				if (messages_count === message_records.length)
				{
					message.initialMessage = true;
				}
			});

			support_case.grouped_messages = _(grouped_messages).values();
			support_case.messages_count = messages_count;
		}

		// @method getMessageDate
		// @param {Date} validJsDate
		// @returns {String} string date with the correct format
	,	getMessageDate: function (validJsDate)
		{
			var today = new Date()
			,	today_dd = today.getDate()
			,	today_mm = today.getMonth()
			,	today_yyyy = today.getFullYear()
			,	dd = validJsDate.getDate()
			,	mm = validJsDate.getMonth()
			,	yyyy = validJsDate.getFullYear();

			if (today_dd === dd && today_mm === mm && today_yyyy === yyyy)
			{
				return 'Today';
			}

			return nlapiDateToString(validJsDate, 'date');
		}

		// @method create
		// Creates a new case record
		// @param {String} customerId
		// @param {Object} data
	,	create: function (customerId, data)
		{
			customerId = customerId || nlapiGetUser() + '';

			var newCaseRecord = nlapiCreateRecord('supportcase');

			data.title && newCaseRecord.setFieldValue('title', Utils.sanitizeString(data.title));
			data.message && newCaseRecord.setFieldValue('incomingmessage', Utils.sanitizeString(data.message));
			data.category && newCaseRecord.setFieldValue('category', data.category);
			data.email && newCaseRecord.setFieldValue('email', data.email);
			customerId && newCaseRecord.setFieldValue('company', customerId);

			var default_values = this.configuration.defaultValues;

			newCaseRecord.setFieldValue('status', default_values.statusStart.id); // Not Started
			newCaseRecord.setFieldValue('origin', default_values.origin.id); // Web

			return nlapiSubmitRecord(newCaseRecord);
		}

		// @method setSortOrder
		// Adds sort condition to the respective column
		// @param {String} sort column name
		// @param {Number} order
		// @param {Array} columns columns array
	,	setSortOrder: function (sort, order, columns)
		{
			switch (sort)
			{
				case 'createdDate':
					columns[7].setSort(order > 0);
				break;

				case 'lastMessageDate':
					columns[8].setSort(order > 0);
				break;

				default:
					columns[1].setSort(order > 0);
			}
		}

		// @method update
		// Updates a Support Case given its id
		// @param {String} id
		// @param {String} data
	,	update: function (id, data)
		{
			if (data && data.status)
			{
				if (data.reply && data.reply.length > 0)
				{
					nlapiSubmitField('supportcase', id, ['incomingmessage', 'messagenew', 'status'], [Utils.sanitizeString(data.reply), 'T', data.status.id]);
				}
				else
				{
					nlapiSubmitField('supportcase', id, ['status'], data.status.id);
				}
			}
		}
	});
});