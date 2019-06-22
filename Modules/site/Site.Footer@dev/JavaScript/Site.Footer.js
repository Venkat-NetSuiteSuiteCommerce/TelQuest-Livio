define('Site.Footer', [
    'Footer.View',
    'FakeLoginBanner.View',
    'FakeLogin.Utils',
    'underscore'
], function PrintPDP(
    FooterView,
    FakeLoginBannerView,
    Utils,
    _
) {
    'use strict';

    FooterView.prototype.childViews['InstantMemberBanner'] = function InstantMemberBanner() {
        return new FakeLoginBannerView({});
    };
});
