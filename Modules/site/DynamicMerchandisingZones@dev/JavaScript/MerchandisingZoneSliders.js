define('MerchandisingZoneSliders', [
    'Merchandising.View',
    'SC.Configuration',
    'Backbone',
    'underscore',
    'Utils',
    'jQuery'
], function MerchandisingZoneSlider(
    MerchandisingView,
    Configuration,
    Backbone,
    _,
    Utils,
    jQuery
) {
    'use strict';

    function initBxSlider($element, options) {
        if ($element.bxSlider && !_.oldIE() && !SC.isPageGenerator()) {
            return $element.bxSlider(options);
        }
        return $element;
    }

    _.mixin({
        initBxSlider: initBxSlider
    });

    _.extend(MerchandisingView.prototype, {
        initSlider: function initSlider() {

            var sliders = [
                '#home-first-cms-content'
            ];

            var sliderBaseOptions = {
                nextText: '<a class="home-slider-next-icon"><\/a>',
                prevText: '<a class="home-slider-prev-icon"><\/a>',
                minSlides: 1,
                maxSlides: 4,
                slideWidth: 360,
                forceStart: true,
                infiniteLoop: true,
                preloadImages: 'all',
                slideMargin: 10,
                shrinkItems: true
            };

            _.each(sliders, function eachSliders(slider){
                _.initBxSlider(jQuery( slider + ' [data-type="carousel-items"]'), sliderBaseOptions);
            });
        }
    });
});
