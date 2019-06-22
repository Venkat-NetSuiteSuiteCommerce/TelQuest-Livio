{{#if isAddOnable}}
   <div class="item-views-option-dropdown-addon-item"
        data-id="{{itemOptionId}}"
        data-type="option"
        data-cart-option-id="{{cartOptionId}}">

    <h4>{{translate 'Additional Warranty'}}</h4>

    {{#if isCheckboxMode}}
        <div class="item-views-option-dropdown-addon-item-label-wrapper">
            <label
                class="item-views-option-dropdown-addon-item-checkbox
                {{#if isActive}}active{{/if}}
                {{#unless isAvailable}}muted{{/unless}}">

                <input
                    type="checkbox"
                    name="{{cartOptionId}}"
                    value="{{firstOption.internalid}}"
                    {{#if isActive}}checked{{/if}}
                    data-toggle="set-option"
                    data-active="{{isActive}}"
                    data-available="{{isAvailable}}"/>
                <span>{{firstOption.label}} + {{addOnModel.price_formatted}}</span>
            </label>
        </div>
        
    {{else}}
        <div class="item-views-option-dropdown-addon-item-label-wrapper">
            <select
                name="{{cartOptionId}}"
                id="{{cartOptionId}}"
                class="item-views-option-dropdown-select"
                data-toggle="select-option">

                {{#each values}}
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
                            {{#if addOnModel}}
                                {{addOnModel.price_formatted}}
                            {{/if}}
                        </option>
                    {{/if}}
                {{/each}}

            </select>
        </div>
    {{/if}}
    </div>
{{/if}}
