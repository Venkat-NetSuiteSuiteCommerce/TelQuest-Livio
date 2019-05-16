define('Site.Home', [
    'Home.View',
    'SC.Configuration',
    'FakeLogin.Utils',
    'Utils',
    'underscore',
    'jQuery'
],
    /** @param {_} _ */
function PrintPDP(
    HomeView,
    Configuration,
    FakeLoginUtils,
    Utils,
    _,
    jQuery
) {
        'use strict';

        _.extend(HomeView.prototype, {
            events: _.extend(HomeView.prototype.events || {}, {
                'click [data-target="fakeLogin"]': 'fakeLogin'
            }),

            initialize: function () {
                var self = this;
                this.windowWidth = jQuery(window).width();
                this.on('afterViewRender', function () {
                    _.initBxSlider(self.$('[data-slider]'), {
                        adaptiveHeight: true,
                        auto: true,
                        pause:6000,
                        nextText: '<a class="home-gallery-next-icon"></a>',
                        prevText: '<a class="home-gallery-prev-icon"></a>'
                    });
                });
                var windowResizeHandler = _.throttle(function () {
                    if (_.getDeviceType(this.windowWidth) === _.getDeviceType(jQuery(window).width())) {
                        return;
                    }
                    this.showContent();
                    _.resetViewportWidth();
                    this.windowWidth = jQuery(window).width();
                }, 1000);
                this._windowResizeHandler = _.bind(windowResizeHandler, this);
                jQuery(window).on('resize', this._windowResizeHandler);
            },

            fakeLogin: function fakeLogin(e) {
                e.preventDefault();
                e.stopPropagation();
                FakeLoginUtils.addFakeLogin();
            },

            getPageDescription: function getPageDescription() {
                return Utils.translate(Configuration.get('athqHome.description'));
            },

            getMetaDescription: function ()            {
                return this.getPageDescription()
            },

            getTitle: function getTitle() {
                return Utils.translate(Configuration.get('athqHome.title'));
            },

    		getMetaKeywords: function getMetaKeywords() {
                return Utils.translate(Configuration.get('athqHome.keywords'));
            },

            getCanonical: function getCanonical() {
                return Utils.translate(Configuration.get('athqHome.canonical'));
            }

        });

        HomeView.prototype.getContext = _.wrap(HomeView.prototype.getContext, function (fn) {
            var originalContext = fn.apply(this, _.toArray(arguments).slice(1));
            originalContext.homeSlides = Configuration.get('athqHome.homeSlides');
            originalContext.isLoggedIn = FakeLoginUtils.isLoggedIn();
            originalContext.description = Utils.translate(Configuration.get('athqHome.description'));
            originalContext.title = Utils.translate(Configuration.get('athqHome.title'));
            originalContext.canonical = Utils.translate(Configuration.get('athqHome.canonical')) || 'http://www.athq.com/';
            originalContext.logoUrl = location.href +'/' + Utils.getAbsoluteUrl('img/athq.png');
            return originalContext;
        });
    });


