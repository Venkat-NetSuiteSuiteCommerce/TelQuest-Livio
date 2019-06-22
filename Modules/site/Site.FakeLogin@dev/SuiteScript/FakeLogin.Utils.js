define('FakeLogin.Utils', [
    'underscore'
], function FakeLoginUtils(
    _
) {
    /* https://github.com/jshttp/cookie/blob/master/index.js */
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

    function tryDecode(str, decode) {
        try {
            return decode(str);
        } catch (e) {
            return str;
        }
    }

    function parse(str, options) {
        if (typeof str !== 'string') {
            throw new TypeError('argument str must be a string');
        }

        var obj = {};
        var opt = options || {};
        var pairs = str.split(pairSplitRegExp);
        var dec = decode;

        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var eq_idx = pair.indexOf('=');

            // skip things that don't look like key=value
            if (eq_idx < 0) {
                continue;
            }

            var key = pair.substr(0, eq_idx).trim();
            var val = pair.substr(++eq_idx, pair.length).trim();

            // quoted values
            if ('"' == val[0]) {
                val = val.slice(1, -1);
            }

            // only assign once
            if (undefined == obj[key]) {
                obj[key] = tryDecode(val, dec);
            }
        }
        return obj;
    }

    return {
        getAllCookies: function getAllCookies(request) {
            var value = request.getHeader('Cookie') || '';
            return parse(value);
        },
        getCookies: function getCookies(request, properties) {
            var allCookies = this.getAllCookies(request);
            return _.pick(allCookies, properties);
        },
        getCookie: function getCookies(request, property) {
            var allCookies = this.getAllCookies(request);
            return allCookies[property];
        }
    }
});
