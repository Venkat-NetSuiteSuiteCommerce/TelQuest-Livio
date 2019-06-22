/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// jsdocs for commerce api. Most of this was taken from netsuite Help 'Commerce API Refence' page.



// @module ns.commerce

// The Commerce API exposes a new set of shopping objects and functions, designed especially for use in developing web store customizations. This API can be used in SSP application scripts, along with the full range of existing server-side SuiteScript.

// @class ShoppingSession




/*
@method doChangePassword

Changes the password for the customer identified by email. Returns true if the password is changed correctly.

Supported Domains: Checkout

Login Required?: no

@param {Object} Params – pass parameters from original request
@param {String} newPassword –  value for new password to be set
@return {Boolean}




@method getAbsoluteUrl

Gets absolute URL for given path and domain type.

Supported Domains: Checkout, Shopping

Login Required?: No

@param {String}  domaintype [required] - value should be either “shopping” or “checkout”
@param {String} path [required] 




@method getCampaignID

Gets the campaign ID of the leadsource parameter from the current session.

Parameters

No parameters to set.

Returns {String} campaignid

Supported Domains: Checkout, Shopping

Login Required?: No
*/


/*
@class OrderAddress

This object contains address information for a web store shopping order.

@property {String} addressee Person to which order is sent. Required
@property {String} addr1 First line of address. Required
@property {String} addr2 Second line of address
@property {String} addr3 Third line of address
@property {String} attention Text for ATTN: line of address
@property {String} city Required
@property {String} country Required

@property {String} defaultbil​l​i​n​g Indicates whether address is default billing address. Value should be “T” or “F”.
@property {String} defaultshi​p​p​i​n​g Indicates whether address is default shipping address. Value should be “T” or “F”.
@property {String} internalid Internal  ID
@property {String} isresidential Indicates whether address is residential. Value should be “T” or “F”.

@property {String}  phone Phone number. Required

@property {String} state State for address. Required
@property {String} zip Zip code. Required

*/



/*
@class OrderShipMethod

This object contains shipping method information for the order.

@property {String} name Name of the shipping method
@property {String} rate Rate of the shipping method
@property {String} shipcarrier Shipping carrier ID. Note: Valid values that can be set for shipcarrier are ups or noups.
@property {String} shipmethod Shipping method ID
*/


/*

@class OrderSummary This object contains summary information for the order.

@property {Number} discountedsubtotal Item subtotal - any applicable discount
@property {String} discountedsubtotal_ Item subtotal - any applicable discount formatted with currency symbol
@property {String} discountrate Raw discount
@property {Number} discounttotal Total amount of discounts applied
@property {String} discounttotal_formatted Total amount of discounts applied formatted with currency symbol
@property {Number} giftcertapplied Total amount of gift certificates applied
@property {String} giftcertapplied_formatted Total amount of gift certificates applied formatted with currency symbol
@property {Number} handlingcost Amount of handling cost
@property {String} handlingcost_formatted Amount of handling cost formatted with currency symbol
@property {Number} shippingcost Amount of shipping cost
@property {String} shippingcost_formatted Amount of shipping cost formatted with currency symbol
@property {Number} subtotal Total of quantity * rate per line item
@property {String} Total of quantity * rate per line item formatted with currency symbol
@property {Number} tax2total Total secondary tax on taxable elements of the order (items + shipping + handling) - effect of any discounts
@property {String} tax2total_formatted Total secondary tax on taxable elements of the order (items + shipping + handling) - effect of any discounts formatted with currency symbol
@property {Number} taxondiscount For VAT countries, currency amount of the tax rate * the discount amount
@property {String} taxondiscount_formatted For VAT countries, currency amount of the tax rate * the discount amount formatted with currency symbol
@property {Number} taxonhandling Currency amount of the tax rate * taxable handling amount
@property {String} taxonhandling_formatted Currency amount of the tax rate * taxable handling amount formatted with currency symbol
@property {Number} taxonshipping Currency amount of the tax rate * taxable shipping amount
@property {String} taxonshipping_formatted Currency amount of the tax rate * taxable shipping amount formatted with currency symbol
@property {Number} taxtotal Total tax on taxable elements of the order (items + shipping + handling) - effect of any discounts
@property {String} taxtotal_formatted Total tax on taxable elements of the order (items + shipping + handling) - effect of any discounts formatted with currency symbol
@property {Number} total Order subtotal + shipping, handling, and all tax, less the effect of any discounts
@property {String} total_formatted Order subtotal + shipping, handling, and all tax, less the effect of any discounts formatted with currency symbol

*/



