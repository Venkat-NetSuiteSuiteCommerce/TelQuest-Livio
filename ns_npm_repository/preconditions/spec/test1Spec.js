var Preconditions = require('../src/Preconditions')


describe('general tests', function()
{
	it('normal use 1', function(done)
	{
		var array1 = []; 
		Preconditions.add('Task1.Sub1', function(cb)
		{
			array1.push('Task1.Sub1');
			cb(null, 'Task1.Sub1v');
		});

		Preconditions.add('Task1.Sub2', function(cb)	
		{
			array1.push('Task1.Sub2');
			cb(null, 'Task1.Sub2v');
		});

		Preconditions.add('Task1', ['Task1.Sub1', 'Task1.Sub2'], function(sub1Response, sub2Response, cb)
		{
			// console.log('Task1', arguments)
			expect(sub1Response).toBe('Task1.Sub1v'); 
			expect(sub2Response).toBe('Task1.Sub2v'); 
			array1.push('Task1');
			cb(null, 'Task1');
		});

		Preconditions.add('Task2', [], function(cb)
		{
			array1.push('Task2');
			cb(null, 'Task2');
		});

		Preconditions.start('Task1', 'Task2', function(error, task1Result, task2Result)
		{
			// console.log(arguments)
			expect(array1.join(',')).toBe('Task1.Sub1,Task1.Sub2,Task1,Task2');
			expect(!!error).toBe(false);
			expect(task1Result).toBe('Task1'); 
			expect(task2Result).toBe('Task2'); 
			done();
		});
	}); 


	it('error example 1', function(done)
	{		
		Preconditions.add('Task3', function(cb)
		{
			cb('error3.14');
		});

		Preconditions.start('Task3', function(error, value)
		{
			expect(error).toBe('error3.14');
			expect(!!value).toBe(false); 
			done();
		});
	}); 


	it('bug non-persistent executed twice', function()
	{

		Preconditions.add('two', function(cb)
		{
			cb(null, 'two')
		});

		Preconditions.add('one', ['two'], function(two, cb)
		{
			cb(null, 'one')
		}); 

		Preconditions.start('one', 'two', function(error, one, two)
		{
			expect(one).toBe('one')
			expect(two).toBe('two')
		});

	})

})