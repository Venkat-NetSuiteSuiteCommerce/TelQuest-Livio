/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	['LivePayment.Model', 'UnitTestHelper']
,	function (LivePaymentModel, UnitTestHelper)
{
	'use strict';

	var helper = new UnitTestHelper({
		applicationName: 'LivePaymentModel'
	});

	return describe('PaymentModel Module', function ()
	{
		describe('Distribution algorithm', function ()
		{
			function testAdd (options)
			{

				var	application = SC.Application('MyAccount')
				,	pm = new LivePaymentModel({
							credits: options.creditsData
						,	invoices: options.invoicesData
						,	deposits: options.depositsData
					}, {application: helper.application})
				,	invoices = pm.get('invoices')
				,	deposits = pm.get('deposits')
				,	credits = pm.get('credits');

				invoices.each(function (invoice)
				{
					invoice.set('apply', true);
				});

				pm.distributeCredits();

				expect(credits.length).toEqual(options.creditsData && options.creditsData.length || 0);
				expect(invoices.length).toEqual(options.invoicesData && options.invoicesData.length || 0);
				expect(deposits.length).toEqual(options.depositsData && options.depositsData.length || 0);

				pm.distributeCredits();

				expect(pm.get('payment')).toEqual(options.expected_payment_total);
				expect(pm.get('invoices_total')).toEqual(options.expected_invoices_total);
				expect(pm.get('deposits_total')).toEqual(options.expected_deposits_total);
				expect(pm.get('credits_total')).toEqual(options.expected_credits_total);

			}

			it('Test initialize', function ()
			{
				testAdd({
					invoicesData: []
				,	depositsData: []
				,	creditsData: []
				,	expected_payment_total: 0
				,	expected_invoices_total: 0
				,	expected_deposits_total: 0
				,	expected_credits_total: 0
				,	expected_apply_deposits: []
				,	expected_apply_credits: []
				});
			});

			it('Test adding invoices only', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 20, datecreated: 100}
					,	{amount: 10, datecreated: 10}
					]
				,	depositsData: []
				,	creditsData: []
				,	expected_payment_total: 30
				,	expected_invoices_total: 30
				,	expected_deposits_total: 0
				,	expected_credits_total: 0
				,	expected_apply_deposits: []
				,	expected_apply_credits: []
				});
			});

			it('Test adding deposits only', function ()
			{
				testAdd({
					invoicesData: []
				,	depositsData: [
						{remaining: 20}
					,	{remaining: 100}
					]
				,	creditsData: []
				,	expected_payment_total: 0
				,	expected_invoices_total: 0
				,	expected_deposits_total: 0
				,	expected_credits_total: 0
				,	expected_apply_deposits: []
				,	expected_apply_credits: []
				});
			});

			it('Test adding credit memos only', function ()
			{
				testAdd({
					invoicesData: []
				,	depositsData: []
				,	creditsData: [
						{remaining: 20}
					,	{remaining: 10}
					]
				,	expected_payment_total: 0
				,	expected_invoices_total: 0
				,	expected_deposits_total: 0
				,	expected_credits_total: 0
				,	expected_apply_deposits: []
				,	expected_apply_credits: []
				});
			});

			it('Test adding 1 invoice < 1 deposit', function ()
			{
				testAdd({
					invoicesData: [{amount: 20, duedate: 10}]
				,	depositsData: [{id:1, remaining: 30}]
				,	creditsData: []
				,	expected_payment_total: 0
				,	expected_invoices_total: 20
				,	expected_deposits_total: 20
				,	expected_credits_total: 0
				,	expected_apply_deposits: [1]
				,	expected_apply_credits: []
				});
			});

			it('Test adding 1 invoice > 1 deposit', function ()
			{
				testAdd({
					invoicesData: [{amount: 30, duedate: 10}]
				,	depositsData: [{id:2, remaining: 20}]
				,	creditsData: []
				,	expected_payment_total: 10
				,	expected_invoices_total: 30
				,	expected_deposits_total: 20
				,	expected_credits_total: 0
				,	expected_apply_deposits: [2]
				,	expected_apply_credits: []
				});
			});

			it('Test adding 2 invoice and 1 deposit cover less than 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [{id:3, remaining: 20}]
				,	creditsData: []
				,	expected_payment_total: 40
				,	expected_invoices_total: 60
				,	expected_deposits_total: 20
				,	expected_credits_total: 0
				,	expected_apply_deposits: [3]
				,	expected_apply_credits: []
				});
			});


			it('Test adding 2 invoice and 1 deposit cover 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [{id: 4 ,remaining: 30}]
				,	creditsData: []
				,	expected_payment_total: 30
				,	expected_invoices_total: 60
				,	expected_deposits_total: 30
				,	expected_credits_total: 0
				,	expected_apply_deposits: [4]
				,	expected_apply_credits: []
				});
			});

			it('Test adding 2 invoice and 1 deposit cover more than 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [{id: 5, remaining: 40}]
				,	creditsData: []
				,	expected_payment_total: 20
				,	expected_invoices_total: 60
				,	expected_deposits_total: 40
				,	expected_credits_total: 0
				,	expected_apply_deposits: [5]
				,	expected_apply_credits: []
				});
			});

			it('Test adding 2 invoice and 1 deposit cover more than 2 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [{id:6, remaining: 100}]
				,	creditsData: []
				,	expected_payment_total: 0
				,	expected_invoices_total: 60
				,	expected_deposits_total: 60
				,	expected_credits_total: 0
				,	expected_apply_deposits: [6]
				,	expected_apply_credits: []
				});
			});

			it('Test adding 2 invoice and 2 deposit cover less than 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [
						{id:7, remaining: 10}
					,	{id:8, remaining: 15}
					]
				,	creditsData: []
				,	expected_payment_total: 35
				,	expected_invoices_total: 60
				,	expected_deposits_total: 25
				,	expected_credits_total: 0
				,	expected_apply_deposits: [7,8]
				,	expected_apply_credits: []
				});
			});

			it('Test adding 2 invoice and 2 deposit cover more than 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [
						{id:9, remaining: 40}
					,	{id:10, remaining: 5}
					]
				,	creditsData: []
				,	expected_payment_total: 15
				,	expected_invoices_total: 60
				,	expected_deposits_total: 45
				,	expected_credits_total: 0
				,	expected_apply_deposits: [9,10]
				,	expected_apply_credits: []
				});
			});

			it('Test adding 2 invoice and 2 deposit cover more than 2 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [
						{id:11, remaining: 40}
					,	{id:12, remaining: 40}
					]
				,	creditsData: []
				,	expected_payment_total: 0
				,	expected_invoices_total: 60
				,	expected_deposits_total: 60
				,	expected_credits_total: 0
				,	expected_apply_deposits: [11,12]
				,	expected_apply_credits: []
				});
			});

			it('Test adding 1 invoice < 1 credit', function ()
			{
				testAdd({
					invoicesData: [{amount: 20, duedate: 10}]
				,	depositsData: []
				,	creditsData: [{remaining: 30, id: 1}]
				,	expected_payment_total: 0
				,	expected_invoices_total: 20
				,	expected_deposits_total: 0
				,	expected_credits_total: 20
				,	expected_apply_deposits: []
				,	expected_apply_credits: [1]
				});
			});

			it('Test adding 1 invoice > 1 credit', function ()
			{
				testAdd({
					invoicesData: [{amount: 30, duedate: 10}]
				,	depositsData: []
				,	creditsData: [{remaining: 20, id: 2}]
				,	expected_payment_total: 10
				,	expected_invoices_total: 30
				,	expected_deposits_total: 0
				,	expected_credits_total: 20
				,	expected_apply_deposits: []
				,	expected_apply_credits: [2]
				});
			});

			it('Test adding 2 invoice and 1 credit cover less than 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: []
				,	creditsData: [{remaining: 20, id: 3}]
				,	expected_payment_total: 40
				,	expected_invoices_total: 60
				,	expected_deposits_total: 0
				,	expected_credits_total: 20
				,	expected_apply_deposits: []
				,	expected_apply_credits: [3]
				});
			});

			it('Test adding 2 invoice and 1 credit memo cover 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: []
				,	creditsData: [{remaining: 30, id: 4}]
				,	expected_payment_total: 30
				,	expected_invoices_total: 60
				,	expected_deposits_total: 0
				,	expected_credits_total: 30
				,	expected_apply_deposits: []
				,	expected_apply_credits: [4]
				});
			});

			it('Test adding 2 invoice and 1 credit memo cover more than 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: []
				,	creditsData: [{remaining: 40, id: 5}]
				,	expected_payment_total: 20
				,	expected_invoices_total: 60
				,	expected_deposits_total: 0
				,	expected_credits_total: 40
				,	expected_apply_deposits: []
				,	expected_apply_credits: [5]
				});
			});

			it('Test adding 2 invoice and 1 credit memo cover more than 2 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: []
				,	creditsData: [{remaining: 100, id: 6}]
				,	expected_payment_total: 0
				,	expected_invoices_total: 60
				,	expected_deposits_total: 0
				,	expected_credits_total: 60
				,	expected_apply_deposits: []
				,	expected_apply_credits: [6]
				});
			});

			it('Test adding 2 invoice and 2 credit memo cover less than 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: []
				,	creditsData: [
						{remaining: 10, id: 7}
					,	{remaining: 5, id: 8}
					]
				,	expected_payment_total: 45
				,	expected_invoices_total: 60
				,	expected_deposits_total: 0
				,	expected_credits_total: 15
				,	expected_apply_deposits: []
				,	expected_apply_credits: [7,8]
				});
			});

			it('Test adding 2 invoice and 2 credit memo cover more than 1 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: []
				,	creditsData: [
						{remaining: 40, id: 9}
					,	{remaining: 5, id: 10}
					]
				,	expected_payment_total: 15
				,	expected_invoices_total: 60
				,	expected_deposits_total: 0
				,	expected_credits_total: 45
				,	expected_apply_deposits: []
				,	expected_apply_credits: [9,10]
				});
			});

			it('Test adding 2 invoice, 1 deposit and 1 credit cover more than 2 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [{remaining: 40, id: 200}]
				,	creditsData: [{remaining: 40, id: 100}]
				,	expected_payment_total: 0
				,	expected_invoices_total: 60
				,	expected_deposits_total: 40
				,	expected_credits_total: 20
				,	expected_apply_deposits: [200]
				,	expected_apply_credits: [100]
				});
			});

			it('Test adding 2 invoice, 1 deposit and 1 credit cover more than 2 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [{remaining: 400, id: 201}]
				,	creditsData: [{remaining: 40, id: 100}]
				,	expected_payment_total: 0
				,	expected_invoices_total: 60
				,	expected_deposits_total: 60
				,	expected_credits_total: 0
				,	expected_apply_deposits: [200]
				,	expected_apply_credits: []
				});
			});

			it('Test adding 2 invoice, 2 deposit and 2 credit cover more than 2 invoice', function ()
			{
				testAdd({
					invoicesData: [
						{amount: 30, duedate: 10}
					,	{amount: 30, duedate: 20}
					]
				,	depositsData: [{remaining: 4, id: 202},{remaining: 6, id: 203}]
				,	creditsData: [{remaining: 40, id: 101},{remaining: 40, id: 102}]
				,	expected_payment_total: 0
				,	expected_invoices_total: 60
				,	expected_deposits_total: 10
				,	expected_credits_total: 50
				,	expected_apply_deposits: [202,203]
				,	expected_apply_credits: [101]
				});
			});

		});
	});
});