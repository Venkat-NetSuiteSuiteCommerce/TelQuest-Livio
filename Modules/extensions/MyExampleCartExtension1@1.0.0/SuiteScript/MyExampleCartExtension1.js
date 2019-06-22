define('MyExampleCartExtension1'
,	[
		'Application'
	,	'underscore'
	]
,	function(
	   Application
	,	_
	)
{
	'use strict';
	
	//Get the cart component
	var cart_component = Application.getComponent('Cart');
	
	//Listen to the beforeAddLine event.
	//This is triggered before each line is added even when addLines is used. 
	cart_component.on('beforeAddLine', function(event_data){
		//Get the line from the event data
		var	line = event_data.line
		//Get all lines from the cart component
		,	lines = cart_component.getLinesSync()
		//Calculates the items count
		,	items_count = _.reduce(lines, function(count, line){
				return count + line.quantity;
			}, 0);

		if(items_count + line.quantity > 10)
		{
			//Thows an Error in order to cancel the execution of the addLine method
			throw new Error('You can not add more than ten items');
		}

	});
	
	//Listen to the afterAddLine event.
	//This is triggered after each line is added even when addLines is used. 
	cart_component.on('afterAddLine', function(event_data){
		//Get the line id from the event data
		var line_id = event_data.result
		,	lines = cart_component.getLinesSync();
		
		//Search the cart's line with the actual quantity
		var line = _.find(lines, function(line){
			return line.internalid === line_id;
		});
		
		//Duplicates the quantity of the added lines
		cart_component.updateLineSync({
			line: {
				internalid: line_id.toString()
			,	quantity: line.quantity * 2
			,	item: {
					internalid: line.item.internalid
				,	itemtype: line.itemtype
				}
			}
		});
	});
	
});