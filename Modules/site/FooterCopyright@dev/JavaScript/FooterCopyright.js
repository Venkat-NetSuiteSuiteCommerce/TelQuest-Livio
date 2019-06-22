define('FooterCopyright', [
    'FooterCopyright.View',
    'Footer.View',
    'underscore'
], function FooterCopyright(
    FooterCopyrightView,
    FooterView,
    _
) {
    'use strict';

    _.extend(FooterView.prototype.childViews, {
        'FooterCopyright': function FacetsItemCell() {
            return new FooterCopyrightView({});
        }
    });

});
