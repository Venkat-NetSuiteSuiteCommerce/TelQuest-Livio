/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(function ()
{
	var matrix_item = {
			"items": [
				{
					"custitem_ns_pr_item_attributes": "&nbsp;",
					"searchkeywords": "",
					"isonline": true,
					"matrixchilditems_detail": [
						{
							"isinstock": false,
							"custitem11": "BOOMs",
							"itemid": "Lawrencium (Mtr&SubMinQty)-B",
							"internalid": 355,
							"showoutofstockmessage": false,
							"ispurchasable": true,
							"itemtype": "InvtPart",
							"quantityavailable": 0,
							"outofstockmessage": "",
							"onlinecustomerprice_detail": {
								"onlinecustomerprice_formatted": "$100.00",
								"onlinecustomerprice": 100
							},
							"stockdescription": "",
							"isbackorderable": true
						},
						{
							"isinstock": false,
							"custitem11": "Toys",
							"onlinecustomerprice_detail": {
								"onlinecustomerprice_formatted": "$100.00",
								"onlinecustomerprice": 100
							},
							"itemid": "Lawrencium (Mtr&SubMinQty)-T",
							"internalid": 356,
							"showoutofstockmessage": false,
							"outofstockbehavior": "- Default -",
							"minimumquantity": 44,
							"ispurchasable": true,
							"itemtype": "InvtPart",
							"quantityavailable": 0,
							"outofstockmessage": "",
							"stockdescription": "",
							"isbackorderable": true
						}
					],
					"ispurchasable": true,
					"custitem_ns_pr_attributes_rating": "",
					"stockdescription": "",
					"storedetaileddescription": "",
					"itemimages_detail": {
						"urls": [
							{
								"altimagetext": "",
								"url": "http://sm.oloraqa.com/images/lawrencium.01.jpg"
							},
							{
								"altimagetext": "",
								"url": "http://sm.oloraqa.com/images/lawrencium.02.jpg"
							}
						]
					},
					"onlinecustomerprice_detail": {
						"onlinecustomerprice_formatted": "$100.00",
						"onlinecustomerprice": 100
					},
					"custitem_ns_pr_rating_by_rate": "",
					"internalid": 354,
					"isdonationitem": false,
					"featureddescription": "",
					"outofstockmessage": "",
					"itemoptions_detail": {
						"matrixtype": "parent",
						"fields": [
							{
								"ismandatory": true,
								"internalid": "custcol11",
								"ismatrixdimension": true,
								"values": [
									{
										"label": "- Select -"
									},
									{
										"internalid": "1",
										"label": "BOOMs"
									},
									{
										"internalid": "2",
										"label": "Toys"
									}
								],
								"label": "Inner Use",
								"type": "select",
								"sourcefrom": "custitem11"
							}
						]
					},
					"storedescription": "",
					"pricelevel1_formatted": "$100.00",
					"isinactive": false,
					"isinstock": false,
					"metataghtml": "",
					"onlinecustomerprice": 100,
					"pagetitle2": "Lawrencium (Mtr&SubMinQty)",
					"itemid": "Lawrencium (Mtr&SubMinQty)",
					"showoutofstockmessage": false,
					"outofstockbehavior": "- Default -",
					"itemtype": "InvtPart",
					"quantityavailable": 0,
					"displayname": "",
					"storedisplayname2": "Lawrencium (Mtr&SubMinQty)",
					"pricelevel1": 100,
					"pagetitle": "",
					"urlcomponent": "lawrencium"
				}
			],
			"facets": [
				{
					"id": "custitem1",
					"url": "custitem1",
					"values": [
						{
							"url": ""
						}
					]
				},
				{
					"id": "custitem_ns_pos_physical_item",
					"url": "custitem_ns_pos_physical_item",
					"values": []
				},
				{
					"id": "onlinecustomerprice",
					"values": [
						{
							"url": "100.0",
							"label": "100.0"
						}
					],
					"min": 100,
					"max": 100,
					"ranges": []
				},
				{
					"id": "itemtype",
					"values": [
						{
							"url": "InvtPart"
						}
					]
				},
				{
					"id": "location",
					"values": []
				},
				{
					"id": "category",
					"values": []
				}
			],
			"corrections": [],
			"locale": {
				"country": "US",
				"language": "en",
				"currency": "USD",
				"region": 1
			},
			"volatility": "unique",
			"code": 200,
			"warnings": {}
		}
	,	item_schema = {
			"$schema": "http://json-schema.org/draft-04/schema#",
			"type": "object",
			"properties": {
				"item": {
					"type": "object",
					"properties": {
					},
					"required": [
						"internalid"
					]
				},
				"quantity": {
					"type": "integer"
				},
				"options": {
					"type": "array",
					"items": {
						"type": "object",
						"properties": {
							"cartOptionId": {
								"type": "string"
							},
							"itemOptionId": {
								"type": "string"
							},
							"label": {
								"type": "string"
							},
							"type": {
								"type": "string"
							}
						},
						"required": [
							"cartOptionId",
							"itemOptionId",
							"label",
							"type"
						]
					}
				}
			},
			"required": [
				"item",
				"quantity",
				"options"
			]
		};

	return {
		matrixItem: matrix_item
	,	itemSchema: item_schema
	};
})