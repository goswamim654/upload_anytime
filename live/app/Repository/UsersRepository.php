<?php  
	namespace App\Repository;

	use App\User;

	class UsersRepository{
		
		public function getAll(){
			$users= User::all();
			return $users;
		}

		public function getById($id){
			$user= User::find($id);
			return $user;
		}

		public function insertUser($input){
			$user=new User();
			$user->name=$input['name'];
			$user->email=$input['email'];
			$user->password=Hash::make($input['password']);
			$user->save();
		}

		public function updateUser($id, $input){
			$user= User::find($id);
			$user->name=$input['name'];
			$user->email=$input['email'];
			//$user->password=Hash::make($input['password']);
			$user->save();
		}

		public function deleteUser($id){
			$user=User::find($id);
			$user->delete();
		}
	}
?>