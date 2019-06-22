//@module MyExtension2
define('MyExtension2.View'
,	[
		'my_extension_2.tpl'
	,	'Backbone'
	]
,	function (
		myExtension2_tpl
	,	Backbone
	)
{
	'use strict';

	// @class MyExtension2.View @extend Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: myExtension2_tpl

		// @property {Object} events
	,	events: {
			'click [data-action="show-alert"]': 'showAlert'
		}

		// @method initialize
		// @param {MyExtension2.View.initialize.Options} options
		// @return {Void}
	,	initialize: function initialize (options)
		{
			this.message = options.message || 'Dummy text';
			this.text = options.text || 'Alert Action';
		}


		// @method showAlert Show an alert
		// @param {HTMLEvent} e
		// @return {Void}
	,	showAlert: function showAlert (e)
		{
			e.preventDefault();

			window.alert(this.message);
		}

		// @method getContext
		// @return {MyExtension2.View.Context}
	,	getContext: function getContext ()
		{
			// @class MyExtension2.View.Context
			return {
				// @property {String} text
				text: this.text
			};
		}
	});
});
