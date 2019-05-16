define('FakeMatrix.Item.KeyMapping', [
    'Item.KeyMapping',
    'SC.Configuration',
    'underscore'
], function FakeMatrixItemKeyMapping(
    ItemKeyMapping,
    Configuration,
    _
) {
    if (!Configuration.itemKeyMapping) {
        Configuration.itemKeyMapping = {};
    }

    function setConfigurationOption(matrixDimension) {
        var itemOptions = Configuration.ItemOptions.optionsConfiguration || [];
        var option = _.findWhere(itemOptions, { cartOptionId: matrixDimension.fieldId });
        var url;
        var index;
        if (!option) {
            index = matrixDimension.fieldId.lastIndexOf('_');
            url = matrixDimension.fieldId.substring(index + 1);
            itemOptions.push({
                cartOptionId: matrixDimension.fieldId,
                label: matrixDimension.label,
                url: url,
                urlParameterName: url
            });
        }
    }

    _(Configuration.itemKeyMapping).extend({
        _url: function url(item) {
            if (item.get('_isChild') && item.get('_getParentUrl')) {
                return '/' + item.get('_getParentUrl');
            }
            return item.get('urlcomponent') ? '/' + item.get('urlcomponent') : '/product/' + item.get('internalid');
        },
        _isParent: function isParent(item) {
            return item.get('custitem_awa_is_custom_parent');
        },
        _getParentUrl: function getParentUrl(item) {
            return item.get('custitem_awa_custom_parent_url');
        },
        _isChild: function isChild(item) {
            return item.get('custitem_awa_is_custom_child');
        },
        _optionsDetails: function optionsDetails(item) {
            var options = item.get('itemoptions_detail');
            var lists = SC.getPublishedObject('FakeMatrixCustomLists');
            var matrixOptions;
            var dimensions;
            if (item.get('_isParent') || (item.get('_isChild') && item.get('matrix_parent') && item.get('matrix_parent').internalid)) {
                matrixOptions = Configuration.get('fakematrix.options');
                dimensions = ((item.get('matrix_parent') && item.get('matrix_parent').custitem_awa_matrix_dimensions) ||
                    item.get('custitem_awa_matrix_dimensions') || '').trim();

                dimensions = dimensions.split(', ');

                options.fields = options.fields || [];

                _.each(dimensions, function eachDimension(dimension) {
                    var matrixDimension = _.findWhere(matrixOptions, { name: dimension });

                    if (matrixDimension && matrixDimension.fieldId) {
                        options.fields.push({
                            internalid: matrixDimension.fieldId,
                            ismatrixdimension: true,
                            ismandatory: true,
                            sourcefrom: matrixDimension.fieldId,
                            label: matrixDimension.label,
                            type: 'select',
                            values: (lists && matrixDimension.fieldId) ? lists[matrixDimension.fieldId] || [] : []
                        });

                        setConfigurationOption(matrixDimension);
                    }
                });
            }

            return options;
        },

        _getChildSelectedOptions: function getChildSelectedOptions(item) {
            var ret = {};
            var optionValue = '';
            var lists = SC.getPublishedObject('FakeMatrixCustomLists');
            var childOptions = Configuration.get('fakematrix.options');
            var url;
            if (item.get('_isChild')) {
                _.each(childOptions, function eachChildOption(currentOption) {
                    optionValue = _.findWhere(lists[currentOption.fieldId], { label: item.get(currentOption.fieldId) }) || '';
                    if (optionValue && optionValue.internalid && optionValue.internalid !== '') {
                        url = currentOption.url;
                        ret[url] = optionValue.internalid;
                    }
                });
                return ret;
            }
            return {};
        },

        _matrixChilds: function matrixChilds(item) {
            var relatedItems = item.get('relateditems_detail');
            var childOptions = Configuration.get('fakematrix.options');
            relatedItems = _.map(relatedItems, function mapRelatedItems(item) {
                _.each(childOptions, function eachChildOption(option) {
                    if (item[option.fieldId]) {
                        item[option.fieldId] = item[option.fieldId].toString();
                    }
                });
                return item;
            });
            return relatedItems;
        },

        _name: function _name(item) {
            // If its a matrix child it will use the name of the parent
            var itemId = item.get('itemid') || '';
            var parent = item.get('_matrixParent');
            var matches;
            var childName;
            if (parent.get('internalid')) {
                matches = itemId.match(/:(.*)/);
                childName = matches && matches[1];
                return childName || parent.get('storedisplayname2') || parent.get('displayname') || itemId;
            } else if (item.get('_isChild')) {
                parent = item.get('matrix_parent');
                if (parent && parent.get('internalid')) {
                    matches = itemId.match(/:(.*)/);
                    childName = matches && matches[1];
                    return childName || parent.get('storedisplayname2') || parent.get('displayname') || itemId;
                }
            }

            // Otherwise return its own name
            return item.get('storedisplayname2') || item.get('displayname') || itemId;
        },

        _originalName: function _originalName(item) {
            var itemId = item.get('itemid') || '';
            // Otherwise return its own name
            return item.get('storedisplayname2') || item.get('displayname') || itemId;
        },

        _isPurchasable: function _isPurchasable(item) {
            return item.get('ispurchasable') && !item.get('_isParent');
        }
    });
});
