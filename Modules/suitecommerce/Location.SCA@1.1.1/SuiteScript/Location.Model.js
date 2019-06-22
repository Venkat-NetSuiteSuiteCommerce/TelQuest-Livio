/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('Location.Model'
,   [
		'SC.Model'
	,   'Application'
	,   'Utils'
	,	'Models.Init'
	,	'SiteSettings.Model'
	,   'underscore'
	]
,   function (
		SCModel
	,   Application
	,   Utils
	,	ModelsInit
	,	SiteSettings
	,   _
	)
{
	'use strict';

	// @class Location.Model
	// @extends SCModel
	return SCModel.extend({
		name: 'Location'
	,	columns: {
			'address1': new nlobjSearchColumn('address1')
		,	'address2': new nlobjSearchColumn('address2')
		,	'address3': new nlobjSearchColumn('address3')
		,	'city': new nlobjSearchColumn('city')
		,	'country': new nlobjSearchColumn('country')
		,	'state': new nlobjSearchColumn('state')
		,	'internalid': new nlobjSearchColumn('internalid')
		,	'isinactive': new nlobjSearchColumn('isinactive')
		,	'isoffice': new nlobjSearchColumn('isoffice')
		,	'makeinventoryavailable': new nlobjSearchColumn('makeinventoryavailable')
		,	'makeinventoryavailablestore': new nlobjSearchColumn('makeinventoryavailablestore')
		,	'namenohierarchy': new nlobjSearchColumn('namenohierarchy')
		,	'phone': new nlobjSearchColumn('phone')
		,	'tranprefix': new nlobjSearchColumn('tranprefix')
		,	'zip': new nlobjSearchColumn('zip')
		,	'latitude': new nlobjSearchColumn ('latitude')
		,	'longitude': new nlobjSearchColumn('longitude')
		,	'locationtype:': new nlobjSearchColumn('locationtype')
		}

		//@method list
		//@return {Location.Collection}
	,   list: function (data)
		{
			return this.search(data);
		}

		//@method get Return one single location
		//@param {String} id
		//@return {Location.Model.Get.Result}
	,   get: function (data)
		{
			this.result = {};

			this.data = data;
			
			var internalid  = _.isArray(this.data.internalid) ? this.data.internalid : this.data.internalid.split(',')
			,	search_results = this.search(data);
			
			if (internalid.length === 1)
			{
				
				this.result = search_results[0];
			}
			else
			{
				this.result = search_results;
			}

			return this.result;
		}

		// @property {Boolean} isPickupInStoreEnabled
	,	isPickupInStoreEnabled: SiteSettings.isPickupInStoreEnabled()

		//@method search
		//@param {Object}
		//@return {Location.Result}
	,   search: function (data)
		{

			var result = {}
			,   records = []
			,   self = this;

			this.filters = [];
			this.data = data;

			this.filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

			if (this.data.locationtype)
			{
				var location_type = _.isArray(this.data.locationtype) ? this.data.locationtype : this.data.locationtype.split(',');
				
				this.filters.push(new nlobjSearchFilter('locationtype', null, 'anyof', location_type));
			}


			if (this.data.latitude && this.data.longitude)
			{
				//Automatic location detection fails, without completing the latitude and longitude fields.
				//Delete this filters when fixed.
				this.filters.push(new nlobjSearchFilter('latitude', null, 'isnotempty'));
				this.filters.push(new nlobjSearchFilter('longitude', null, 'isnotempty'));

				var formula = this.getDistanceFormulates();
				if (this.data.radius)
				{
					this.filters.push(new nlobjSearchFilter('formulanumeric', null, 'lessthan', this.data.radius).setFormula(formula));
				}
				//Validate that the formula returns some value.
				this.filters.push(new nlobjSearchFilter('formulanumeric', null, 'noneof', '@NONE@'));
				this.columns.distance =  new nlobjSearchColumn('formulanumeric').setFormula(formula).setFunction('roundToTenths');
			}

			if (this.data.internalid)
			{
				
				var internalid  = _.isArray(this.data.internalid) ? this.data.internalid : this.data.internalid.split(',');
				this.filters.push(new nlobjSearchFilter('internalid', null, 'anyof', internalid));
			}

			if (this.data.subsidiary)
			{
				var subsidiary = _.isArray(this.data.subsidiary) ? this.data.subsidiary : this.data.subsidiary.split(',');
				this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiary));
			}

			if (this.data.sort)
			{
				_.each(this.data.sort.split(','), function (column_name)
				{
					if (self.columns[column_name])
					{
						self.columns[column_name].setSort(self.data.order >= 0);
					}
				});
			}

			if (this.isPickupInStoreEnabled)
			{
				this.columns.allowstorepickup = new nlobjSearchColumn('allowstorepickup');
				this.columns.timezone = new nlobjSearchColumn('timezone');
				this.columns.nextpickupcutofftime = new nlobjSearchColumn('nextpickupcutofftime');
			}

			if (this.data.page === 'all')
			{
				this.search_results = Application.getAllSearchResults('location', _.values(this.filters), _.values(this.columns));
			}
			else
			{
				this.search_results = Application.getPaginatedSearchResults({
					record_type: 'location'
				,	filters: _.values(this.filters)
				,	columns: _.values(this.columns)
				,	page: this.data.page || 1
				,	results_per_page : this.data.results_per_page
				});
			}

			var results = ((this.data.page === 'all' ? this.search_results : this.search_results.records) || []) || [];

			if (this.isPickupInStoreEnabled)
			{
				this.searchServiceHoursResults = this.searchServiceHours(_.map(results, function (record)
				{
					return record.getId();
				}));
			}

			_.each(results, function (record)
			{
				records.push(self.getRecordValues(record));
			});

			if (this.data.page === 'all' || this.data.internalid)
			{
				result = records;
			}
			else
			{
				result = this.search_results;
				result.records = records;
			}

			return result;
		}

	,	searchServiceHours: function (ids)
		{
			if (!ids || !ids.length)
			{
				return [];
			}

			var filters = [
				new nlobjSearchFilter('internalid', null, 'anyof', ids)
			,	new nlobjSearchFilter('starttime', null, 'isnotempty')
			]
			,	columns = [
					new nlobjSearchColumn('ismonday')
				,	new nlobjSearchColumn('istuesday')
				,	new nlobjSearchColumn('iswednesday')
				,	new nlobjSearchColumn('isthursday')
				,	new nlobjSearchColumn('isfriday')
				,	new nlobjSearchColumn('issaturday')
				,	new nlobjSearchColumn('issunday')
				,	new nlobjSearchColumn('starttime')
				,	new nlobjSearchColumn('endtime')
				,	new nlobjSearchColumn('internalid')
			];

			return Application.getAllSearchResults('location', filters, columns);
		}

		//@method getServiceHours
		//@return {String}
	,	getServiceHours: function (id)
		{
			var records = _.filter(this.searchServiceHoursResults || [], function(record)
			{
				return record.getId() === id;
			});

			return _.map(records, function (record)
			{
				return {
					starttime: record.getValue('starttime')
				,	endtime: record.getValue('endtime')
				,	monday: record.getValue('ismonday')
				,	tuesday: record.getValue('istuesday')
				,	wednesday: record.getValue('iswednesday')
				,	thursday: record.getValue('isthursday')
				,	friday: record.getValue('isfriday')
				,	saturday: record.getValue('issaturday')
				,	sunday: record.getValue('issunday')
				};
			});
		}

		//@method getFriendlyName
		//@return {String}
	,	getFriendlyName: function (id)
		{
			if (SC.Configuration.storeLocator && SC.Configuration.storeLocator.customFriendlyName)
			{
				try
				{
					return nlapiLookupField('location', id, SC.Configuration.storeLocator.customFriendlyName);
				}
				catch (error)
				{
					return '';
				}
			}
			return '';
		}

		//@method getDistanceFormulates
		//@return {String} distance formulates
	,   getDistanceFormulates: function ()
		{
			//R = Earth radius 6371 (km) , 3959 (mi)
			var PI = Math.PI
			,   R = SC.Configuration.storeLocator.distanceUnit === 'mi' ? 3959 : 6371
			,   lat = this.data.latitude * PI / 180
			,   lon = this.data.longitude * PI / 180
			,   formula = R +
				' * (2 * ATAN2(SQRT((SIN((' + lat + '- ({latitude} * ' + PI + ' / 180)) / 2) *' +
				'SIN((' + lat + '- ({latitude} * ' + PI + ' / 180)) / 2) + ' +
				'COS(({latitude} * ' + PI + ' / 180)) * COS(' + lat + ') *' +
				'SIN((' + lon + '- ({longitude} * ' + PI + ' / 180)) /2) *' +
				'SIN((' + lon + '- ({longitude} * ' + PI + ' / 180)) /2))),' +
				'SQRT(1 - (SIN((' + lat + '- ({latitude} * ' + PI + ' / 180)) / 2) *' +
				'SIN((' + lat + '- ({latitude} * ' + PI + ' / 180)) / 2) +' +
				'COS(({latitude} * ' + PI + ' / 180)) * COS(' + lat + ') * ' +
				'SIN((' + lon + '- ({longitude} * ' + PI + ' / 180)) /2) * ' +
				'SIN((' + lon + '- ({longitude} * ' + PI + ' / 180)) /2)))))';

			return formula;
		}

		//@method getRecordValues
		//@return {Locator.Model.Result}
	,	getRecordValues: function (record)
		{
			var map_result = {}
			,	id = record.getValue('internalid')
			,	friendlyName = this.getFriendlyName(id);
			//@property {String} recordtype
			map_result.recordtype = record.getRecordType();
			//@property {String} internalid
			map_result.internalid = id;
			//@property {String} address1
			map_result.address1 = record.getValue('address1');
			//@property {String} address2
			map_result.address2 = record.getValue('address2');
			//@property {String} address3
			map_result.address3 = record.getValue('address3');
			//@property {String} city
			map_result.city = record.getValue('city');
			//@property {String} country
			map_result.country = record.getValue('country');
			//@property {String} state
			map_result.state = record.getValue('state');
			//@property {String} isoffice
			map_result.isoffice = record.getValue('isoffice');
			//@property {String} makeinventoryavailable
			map_result.makeinventoryavailable = record.getValue('makeinventoryavailable');
			//@property {String} makeinventoryavailablestore
			map_result.makeinventoryavailablestore = record.getValue('makeinventoryavailablestore');
			//@property {String} name
			map_result.name = friendlyName !== '' ? friendlyName : record.getValue('namenohierarchy');

			//@property {String} phone
			map_result.phone = record.getValue('phone');
			//@property {String} zip
			map_result.zip = record.getValue('zip');
		
			//@property {Object} location
			map_result.location = {
				//@property {String} latitude
				latitude: record.getValue('latitude')
				//@property {String} longitude
			,   longitude: record.getValue('longitude')
			};
			//@property {Number} locationtype
			map_result.locationtype = record.getValue('locationtype');

			if (this.data.latitude && this.data.longitude)
			{
				var distance = Math.round(record.getValue('formulanumeric') * 10) / 10;
				
				if (!_.isUndefined(distance))
				{
					//@property {Number} distance
					map_result.distance = Math.round(record.getValue('formulanumeric') * 10) / 10;
					map_result.distanceunit = SC.Configuration.storeLocator.distanceUnit;
				}
			}

			if (this.isPickupInStoreEnabled)
			{
				//@property {String} openinghours
				map_result.servicehours = this.getServiceHours(id);
				//@property {Object} timezone
				map_result.timezone = {
						text: record.getText('timezone')

					,	value: record.getValue('timezone')
				};

				//@property {Boolean} allowstorepickup
				map_result.allowstorepickup = record.getValue('allowstorepickup') === 'T';

				if (map_result.allowstorepickup)
				{
					//@property {String} nextpickupcutofftime
					map_result.nextpickupcutofftime = record.getValue('nextpickupcutofftime');

					var next_pickup_cut_off_time_date = map_result.nextpickupcutofftime && map_result.nextpickupcutofftime !== ' ' && nlapiStringToDate(map_result.nextpickupcutofftime);
					
					if (next_pickup_cut_off_time_date)
					{
						var	current_date = Utils.getTodayDate()
						,	days_of_the_week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

						if (current_date.getDay() === next_pickup_cut_off_time_date.getDay())
						{
							map_result.nextpickupday = 'today';
						}
						else if ((current_date.getDay() + 1) === next_pickup_cut_off_time_date.getDay())
						{
							map_result.nextpickupday = 'tomorrow';
						}
						else
						{
							map_result.nextpickupday = days_of_the_week[next_pickup_cut_off_time_date.getDay()];
						}
						
						map_result.nextpickuphour = nlapiDateToString(next_pickup_cut_off_time_date, 'timeofday');
					}
					else
					{	
						//@property {String} nextpickupday
						map_result.nextpickupday = null;
						//@property {String} nextpickuphour
						map_result.nextpickuphour = null;
						//@property {String} nextpickupcutofftime
						map_result.nextpickupcutofftime = null;
					}
		
				}

			}

			return map_result;
		}

	});
});

