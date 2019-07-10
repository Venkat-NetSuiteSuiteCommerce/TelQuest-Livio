{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

<form class="cart-quickaddtocart" data-action="add-to-cart">
	<div data-view="ProductViewsPrice.Price" class="cart-quickaddtocart-price"></div>
	{{#if showQuickAddToCartButton}}
		<div data-view="AddToCart">
			<input name="quantity" data-action="setquantity" class="cart-quickaddtocart-quantity" type="number" min="{{minimumQuantity}}" value="{{quantity}}"/>
		</div>
	{{/if}}
    
    {{#if isParent}}
        <div class="cart-add-to-cart-button-container">
            <div class="cart-add-to-cart-button">
                <a data-hashtag="{{url}}" data-touchpoint="home" data-action="sticky" class="cart-add-to-cart-button-button">
                    {{translate 'see details'}}
                </a>
            </div>
        </div>
    {{/if}}

</form>




{{!----
Use the following context variables when customizing this template:

	itemId (Number)
	showQuickAddToCartButton (Boolean)
	minimumQuantity (Number)
	quantity (Number)

----}}
