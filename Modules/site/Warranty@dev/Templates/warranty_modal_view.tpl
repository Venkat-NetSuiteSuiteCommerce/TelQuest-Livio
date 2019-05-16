<div class="modal-warranty-cart">
    <div class="cart-confirmation-modal-img">
        <img data-loader="false" src="{{resizeImage thumbnail.url 'main'}}" alt="{{thumbnail.altimagetext}}">
    </div>
    <div class="cart-warranty-modal-view-copy">
        <h5>{{name}}</h5>
        <small>{{translate 'SKU:'}} {{sku}}</small>
        <div data-view="Options.Collection"></div>
    </div>
    <div class="cart-lines-table-last-warranty">
        {{#each warranty}}
            {{#if internalid}}
                <div class="cart-lines-table-last-warranty-label">
                    <input type="radio" {{#if isActive}}checked{{/if}}  data-toggle="select-warranty" name="{{cartOptionId}}" id="{{cartOptionId}}" value="{{internalid}}" />
                    <label for="" name="{{cartOptionId}}"
                           id="{{cartOptionId}}" value="{{internalid}}" {{#if isActive}}selected{{/if}}
                           data-active="{{isActive}}"
                           data-available="{{isAvailable}}"><span>{{label}}</span> {{#if price}}<span class="color-orange">{{formatCurrency price}}</span>{{/if}}</label>
                </div>
            {{/if}}

        {{/each}}
    </div>
</div>
<div class="clearfix"></div>


{{!----
<select
        name="{{cartOptionId}}"
        id="{{cartOptionId}}"
        class="item-views-option-dropdown-select"
        data-toggle="select-warranty">

    {{#each warranty}}
        {{#unless label}}
            <option value="">
                {{translate '--None--'}}
            </option>
        {{/unless}}
        {{#if internalid}}
            <option
                    class="{{#if isActive}}active{{/if}} {{#unless isAvailable}}muted{{/unless}}"
                    value="{{internalid}}"
                    {{#if isActive}}selected{{/if}}
                    data-active="{{isActive}}"
                    data-available="{{isAvailable}}">
                {{label}}
                {{#if price}}
                    {{formatCurrency price}}
                {{/if}}
            </option>
        {{/if}}
    {{/each}}

</select>
---}}
