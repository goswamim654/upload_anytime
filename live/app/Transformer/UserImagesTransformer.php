<?php  
	namespace App\Transformer;

	use App\UserImages;
	use League\Fractal\TransformerAbstract;

	class UserImagesTransformer extends TransformerAbstract{
		public function transform(UserImages $userImages){
			return $userImages->toArray();
		}
	}
?>