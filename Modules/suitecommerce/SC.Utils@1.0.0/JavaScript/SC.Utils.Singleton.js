/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/


//only used in test cases, consider remove
define('SC.Utils.Singleton', function ()
{
	'use strict';

	// Singleton:
	// Defines a simple getInstance method for:
	// models, collections, views or any other object to use to be used as singletons
	// How to use:
	// Backbone.[Collection, Model, View].extend({Your code}, Singleton);
	// or _.extend({Object literal}, Singleton);
	return {
		getInstance: function ()
		{
			var This = this;
			this.instance = this.instance || new This();
			return this.instance;
		}
	};
});