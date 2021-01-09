<?php  
	namespace App\Transformer;

	use App\UserFollowers;
	use League\Fractal\TransformerAbstract;

	class UserFollowersTransformer extends TransformerAbstract{
		public function transform(UserFollowers $userFollowers){
			return $userFollowers->toArray();
		}
	}
?>