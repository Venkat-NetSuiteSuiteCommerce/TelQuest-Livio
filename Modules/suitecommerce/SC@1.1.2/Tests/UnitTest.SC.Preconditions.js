/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(['UnitTestHelper.Preconditions'], function (Preconditions)
{
	var preconditions = {
		setPreconditions: function()
		{
			window.SC = Preconditions.deepExtend(window.SC || {}, {
				ENVIRONMENT: {
				}
			,	CONFIGURATION: {
					modulesConfig: {
						ProductDetails: {
							startRouter: true
						}
					}
				,	"ItemOptions": {
						"optionsConfiguration": [
							{
								"cartOptionId": "custcol1",
								"label": "The Selected Color ",
								"urlParameterName": "color",
								"colors": "default",
								"index": 10,
								"templateSelector": "product_views_option_color.tpl",
								"showSelectorInList": false,
								"templateFacetCell": "product_views_option_facets_color.tpl",
								"templateSelected": "transaction_line_views_selected_option_color.tpl"
							},
							{
								"cartOptionId": "giftcertfrom",
								"urlParameterName": "from",
								"colors": "",
								"label": "",
								"index": 20,
								"templateSelector": "",
								"showSelectorInList": false,
								"templateFacetCell": "",
								"templateSelected": ""
							},
							{
								"cartOptionId": "GIFTCERTRECIPIENTNAME",
								"urlParameterName": "to",
								"colors": "",
								"label": "",
								"index": null,
								"templateSelector": "",
								"showSelectorInList": false,
								"templateFacetCell": "",
								"templateSelected": ""
							},
							{
								"cartOptionId": "GIFTCERTRECIPIENTEMAIL",
								"urlParameterName": "to-email",
								"colors": "",
								"label": "",
								"index": null,
								"templateSelector": "",
								"showSelectorInList": false,
								"templateFacetCell": "",
								"templateSelected": ""
							},
							{
								"cartOptionId": "GIFTCERTMESSAGE",
								"urlParameterName": "message",
								"colors": "",
								"label": "",
								"index": null,
								"templateSelector": "",
								"showSelectorInList": false,
								"templateFacetCell": "",
								"templateSelected": ""
							}
						],
						"maximumOptionValuesQuantityWithoutPusher": 8,
						"defaultTemplates": {
							"selectorByType": [
								{
									"type": "select",
									"template": "product_views_option_tile.tpl"
								},
								{
									"type": "default",
									"template": "product_views_option_text.tpl"
								}
							],
							"facetCellByType": [
								{
									"type": "default",
									"template": "product_views_option_facets_color.tpl"
								}
							],
							"selectedByType": [
								{
									"type": "default",
									"template": "transaction_line_views_selected_option.tpl"
								}
							]
						}
					}
				}
			});

			window.SC.isPageGenerator = function ()
			{
				return false;
			}

			window.SC.getSessionInfo = function ()
			{
				return false;
			}
		}
	};

	preconditions.setPreconditions();
});