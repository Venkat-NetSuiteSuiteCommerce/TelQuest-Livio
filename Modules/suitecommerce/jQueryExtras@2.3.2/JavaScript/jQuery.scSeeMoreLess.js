/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module jQueryExtras
#jQuery.scSeeMoreLess
A jQuery plugin for toggle collapse. Usage: 

	this.$el.find('[data-action="tab-content"]').scSeeMoreLess()
*/

define(
	'jQuery.scSeeMoreLess'
,	[
		'jQuery'
	]
,	function(
		jQuery
	)
{
	'use strict';

	jQuery.fn.scSeeMoreLess = function (options)
	{
		var settings = jQuery.extend({}, jQuery.fn.push.defaults, options )

		return this.each(function() 
		{
			var self = this
			,	$this = jQuery(this);
			var tabHeight = $this.height();
			var maxHeight = 400;
			if(tabHeight >= maxHeight){
				$this.addClass('colapsed');
			}
	    });
	};

	jQuery.fn.push.defaults = {
		
	};
});