define('byteLength', function byteLengthFn() {
    /**
     * Function taken from http://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
     */
    return function byteLength(str) {
        // returns the byte length of an utf8 string
        var s = str.length;
        var i;
        var code;
        for (i = str.length - 1; i >= 0; i--) {
            code = str.charCodeAt(i);
            if (code > 0x7f && code <= 0x7ff) s++;
            else if (code > 0x7ff && code <= 0xffff) s += 2;
            if (code >= 0xDC00 && code <= 0xDFFF) i--; // trail surrogate
        }
        return s;
    };
});
