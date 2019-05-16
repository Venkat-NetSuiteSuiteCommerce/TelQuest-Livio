function addRelatedItem(type) {
    var parentItemId;
    var oldParentItemId;
    var isMatrixChild;
    var oldIsMatrixChild;
    var childId;
    var parentItem;
    var line;
    var oldRecord = nlapiGetOldRecord();

    if (type === 'delete' || type === 'edit') {
        oldParentItemId = oldRecord.getFieldValue('custitem_awa_custom_parent');
        oldIsMatrixChild = oldRecord.getFieldValue('custitem_awa_is_custom_child') === 'T';
        childId = oldRecord.getId();
    }

    if (type === 'create' || type === 'edit') {
        parentItemId = nlapiGetFieldValue('custitem_awa_custom_parent');
        isMatrixChild = nlapiGetFieldValue('custitem_awa_is_custom_child') === 'T';
        childId = nlapiGetRecordId();

    }

    if (childId && (isMatrixChild !== oldIsMatrixChild || parentItemId !== oldParentItemId)) {
        if (oldParentItemId) {
            parentItem = nlapiLoadRecord('noninventorypart', oldParentItemId);
            line = findLineItem(parentItem, childId);

            if (line && line > 0) {
                parentItem.removeLineItem('presentationitem', line);
                nlapiSubmitRecord(parentItem);
            }

        }

        if (parentItemId) {
            parentItem = nlapiLoadRecord('noninventorypart', parentItemId);
            line = findLineItem(parentItem, childId);

            if (line && line > 0 && !isMatrixChild) {
                parentItem.removeLineItem('presentationitem', line);
            } else if (line < 0 && isMatrixChild) {
                parentItem.selectNewLineItem('presentationitem');
                parentItem.setCurrentLineItemValue('presentationitem', 'presentationitem', childId);
                parentItem.commitLineItem('presentationitem');
            }

            nlapiSubmitRecord(parentItem);
        }
    }
}

function findLineItem(parentItem, childId) {
    var relatedItemsQty = parentItem.getLineItemCount('presentationitem');
    var found = false;
    var line;
    for (line = 1; line <= relatedItemsQty && !found; line++) {
        found = parentItem.getLineItemValue('presentationitem', 'presentationitem', line) === childId;
    }

    return found ? line : -1;
}
