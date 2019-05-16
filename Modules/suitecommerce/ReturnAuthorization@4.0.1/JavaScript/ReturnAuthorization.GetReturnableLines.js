/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@mdoule ReturnAuthorization
define('ReturnAuthorization.GetReturnableLines'
,	['underscore']
,	function (_)
{
	'use strict';

	//Returnable lines calculator.
	//Constructor
	//model: Invoice or order model
	var RetrunableLinesCalculator = function (model, options)
	{
		var default_options = {
			notConsiderFulfillments: false
		};

		this.options = _.extend(default_options, options);

		//We calculate the the group of returnable lines from invoices and placed orders
		this.createdFrom = model;

		//hash containing the ids of the lines that are returnable
		//The control over returnable lines is made based on the quantity of each line after the fullfiles lines and already returned lines is substracted
		this.line_ids = {};
	};

	//@class ReturnAuthorization.GetReturnableLines
	_.extend(RetrunableLinesCalculator.prototype,
	{
		//Initialize lines quantities to: 0 so the fullfilments are sumed or  to the quantity of each line
		initialize: function ()
		{
			var lines = this.createdFrom.get('lines');
			lines.each(function (line)
			{
				this.line_ids[line.id] = this.options.notConsiderFulfillments ? line.get('quantity') : 0;
			}, this);

			return this;
		}

		//calculate from all fulfillments the quantity each line is fulfilled (SUM each quantity to the lines)
	,	_setFulfilledQuantities: function ()
		{
			var created_from = this.createdFrom
			,	lines = created_from.get('lines')
			,	self = this
			,	fullfilments = created_from.get('fulfillments');

			if (fullfilments)
			{
				fullfilments.each(function (fulfillment)
				{
					fulfillment.get('lines').each(function (line)
					{
						var same_line = lines.get(line.get('internalid'));

						if (same_line)
						{
							self.line_ids[same_line.id] += parseFloat(line.get('quantity'));
						}
					});
				});
			}

			return this;
		}

		//calculate for all returns already made the quantty per line that is already returned (SUBSTRACT each quantity to the line ids)
	,	_setReturnedQuantities: function ()
		{
			var created_from = this.createdFrom
			,	self = this
			,	lines = created_from.get('lines');

			created_from.get('returnauthorizations').each(function (sibling)
			{
				if (sibling.get('status').internalid !== 'cancelled')
				{
					sibling.get('lines').each(function (line)
					{
						var item_id = line.get('item').id

						,	same_item_line = lines.find(function (line)
							{
								return line.get('item').id === item_id;
							});
						
						//IMPORTANT: Here we sum quatities because the return authirization quantity is negative!
						// ans we parse it as the quantity come as a string from the server
						if (same_item_line && same_item_line.id && self.line_ids[same_item_line.id])
						{
							self.line_ids[same_item_line.id] -= parseFloat(line.get('quantity'));		
						}
					});
				}
			});

			return this;
		}

		//based on the current state of the line_ids (call this method last, after all above) removes lines that are not returnable
		//Returns an object withj two properties; validLines: array of valid line models, and invalidLines: array of invalid line models
	,	_setInvalidLines: function ()
		{
			var valid_lines = []
			,	valid_line_ids_quantities = {}
			,	invalid_lines = []
			,	created_from = this.createdFrom
			,	self = this
			,	lines = created_from.get('lines');

			_.each(_.keys(this.line_ids), function (line_id)
			{
				var original_line = lines.get(line_id);

				//if the line quantity if greater than 0, it means that there are fulfillments made that are not returned (fulfillment quantity - returned quantity)
				//item _isReturnable is controlled based on the item type in the itemkey mapping. To sum up:
				//IF the line has quantity that can be retuned and the item's line is returnable THEN is a valid line to return
				if (self.line_ids[line_id] && original_line.get('item').get('_isReturnable'))
				{
					valid_lines.push(original_line);
					valid_line_ids_quantities[line_id] = self.line_ids[line_id];
				}
				else
				{
					invalid_lines.push(original_line);
				}
			});

			return {
				validLines: valid_lines
			,	invalidLines: invalid_lines
			,	validLineIdsQuantities: valid_line_ids_quantities
			};
		}

		//based on the current model generates an object with two array of model, valid (returnable) and invalid (nopn-returnable) lines
	,	calculateLines: function ()
		{
			if (!this.options.notConsiderFulfillments)
			{
				return this.initialize()
					._setFulfilledQuantities()
					._setReturnedQuantities()
					._setInvalidLines();
			}

			return this.initialize()
					._setReturnedQuantities()
					._setInvalidLines();
		}
	});

	return RetrunableLinesCalculator;
});