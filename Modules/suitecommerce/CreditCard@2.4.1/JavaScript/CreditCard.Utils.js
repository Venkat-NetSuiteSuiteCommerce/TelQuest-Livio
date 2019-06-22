/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard Standard credit card utils for parsing the formats
// @class CreditCard.Utils Standard credit card utils for parsing the formats
define('CreditCard.Utils'
,	['underscore']
,	function(_)
{
	'use strict';

	function tr(text, search, replace)
	{
		// Make the search string a regex.
		var regex = new RegExp( '[' + search + ']', 'g' );
		var t = text.replace(regex, function(chr)
		{
			// Get the position of the found character in the search string.
			var ind = search.indexOf(chr);
			// Get the corresponding character from the replace string.
			var r = replace.charAt(ind);
			return r;
		});
		return t;
	}

	// replacements needed for spanish keyboards
	var keyReplacementEs = {
		search:  '&_ñ¡'
	,	replace: '^?;='
	};

	// @method parseTrack @param {Array<String>}card
	function parseTrack(card)
	{
		try
		{
			return _parseTrack(card);
		} catch(err)
		{
			card = tr(card, keyReplacementEs.search, keyReplacementEs.replace);
			return _parseTrack(card);
		}
	}

	function _parseTrack(card)
	{
		var card_info = {}, separator = '';
		if (!card)
		{
			throw new Error('empty credit card');
		}

		var start_sentinel	= card[0]
		,	fields;

		if(start_sentinel === '%') // Track 1
		{
			var format_code = card[1];

			if (format_code === 'E')
			{
				throw new Error('format credit card error');
			} else if ( format_code === 'B')
			{
				separator = '^';
			} else
			{
				throw new Error('unkown credit card format');
			}

			fields = card.slice(2, card.length - 1).split(separator);
			if (!fields || fields.length !== 3)
			{
				throw new Error('credit card missing fields');
			}

			var yymm = fields[2].slice(0,4);

			card_info.ccnumber		= fields[0];
			card_info.ccname		= fields[1];
			card_info.ccexpiredate	= yymm.slice(2,4) + '/20' + yymm.slice(0,2);
		}
		else if(start_sentinel === ';') // Track 2
		{
			separator = '=';
			fields = card.slice(1, card.length - 1).split(separator);
			if (!fields || fields.length !== 2)
			{
				throw new Error('credit card missing fields');
			}
			card_info.ccnumber		= fields[0];
			card_info.ccname		= '';
			card_info.ccexpiredate	= fields[1].slice(2,4) + '/20' + fields[1].slice(0,2);
		}
		else
		{
			throw new Error('unkown credit card format');
		}

		card_info.raw = card;

		return card_info;
	}

	// @method getType @param {String} card_number @returns {String} @param {Array} card_types the credit card type (code)
	function getType (card_number, card_types)
	{
		var types = _.filter(card_types, function(t)
		{
			return card_number.match(t.pattern);
		});
		if (types && types[0]) {
			return types[0].code;
		}
		return null;
	}

	// @method getIcon @param {String} card_number @returns {String} @param {Array} card_types the credit icon
	function getIcon (card_number, card_types)
	{
		var types = _.filter(card_types, function(t)
		{
			return card_number.match(t.pattern);
		});
		if (types && types[0]) {
			return types[0].icon;
		}
		return null;
	}

	return {
		parseTrack: parseTrack
	,	getType: getType
	,	getIcon: getIcon
	};
});
