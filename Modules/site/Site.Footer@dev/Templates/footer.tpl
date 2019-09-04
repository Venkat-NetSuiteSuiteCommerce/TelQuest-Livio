{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

<div  data-cms-area="global_cms_over_footer" data-cms-area-filters="global"></div>

<div class="newsletter-container">

    <div><p class="newsletter-title">{{translate 'SIGN UP FOR OUR NEWSLETTER'}}</p></div>
    <div class="newsletter-subscribe" data-view="FooterContent">


        <form class="newsletter-suscription-form" data-action="newsletter-subscribe" novalidate>

            <div data-validation="control-group">

                <!--<h5 class="newsletter-subscription-form-label" for="login-email">{{translate 'Newsletter Sign Up'}}</h5>-->

                <div class="newsletter-subs-form-container {{#if showErrorMessage}}error{{/if}}" data-validation="control">
                    <input
                            name="email"
                            id="email"
                            type="email"
                            class="newsletter-suscription-form-input"
                            placeholder="{{translate 'username@domain.com'}}"
                    >

                    <button type="submit" class="newsletter-subform-button-subscribe">
                        {{translate 'SUBSCRIBE'}}
                    </button>

                    <div class="newsletter-alert-placeholder" data-type="alert-placeholder" >
                        {{#if isFeedback}}
                            <div data-view="GlobalMessageFeedback"></div>
                        {{/if}}
                    </div>
                </div>
            </div>
        </form>


    </div>


    <div><p class="newsletter-note">{{translate 'By signing up, you agree to receive our email notifications'}}</p></div>
    <div class="newsletter-cms" data-cms-area="newseltter-cms" data-cms-area-filters="global">

    </div>
    {{!-- <div class="shopper-approved" data-view="ShopperApprovedBanner"></div> --}}
</div>


<section class="footer">
    <div class="footer-container container">
        <div class="col-sm-6 col-md-3 col-lg-2" data-cms-area="footer-content-1" data-cms-area-filters="global">

        </div>
        <div class="col-sm-6 col-md-3 col-lg-2" data-cms-area="footer-content-2" data-cms-area-filters="global">

        </div>
        <div class="col-sm-6 col-md-3 col-lg-2" data-cms-area="footer-content-3" data-cms-area-filters="global">

        </div>
        <div class="col-sm-6 col-md-3 col-lg-2" data-cms-area="footer-content-4" data-cms-area-filters="global">

        </div>
        <div class="col-sm-6 col-md-3 col-lg-2" data-cms-area="footer-content-5" data-cms-area-filters="global">

        </div>
        <div class="col-sm-6 col-md-3 col-lg-2" data-cms-area="footer-content-6" data-cms-area-filters="global">

        </div>

    </div>
    <div class="copy">

        <div class="footernote" data-cms-area="footernote" data-cms-area-filters="global">

        </div>

        <div data-view="FooterCopyright"></div>
    </div>

<div data-view="Global.BackToTop"></div>
</section>


{{!----
Use the following context variables when customizing this template:

	showFooterNavigationLinks (Boolean)
	footerNavigationLinks (Array)

----}}
