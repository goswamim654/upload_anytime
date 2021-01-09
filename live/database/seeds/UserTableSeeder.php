<?php

use Illuminate\Database\Seeder;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
    	factory(App\User::class,5)->create();
        // DB::table('users')->insert([
        //     'name' => 'David Hope',
        //     'email' => 'david@gmail.com',
        //     'password' => app('hash')->make('david123'),
        // ]);
    }
}
