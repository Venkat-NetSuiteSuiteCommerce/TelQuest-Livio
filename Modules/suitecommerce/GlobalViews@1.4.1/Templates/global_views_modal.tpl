{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

<div class="modal-dialog global-views-modal {{modalDialogClass}}">
	<div class="global-views-modal-content">
		<!--Modal-Header -->
			<button type="button" class="global-views-modal-content-header-close" data-dismiss="modal" aria-hidden="true">
				&times;
			</button>
			{{#if showPageHeader}}
				<h2 class="global-views-modal-content-header-title">
					{{pageHeader}}
				</h2>
			{{/if}}

		<!--Modal-content -->
		<div id="modal-body" data-type="modal-body" class=" global-views-modal-content-body" data-view="Child.View">
		</div>
	</div>
</div>



{{!----
Use the following context variables when customizing this template:

	pageHeader (String)
	showPageHeader (Boolean)
	modalDialogClass (String)

----}}
