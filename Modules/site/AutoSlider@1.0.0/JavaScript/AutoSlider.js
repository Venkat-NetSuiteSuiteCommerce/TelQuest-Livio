define('AutoSlider', [
	'SC.Configuration',
	'jQuery'
], function AwaLabsAutoSlider(
	Configuration,
	jQuery
) {
	'use strict';
	return  {
		mountToApp: function mountToApp (application) {
            var events = typeof CMS !== 'undefined' ? CMS : Backbone.Events;
            events.on('page:content:set', function initSlider() {
            	_.defer(function() {
                    var currentView = application._layoutInstance.currentView;
                    var $sliders = currentView && currentView.$('[data-autoslider]') || [];
                    var options = Configuration.bxSliderDefaults;


                    _.each($sliders, function eachSlider(slider) {
                        var $slider = jQuery(slider);
                        try{
                            options = $slider.data('autoslideroptions');
                        }catch(e){}

                        $slider.bxSlider(options);
                    });
				});

            });
		}
	};
});