/*
@class ShoppingSession
@method getSiteSettings Gets settings of current web store. Supported Domains: Checkout, Shopping. Login Required? No
@param {Array<String>}fields  [optional] Array of field names to be included in returned JSON object; if omitted, all supported fields are returned
Object with fields listed for sitesettings JSON object.
@returns {SiteSettings}

@class ShoppingSession.SiteSettings

@property {ShoppingSession.AnalyticsSettings} analytics Analytics settings
@property {ShoppingSession.CheckoutSettings} checkout Checkout settings
@properties {Array<Object>} currencies Array of JSON objects with fields (internalid, name, isdefault)
Ordered list of currencies supported by the site

@property {String} isdefault field is a Boolean, with a value of “T” for default currency, “F” for others
@property {String } defaultshipcountry Default ship to country
@property {String} defaultshi​p​p​i​n​g​m​e​t​h​o​d Default shipping method
@property {String} displayname 
@property {Array<Object>} imagesizes Array of JSON objects with image resize definitions (resizeid, resizeh, resizew).
Each object has the following properties:

 * maxwidth maximum resized image width in pixels
 * maxheight maximum resized image height in pixels
 * urlsuffix suffix that should be added to the image URL to return a resized image
 * internalid internal system ID of image resize definition.
 * name value from the Image Resize ID field (image resize definition) as entered on the Web Site Setup page.

@property {Array<Object>} languages
Array of JSON objects with fields (internalid, name, isdefault)
Ordered list of languages for the site
@property {String} isdefault field is a Boolean, with a value of “T” for default language, “F” for others

@property {String} loginallowed Indicates whether login is allowed. 

@property {String} loginrequired Indicates whether login is required to access the site. Value should be “T” or “F”.

@property {OrderSettings}order JSON ordersettings object .Order settings

@property {Array<PaymentMethod>}paymentmethods array of paymentmethod objects .Payment methods

@property {String} pricesincludevat Indicates whether prices include VAT. Value should be “T” or “F”.

@property {RegistrationSettings} registration JSON registrationsettings object. Registration settings

@property {String} requireloginforpricing Indicates whether login is required to display item prices. Value should be “T” or “F”.

@property {String}shipallcountries Indicates whether shipping is supported to all countries. Value should be “T” or “F”.

@property {String} shippingrequired Indicates whether shipping is required for the site. Value should be “T” or “F”.

@property {Array<String>}shiptocountries Countries where shipping is supported

@property {String} showextendedcart Indicates whether extended cart should be displayed. Value should be “T” or “F”.

@property {String} showshippi​n​g​e​s​t​i​m​a​t​o​r Indicates whether shipping estimator should be displayed.  Value should be “T” or “F”.

@property {String} sitetype Indicates the type of web site. Value should be ADVANCED or STANDARD.

ADVANCED indicates the site is a SuiteCommerce Advanced site where STANDARD indicates it is a Standard web site built with the NetSuite Site Builder.

@property {Array<Object>}subsidiaries Array of JSON objects with fields (internalid, name, isdefault). 
Ordered list of subsidiaries for the site. 

@property {String} isdefault field is a Boolean, with a value of “T” for default subsidiary, “F” for others





@class ShoppingSession.AnalyticsSettings
@property {String} clickattributes
@property {String} confpagetr​a​c​k​i​n​g​h​t​m​l
@property {String} submitattributes



@class ShoppingSession.CheckoutSettings
@property {String} cancelurl Full URL path for redirect after cancel action during order submission.
Used for PayPal Express support
@property {String} continueurl Full URL path for redirect after order submission
Used for PayPal Express support
@property {String} createorder If value is set to “T,” backend submits current shopping order when Continue link is clicked
Default value is “F”. Used for PayPal Express support
@property {String} custchoosespaymethod Value should be “T” or “F”.
@property {String} paymentauthorization threedsecure object with fields. Settings to handle payment authorization.
Used for 3D Secure support
@property {String} paymentmandatory Indicates whether payment is mandatory. Value should be “T” or “F”.
@property {String} paypalexpress. Object with fields. Used for PayPal Express support
Includes the following fields:

 * available (boolean) (must be set to “T” to support PayPal Express)
 * imageurl (string)

@property {String} requiretermsandconditions Indicates whether terms and conditions text is required.
Value should be “T” or “F”.
@property {String} saveccinfo Indicates whether credit card should be saved by default. 
Value should be “T” or “F”.
@property {String} shippingaddrfirst Indicates whether shipping address should be displayed first.
Value should be “T” or “F”.
@property {String} showpurchaseorder Indicates whether purchase order should be displayed.
Value should be “T” or “F”.
@property {String} showsavecc Indicates whether the Save Credit Card field should be displayed
Value should be “T” or “F”.
@property {String} termsandconditions Text of Terms and Conditions field
@property {String} type Used for integration with third party checkout providers
Valid values are: paypalexpress, google




@class ShoppingSession.OrderSettings

@property {String} itemdispla​y​o​r​d​e​r Ordering of items in an order
@property {String} outofstock​b​e​h​a​v​i​o​r Behavior for out of stock items
@property {String} upselldisplay One of 

 * Related Items Only Upsell Items
 * Related Items and then Upsell Items
 * Upsell Items and then Related Items



@class ShoppingSession.RegistrationSettings
@property {String} companyfie​l​d​m​a​n​d​a​t​o​r​y Indicates whether Company field is mandatory.
Value should be “T” or “F”.

@property {String} registrationallowed Indicates whether registration is allowed.
Value should be “T” or “F”.
@property {String} registrati​o​n​a​n​o​n​y​m​o​u​s Indicates whether registration is anonymous. 
Value should be “T” or “F”.
@property {String} registrati​o​n​m​a​n​d​a​t​o​r​y . Indicates whether registration is required. 
Value should be “T” or “F”.
@property {String} registrationoptional Indicates whether registration is optional. 
Value should be “T” or “F”.
@property {String} showcompanyfield Indicates whether to show Company field on registration form


@class ShoppingSession.PaymentMethod

This object includes payment method information for the order.

@property {String} internalid Internal ID
@property {String} iscreditcard Indicates whether payment method is a credit card. Value should be “T” or “F”.
@property {String} ispaypal Indicates whether payment method is PayPal. Value should be “T” or “F”. 
@property {String} name Name of the payment method 
@property {String}  paypalemai​l​a​d​d​r​e​s​s Primary paypal email address 
*/










