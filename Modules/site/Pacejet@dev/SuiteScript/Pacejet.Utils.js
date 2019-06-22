define('Pacejet.Utils', [

], function PacejetUtils(

) {
    'use strict';

    function isNSEmpty(value) {
        return value === null || value === '' || (typeof value === 'undefined');
    }

    function round2Fixed(value, pDecPlaces) {
        var decPlaces = pDecPlaces;
        var val;
        var fraction;

        if (decPlaces == null) {
            decPlaces = 2;
        }

        val = value * Math.pow(10, decPlaces);
        fraction = (Math.round((val - parseInt(val, 10)) * 10) / 10);

        // this line is for consistency with .NET Decimal.Round behavior
        // -342.055 => -342.06
        if (fraction === -0.5) fraction = -0.6;

        val = Math.round(parseInt(val, 10) + fraction) / Math.pow(10, decPlaces);
        return val;
    }

    function hashCode(str) {
        var hash = 0;
        var i;
        var chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            /* eslint-disable no-bitwise */
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
            /* eslint-enable no-bitwise */
        }
        return hash;
    }

    function convertWeight(itemWeight, itemWeightUnit, conversionRate, defweightuom) {
        var gToLbs = 0.00220462262;
        var gToKg = 0.001;
        var kgToLbs = 2.20462262;
        var ozToLbs = 0.0625;
        var ozToKg = 0.0283495231;
        var lbsToKg = 0.45359237;
        var WeightUOM = (defweightuom + '').toLowerCase();

        var strConvertedWeight = '';

        switch (itemWeightUnit) {
        case 'lb':
            if (WeightUOM === 'lb') {
                strConvertedWeight = itemWeight;
            } else if (WeightUOM === 'kg') {
                strConvertedWeight = (itemWeight * lbsToKg);
            } else {
                strConvertedWeight = itemWeight;
            }
            break;

        case 'oz':
            if (WeightUOM === 'lb') {
                strConvertedWeight = (itemWeight * ozToLbs);
            } else if (WeightUOM === 'kg') {
                strConvertedWeight = (itemWeight * ozToKg);
            } else {
                strConvertedWeight = itemWeight;
            }

            break;
        case 'kg':
            if (WeightUOM === 'lb') {
                strConvertedWeight = (itemWeight * kgToLbs);
            } else if (WeightUOM === 'kg') {
                strConvertedWeight = itemWeight;
            } else {
                strConvertedWeight = itemWeight;
            }
            break;

        case 'g':
            if (WeightUOM === 'lb') {
                strConvertedWeight = (itemWeight * gToLbs);
            } else if (WeightUOM === 'kg') {
                strConvertedWeight = (itemWeight * gToKg);
            } else {
                strConvertedWeight = itemWeight;
            }

            break;

        default:
            strConvertedWeight = itemWeight;
            break;
        }

        if (conversionRate) {
            strConvertedWeight *= conversionRate;
        }
        return strConvertedWeight;
    }

    return {
        round2Fixed: round2Fixed,
        isNSEmpty: isNSEmpty,
        convertWeight: convertWeight,
        hashCode: hashCode
    };
});
