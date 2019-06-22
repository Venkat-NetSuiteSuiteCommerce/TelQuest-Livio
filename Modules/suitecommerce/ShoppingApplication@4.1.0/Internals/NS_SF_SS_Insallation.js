/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*global nlapiSubmitRecord:false, nlapiCreateRecord:false, nlapiDeleteRecord:false, nlapiLogExecution:false*/
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/
function afterInstall (version, bundle)
{
	'use strict';

	var remove = false

	,	recordsToCreateSite = [{

			initvalues: {
				sitetype: 'ADVANCED'
			}

		,	fieldset: [
				{
					fieldsetname: 'Search'
				,	fieldsetid: 'search'
				,	description: 'Search Fieldset'
				,	fieldsetrecordtype: 'ITEM'
				,	fieldsetfields: 'custitem_ns_pr_rating,custitem_ns_pr_count,custitem_bike_type,itemoptions_detail,onlinecustomerprice,onlinecustomerprice_detail,onlinecustomerprice_formatted,onlinematrixpricerange,onlinematrixpricerange_formatted,quantityavailable,displayname,itemid,outofstockbehavior,outofstockmessage,stockdescription,storedescription,storedisplaythumbnail,storedisplayname2'
				}
			,	{
					fieldsetname: 'Details'
				,	fieldsetid: 'details'
				,	description: 'Details Fieldset'
				,	fieldsetrecordtype: 'ITEM'
				,	fieldsetfields: 'custitem_ns_pr_rating_by_rate,custitem_ns_pr_rating,custitem_ns_pr_count,custitem_bike_brands,custitem_bike_specs,custitem_bike_type,itemimages_detail,itemoptions_detail,matrixchilditems_detail,onlinecustomerprice_detail,pricelevel1,pricelevel1_formatted,quantityavailable,displayname,itemtype,itemid,outofstockbehavior,outofstockmessage,pagetitle,rate,rate_formatted,relateditemsdescription,stockdescription,storedetaileddescription,storedisplayimage,storedisplayname2,urlcomponent'
				}
			,	{
					fieldsetname: 'Matrix Child Items'
				,	fieldsetid: 'matrixchilditems'
				,	description: 'Matrix Child Items Fieldset'
				,	fieldsetrecordtype: 'ITEM'
				,	fieldsetfields: 'custitem_matrix_child_image,onlinecustomerprice_detail,pricelevel1,pricelevel1_formatted,quantityavailable,outofstockbehavior,outofstockmessage,stockdescription'
				}
			]

		,	facetfield: [
				{
					facetfieldid: 'custitem_bike_brands'
				,	facetfieldname: 'custitem_bike_brands'
				,	facetsortorder: 'ALPHA_ASCENDING'
				,	faceturl: 'brand'
				}
			,	{
					facetfieldid: 'custitem_bike_colors'
				,	facetfieldname: 'custitem_bike_colors'
				,	facetsortorder: 'ALPHA_ASCENDING'
				,	faceturl: 'color'
				}
			,	{
					facetfieldid: 'custitem_bike_type'
				,	facetfieldname: 'custitem_bike_type'
				,	facetsortorder: 'ALPHA_ASCENDING'
				,	faceturl: 'type'
				}
			,	{
					facetfieldid: 'custitem_exclude_from_search'
				,	facetfieldname: 'custitem_exclude_from_search'
				,	facetsortorder: 'ALPHA_ASCENDING'
				,	faceturl: 'efsearch'
				}
			,	{
					facetfieldid: 'custitem_gt_matrix_colors'
				,	facetfieldname: 'custitem_gt_matrix_colors'
				,	facetsortorder: 'ALPHA_ASCENDING'
				,	faceturl: 'mcolors'
				}
			,	{
					facetfieldid: 'custitem_matrix_tire_size'
				,	facetfieldname: 'custitem_matrix_tire_size'
				,	facetsortorder: 'ALPHA_ASCENDING'
				,	faceturl: 'msize'
				}
			,	{
					facetfieldid: 'custitem_tire_size'
				,	facetfieldname: 'custitem_tire_size'
				,	facetsortorder: 'ALPHA_ASCENDING'
				,	faceturl: 'size'
				}
			,	{
					facetfieldid: 'pricelevel5'
				,	facetfieldname: 'pricelevel5'
				,	facetsortorder: 'ALPHA_ASCENDING'
				,	faceturl: 'price'
				}
			]

		,	shoppingdomain: [{
				domain: 'shopflow.dev'
			,	isprimary: 'T'
			,	hostingroot: '2'
			}]
		}];

	if (remove)
	{
		recordsToCreateSite.forEach(function (record)
		{
			nlapiDeleteRecord('website', record.initvalues.name);
		});
	}
	else
	{
		recordsToCreateSite.forEach(function (record)
		{
			if (record.initvalues)
			{
				var site = nlapiCreateRecord('website', record.initvalues);

				site.setFieldValue('displayname', 'New Ref Store');
				site.setFieldValue('internalname', 'New Ref Store');

				if (record.fieldset)
				{
					record.fieldset.forEach(function (fieldset)
					{
						site.selectNewLineItem('fieldset');

						for (var key in fieldset)
						{
							if (fieldset.hasOwnProperty(key))
							{
								site.setCurrentLineItemValue('fieldset', key, fieldset[key]);
							}
						}

						site.commitLineItem('fieldset');
					});
				}

				if (record.facetfield)
				{
					record.facetfield.forEach(function (facet)
					{
						site.selectNewLineItem('facetfield');

						for (var key in facet)
						{
							if (facet.hasOwnProperty(key))
							{
								site.setCurrentLineItemValue('facetfield', key, facet[key]);
							}
						}

						site.commitLineItem('facetfield');
					});
				}

				if (record.shoppingdomain)
				{
					record.shoppingdomain.forEach(function (domain)
					{
						site.selectNewLineItem('shoppingdomain');

						for (var key in domain)
						{
							if (domain.hasOwnProperty(key))
							{
								site.setCurrentLineItemValue('shoppingdomain', key, domain[key]);
							}
						}

						site.commitLineItem('shoppingdomain');
					});
				}

				nlapiSubmitRecord(site);
			}
		});

		nlapiLogExecution('DEBUG', 'DEFF Website', JSON.stringify(recordsToCreateSite));
	}
}