/*
Back to ShoppingSession Methods | Back to Shopping Objects

getCorrelatedItems(item)

Gets array of correlated items for given item.

Note Item details will be returned only if the correlated item is available in the store from which the API was called from.  
Parameters

item [required]{object with values for fields}
internalid [required]
itemtype [required]
itemfields [optional] {array of item field names to query}
Note For better performance limit the number of queried fields by specifying only fields you need in the itemfields array.  
Returns

Array of objects of type item

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getCountries()

Gets all countries

Parameters

No parameters to set.

Returns

Array of objects with fields:

name {string}
code {string}
isziprequired {boolean}
Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getInformationItemFieldValues(infoItems)

Gets attribute values for given information items.

Parameters

infoItems [required] {Array}
Each object in array has values for field:

internalid [required]
Returns

Array of objects of type item.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getItemFieldValues(items)

Gets attribute values for given items.

Parameters

items [required] {Array} Each object in array has values for fields:
internalid [required]
itemtype [required]
Returns

Array of objects of type item.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getPartnerID()

Gets the Partner ID of the leadsource parameter from the current session.

Parameters

No parameters to set.

Returns

partnerid {String}

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getPasswordHint(customerEmail)

Retrieves password hint for customer with given email address.

Parameters

customerEmail [required] {String}
Returns

String

Supported Domains

Checkout

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getPaymentMethod(paymentMethodId, fields)

Gets payment method for given ID.

Parameters

paymentMethodId [required] {String}
fields [optional] Array of field names to be included in returned JSON object; if omitted, all supported fields are returned
Returns

Object of type paymentmethod.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getPaymentMethods(fields)

Gets payment methods accepted by the web store.

Parameters

fields [optional] Array of field names to be included in returned JSON object; if omitted, all supported fields are returned
Returns

Array of objects of type paymentmethod.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getRedirectURL()

 Gets the URL which is the result of a redirect given the input. Returns null if there is no redirect. Wildcards are also supported (*).

Parameters

url [required] {String}
Returns

String

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getRelatedItems(item)

Gets array of related items for given item.

Parameters

item [required]{object with values for fields}
internalid [required]
itemtype [required]
itemfields [optional] {array of item field names to query}
Note For better performance limit the number of queried fields by specifying only fields you need in the itemfields array.  
Returns

Array of objects of type item.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getShipToCountries()

Gets countries to which web store can ship.

Parameters

No parameters to set.

Returns

Array of objects with fields:

name{string}
code{string}
isziprequired {boolean}
Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getShopperCurrency()

Gets currency for current shopping session.

Parameters

No parameters to set.

Returns

Object with values for fields:

internalid {String}
name {String}
symbol {String}
precision {Number}
Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getShopperLanguageLocale()

Gets language and locale for current shopping session.

Parameters

No parameters to set.

Returns

localeid {String}

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getShopperPreferences()

Gets language, subsidiary, and currency preferences for the current shopping session.

Parameters

No parameters to set.

Returns

Object with values for fields:

language {String}
subsidiary{String}
currency{String}
Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getShopperSubsidiary()

Gets subsidiary for current shopping session.

Parameters

No parameters to set.

Returns

subsidiaryid {String}

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getSiteCategoryContents(siteCategory, recursive)

Gets contents of given site category.

If not provided, siteCategory will be defaulted to the root category, and recursive will be defaulted to false. When recursive is set to false, the API returns the category contents that include subcategories and items; when recursive is set to true, the API returns the complete tree of subcategories but not items. 

Note To get the complete category tree from the root, use getSiteCategoryContents(true).  
Parameters

siteCategory [optional] {Array} Each object in array has values for field:internalid [required]
recursive [optional]
Returns

Array of objects of type sitecategory or item.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getSiteCategoryFieldValues(siteCategories)

Gets attribute values of given site categories.

Parameters

siteCategories [required] {Array} Each object in array has values for field:
internalid [required]
Returns

Array of objects of type sitecategory.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects


Back to ShoppingSession Methods | Back to Shopping Objects

getSSPApplication()

Gets URL root of SSP application powering the current touchpoint.

Parameters

No parameters to set.

Returns

urlroot field value for sitesettings JSON object.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

getStates(countries)

Gets states and/or provinces.

Parameters

countries [optional] Array of strings for country codes
Returns

Returns an array of state/province names and state/province codes in the following format:

{"states":[{"name":"Alabama","code":"AL"},{"name":"Alaska","code":"AK"},...], "countrycode":"US"}

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

isChangePasswordRequest()

Returns true if all page parameters from the current request are valid for the password reset.

Throws the error "ERR_WS_EXPIRED_LINK" if all page parameters from the current request are valid but the link has expired.

Parameters

No parameters to set.

Returns

Boolean

Supported Domains

Checkout

Login Required?

no

Back to ShoppingSession Methods | Back to Shopping Objects

isLoggedIn()

Checks whether customer has logged in. This method can be used with the isRecognized() method. See Using isRecognized() with isLoggedIn().

Parameters

No parameters to set.

Returns

Boolean

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

isRecognized()

Determines whether a user is recognized. This method can be used with the isLoggedIn() method. See Using isRecognized() with isLoggedIn().

Parameters

No parameters to set.

Returns

Boolean

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

logIn(customer)

Logs in a customer.

Parameters

customer [required]{object with values for fields}
email [required]
password [required]
Returns

Object with fields:

customerid {String} - internal id of customer record for logged in customer
redirecturl{String} - URL to which user is redirected after logging in
Supported Domains

Checkout

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

logout()

Logs out a customer.

Note If logout() is attempted from a shopping context, it does not succeed and an error is returned.  
Parameters

No parameters to set.

Returns

Object with field:

redirecturl
The field redirecturl has the complete home URL to redirect to after logout. If not using the redirecturl field returned from logout(), the custom redirecturl should have the logoff=T parameter.

Supported Domains

Checkout

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

proceedToCheckout(CheckoutSettings)

Used for integration with a third party checkout provider such as PayPal Express. This API can only be called from a secure scheme (https).

Parameters

checkoutSettings Object with values for fields:
type; either “paypalexpress” or “google”
continueurl
cancelurl
Returns

No value returned.

Supported Domains

Checkout

Note Must have at least one order.  
Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

registerCustomer(customer)

Registers the customer and logs them in.

Parameters

customer [required]{object with values for fields}
firstname [required] {String}
lastname [required] {String}
companyname [optional] {String}
email [required] {String}
password [required] {String}
password2 [required] {String}
passwordhint [optional] {String}
emailsubscribe [optional] {String}
leadsource [optional] {String}
Returns

Object with values for fields:

customerid {String} - internal id of record for registered customer
redirecturl {String} - URL to which user is redirected after registering
Supported Domains

Checkout

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

registerGuest(guest)

Registers a guest.

Note Throws exception if register guest with password.  
Parameters

guest [optional]{object with values for fields}
firstname [optional] {String}
lastname [required] {String}
Returns

Object with values for fields:

customerid {String} - internal id of record for registered customer
redirecturl {String} - URL to which user is redirected after registering
Supported Domains

Checkout

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

sendPasswordRetrievalEmail(customeremail)

Sends password retrieval email to given email address.

Parameters

customerEmail [required] {String}
Returns

No value returned.

Supported Domains

Checkout

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

setShopperCurrency(currencyid)

Sets currency for current shopping session

Note Multiple Currencies feature must be enabled, specified currency must be supported in sitesettings, and logged in user must have permission to change currency.
Parameters

currencyid [required] {string}
Returns

No value returned.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

setShopperLanguageLocale(localeid)

Sets language and locale for current shopping session

Note Multi-Language feature must be enabled, and specified language must be supported in sitesettings.  
Parameters

localeid [required]{String}
Returns

No value returned.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

setShopperPreferences(prefs)

Sets language, subsidiary and currency for current shopping session.

Parameters

prefs [required]{object with values for fields}
language [optional] {String}
subsidiary [optional] {String}
currency [optional] {String}
Returns

No value returned.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

setShopperSubsidiary(subsidiary)

Sets subsidiary for current shopping session (for NetSuite OneWorld users).

Parameters

subsidiary [required]{String}
Returns

No value returned.

Supported Domains

Checkout, Shopping

Login Required?

No

Back to ShoppingSession Methods | Back to Shopping Objects

Using isRecognized() with isLoggedIn()

There are four possible cases for using the isLoggedIn() method and isRecognized() method to correctly determine the logged in status of a user:

new (anonymous) user: isRecognized() == false and isLoggedIn() == false
registered and logged in user: isRecognized() == true and isLoggedIn() == true
user who clicked logout: isRecognized() == false and isLoggedIn() == false
user who had logged in, then closed his browser and later returns to the shop: isRecognized() == true and isLoggedIn() == false
Note This last scenario is the only case where the isRecognized() status differs from the isLoggedIn() status. In this case the user didn’t click on the logout link and is therefore still recognized but isLoggedIn() returns false.
Related Topics

*/