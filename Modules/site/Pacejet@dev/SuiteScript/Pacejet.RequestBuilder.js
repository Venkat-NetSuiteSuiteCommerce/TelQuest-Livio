define('Pacejet.RequestBuilder', [
    'Pacejet.Configuration',
    'Pacejet.Utils',
    'underscore'
], function PacejetRequestBuilder(
    PJConfig,
    PJUtils,
    _
) {
    'use strict';

    return {
        build: function build(data) {
            var obj = this.buildBaseObject(data);
            _.extend(obj, {
                'Origin': this.buildOrigin(data),
                'Destination': this.buildDestination(data),
                'CustomFields': this.buildCustomFields(data),
                'PackageDetailsList': this.buildPackages(data),
                'MessageList': this.buildMessageList(data)
            });
            return obj;
        },


        buildBaseObject: function buildBaseObject() {
            var base = {
                'Origin': {},
                'Destination': {},
                'CustomFields': [],
                'PackageDetailsList': [],
                'MessageList': [],
                'ShipmentDetail': {
                    'WeightUOM': 'LB'
                }
            };

            return base;
        },
        buildOrigin: function buildOrigin(/* data */) {
            return {
                'CompanyName': 'ShipItFaster.com',
                'Address1': '26 Commerce Rd',
                'Address2': 'Suite B',
                'City': 'Fairfield',
                'StateOrProvinceCode': 'NJ',
                'PostalCode': '07004',
                'CountryCode': 'US',
                'ContactName': 'Steve Sellers',
                'Email': 'adel@telquestintl.com',
                'Phone': '973 808-4589'
            };
        },
        buildDestination: function buildDestination(data) {
            var address = data.transaction.shipaddress;
            if (address.attention && address.addressee) {
                address.fullname = address.attention;
                address.company = address.addressee;
            } else {
                address.fullname = address.addressee;
                address.company = undefined;
            }

            return {
                'LocationCode': address.internalid,
                'CompanyName': address.company,
                'Address1': address.addr1,
                'Address2': !PJUtils.isNSEmpty(address.addr2) ? address.addr2 : undefined,
                'City': address.city,
                'StateOrProvinceCode': address.state,
                'PostalCode': address.zip,
                'CountryCode': address.country,
                'ContactName': address.fullname,
                'Email': data.entity.email,
                'Phone': address.phone,
                'Residential': (address.isresidential + '') === 'T'
            };
        },

        buildMessageList: function buildMessageList() {
            /*
            Message, Ship_Group, Delivery_Instructions, NetSuite_Location
             */
            return [
                /*
                { 'name': 'aaa', 'value': 'bbb' }
                 */
            ];
        },
        buildCustomFields: function buildCustomFields() {
            // Flag to disable autopack for a specific transaction (default is TRUE)
            return [{
                'name': 'AutoPackShipment',
                'value': 'TRUE'
            }];
        },


        buildPackages: function buildPackages(data) {
            var productDetailsList = _.map(data.transaction.items, function eachItem(item) {
                var mock = {
                    'Weight': 0,
                    'Quantity': {
                        'Units': PJConfig.defaultUnitUOM,
                        'Value': item.quantity
                    },
                    'Price': {
                        'Amount': 0
                    },
                    'Dimensions': {
                    },

                    'Cost': {
                        'Value': 0,
                        'Units': PJConfig.defaultUnitUOM
                    },
                    'NetsuiteItemInternalId': item.internalid,
                    'ExternalID': item.internalid,
                    'Number': item.itemid,
                    'Description': item.salesdescription,

                    'packUIRmngItem': 'N',
                    'CommodityName': !PJUtils.isNSEmpty(item.custitem_pacejet_commodity_name) ? item.custitem_pacejet_commodity_name : undefined,
                    'AutoPack': ((item.custitem_pacejet_item_autopack + '') === 'T') || item.custitem_pacejet_item_autopack === true

                };

                if (!PJUtils.isNSEmpty(item.upccode)) {
                    mock.UPCCode = item.upccode;
                } else if (!PJUtils.isNSEmpty(item.custitem_pacejet_upc_code)) {
                    mock.UPCCode = item.custitem_pacejet_upc_code;
                }

                if (!PJUtils.isNSEmpty(item.custitem_pacejet_item_height)) {
                    mock.Dimensions.Height = item.custitem_pacejet_item_height;
                }
                if (!PJUtils.isNSEmpty(item.custitem_pacejet_item_width)) {
                    mock.Dimensions.Width = item.custitem_pacejet_item_width;
                }
                if (!PJUtils.isNSEmpty(item.custitem_pacejet_item_length)) {
                    mock.Dimensions.Length = item.custitem_pacejet_item_length;
                }

                mock.Dimensions.Units = PJConfig.defaultLengthUnits;

                if (!PJUtils.isNSEmpty(item.weight)) {
                    mock.Weight = PJUtils.convertWeight(item.weight, item.weightunit.name, null, PJConfig.defaultWeightUOM);
                } else {
                    mock.Weight = 4;
                }

                if (!PJUtils.isNSEmpty(mock.unitdisplay)) {
                    mock.Quantity.Units = item.unitdisplay;
                } else if (!PJUtils.isNSEmpty(mock.saleunit)) {
                    mock.Quantity.Units = item.saleunit;
                }

                if (!PJUtils.isNSEmpty(mock.rate)) {
                    mock.Price.Amount = mock.rate;
                } else {
                    mock.Price.Amount = PJUtils.round2Fixed(
                        PJUtils.isNSEmpty(item.amount) ?
                            item.cost :
                            parseFloat(item.amount / parseInt(item.quantity, 10)));
                }

                // TODO: esto no lo llenan pero podrian;
                mock.Price.Currency = '';

                if (!PJUtils.isNSEmpty(item.cost)) {
                    mock.Cost.Value = item.cost;
                }

                mock.Cost.Units = mock.Quantity.Units;

                return mock;
            });

            return [{
                'ProductDetailsList': productDetailsList
            }];
        }
    };
});
