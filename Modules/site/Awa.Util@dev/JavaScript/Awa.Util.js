define('Awa.Util', [
    'underscore',
    'jQuery',
    'Handlebars'
],
    /** @param {_} _ @param {JQueryStatic} jQuery*/
    function AwaUtilModule(
        _,
        jQuery,
        Handlebars
    ) {
        'use strict';

        /** @type {AwaUtil} */
        var Module = {

            overrideInstanceMethod: function overrideInstanceMethod(Class, methodName, newMethod, dontCallSuper) {
                Class.prototype[methodName] = _.wrap(Class.prototype[methodName], function (fn) {
                    var newMethodArgs = dontCallSuper ? [] : [fn.apply(this, Array.prototype.slice.call(arguments, 1))];
                    return newMethod.apply(this, newMethodArgs);
                });
            },

            extendViewContext: function extendViewContext(Class, newContextObjectOrFunction, dontCallSuper) {
                Module.overrideInstanceMethod(Class, 'getContext', function (context) {
                    var extension = (typeof newContextObjectOrFunction === 'function') ? newContextObjectOrFunction.apply(this, [context]) : newContextObjectOrFunction;
                    return _.extend(context, extension);
                }, dontCallSuper);
            },

            urlParam: function urlParam(name) {
                var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                if (results == null) {
                    return null;
                }
                return decodeURI(results[1]) || undefined;
            },

            debug: {
                simulatePageGenerator: function simulatePageGenerator(enabled) {
                    if (!enabled) {
                        // nsglobal = {statusCode: 200, location: location.href};
                        SC.isPageGenerator = function () { return true }
                    }
                    else {
                        // nsglobal = undefined;
                        SC.isPageGenerator = function () { return false }
                    }
                },
                isLocalSsp: function isLocalSsp() {
                    return location.href.indexOf('shopping-local.ssp') !== -1;
                },
                installHandlebarsDebugHelper: function installHandlebarsDebugHelper() {
                    Handlebars.registerHelper('debugger', function() {
                       debugger;
                       return '';
                    });
                }
            },

            dom: {
                getAncestorsContaining: function getAncestorsContaining(config) {
                    // @ts-ignore
                    return jQuery(config.root || 'body').find(config.parent).filter(function () {
                        var children = jQuery(this).find(config.child);
                        return config.notContaining ? children.length === 0 : children.length > 0;
                    })
                }
            }


        };

        return Module;
    });