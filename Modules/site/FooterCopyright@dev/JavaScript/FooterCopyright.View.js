define('FooterCopyright.View', [
    'footer_copyright.tpl',
    'SC.Configuration',
    'Backbone',
    'underscore'
], function FooterCopyrightView(
    footerCopyrightTpl,
    Configuration,
    Backbone,
    _
) {
    return Backbone.View.extend({
        template: footerCopyrightTpl,
        initialize: function initialize(options) {
            _.extend(this, options);
        },
        getContext: function () {
            return {
                copyrightText: (Configuration.get('footer.copyrightText') || '').replace('[YEAR]',new Date().getFullYear())
            };
        }
    });
});