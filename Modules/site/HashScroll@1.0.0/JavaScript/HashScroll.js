define("HashScroll",
    ['jQuery','underscore','Backbone'],
    function (jQuery, _ ,Backbone) {

    var layout;

    return {
        mountToApp: function (application) {
            layout = application.getLayout();
            layout.events = _.extend(layout.events, {
                "click [data-goto]": gotoElement
            });
            layout.on("afterAppendView", function () {
                var urlOptions = _.parseUrlOptions(Backbone.history.fragment);
                if (urlOptions["goto"]) {
                    _.delay(function () {
                        gotoToId(urlOptions["goto"]);
                    }, 300);
                }
            });
            function gotoElement(e) {
                var $el = jQuery(e.currentTarget)
                    , url = Backbone.history.fragment
                    , data = $el.data();

                url = url.split("?")[0] + "?" + jQuery.param(_.extend(_.parseUrlOptions(Backbone.history.fragment), {
                        "goto": data["goto"]
                    }));
                Backbone.history.navigate(url);

                gotoToId(data["goto"]);
            }

            function gotoToId(f) {
                var $el = layout.$("#" + f);
                if ($el.length) {
                    setTimeout(function () {
                        var top = $el.offset().top;
                        jQuery("html, body").animate({
                            scrollTop: top
                        }, 500);
                    }, 0);
                }
            }
        }
    };
});