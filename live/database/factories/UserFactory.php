<?php  
	$factory->define(App\User::class, function (Faker\Generator $faker) {
		return [
	        'name' => $faker->name,
	        'email' => $faker->email,
	        'password' => Illuminate\Support\Facades\Hash::make('pass')
	    ];
	});
?>