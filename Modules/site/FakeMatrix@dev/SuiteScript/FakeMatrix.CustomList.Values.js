define('FakeMatrix.CustomList.Values', [
    'underscore',
    'SC.Model',
    'SuiteletProxy'
], function CustomListsModel(
    _,
    SCModel,
    SuiteletProxy
) {
    'use strict';

    return SCModel.extend({

        name: 'FakeMatrixCustomLists',

        getCustomLists: function getCustomLists() {
            var lists = SC.Configuration.fakematrix.options;
            var matrixLists = {};
            var response;
            var parsedLists = _.compact(_.pluck(lists, 'list'));
            response = new SuiteletProxy({
                scriptId: 'customscript_athq_get_custom_lists',
                deployId: 'customdeploy_athq_get_custom_lists',
                parameters: {
                    lists: parsedLists.join(',')
                },
                body: null,
                requestType: 'GET',
                isAvailableWithoutLogin: true,
                cache: {
                    enabled: true,
                    ttl: 2 * 60 * 60
                }
            }).get();

            if (response) {
                _.each(lists, function eachList(option) {
                    matrixLists[option.fieldId] = response[option.list];
                });
            }

            return matrixLists;
        }
    });
});
