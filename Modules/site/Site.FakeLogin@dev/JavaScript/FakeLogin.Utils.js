define('FakeLogin.Utils', [
    'Profile.Model',
    'Session',
    'jQuery',
    'underscore',
    'jquery.cookie'
], function FakeLoginUtils(
    ProfileModel,
    Session,
    jQuery,
    _
) {
    return {
        isLoggedIn: function isLoggedIn() {
            var profile = ProfileModel.getInstance();
            var fakeLogginCookie = jQuery.cookie('fakeLogin');
            return profile.get('isLoggedIn') === 'T' || profile.get('isGuest') === 'T' || profile.get('isFakeLogin') === 'T' || !!fakeLogginCookie;
        },

        addFakeLogin: function addFakeLogin() {
            var customerId = Math.floor(Math.random() * 999999);
            jQuery.cookie.json = true;
            jQuery.cookie('fakeLogin', customerId, { path: '/' });
            jQuery.cookie('showFakeLoginBanner', true, { path: '/' });
            this.setCrossDomainCookies({ fakeLogin: customerId });
        },

        getFakeCustomer: function getFakeCustomer() {
            var profile = ProfileModel.getInstance();
            var fakeLogginCookie = jQuery.cookie('fakeLogin');
            var isFakeLogin = profile.get('isFakeLogin') === 'T' || fakeLogginCookie;

            return profile.get('isLoggedIn') !== 'T' && isFakeLogin ? profile.get('fakeLoginCustomer') || fakeLogginCookie : '';
        },

        setCrossDomainCookies: function setCrossDomainCookies(cookies) {
            if (!SC.isPageGenerator()) {
                var cookieGatewayUrl = Session.get('touchpoints').customercenter.replace('my_account.ssp', 'cookie-gateway.ssp');
                var indexOfParams = cookieGatewayUrl.indexOf('?');
                cookieGatewayUrl = indexOfParams >= 0 ? cookieGatewayUrl.substring(0, indexOfParams) : cookieGatewayUrl;
                cookieGatewayUrl = cookieGatewayUrl + '?' + jQuery.param(cookies);
                ProfileModel.getPromise().done(function done() {
                    jQuery('<iframe>', {
                        src: cookieGatewayUrl,
                        frameborder: 0,
                        scrolling: 'no'
                    }).appendTo('body').load(function load() {
                        document.location.reload();
                    });
                });

            }
        }
    };
});
