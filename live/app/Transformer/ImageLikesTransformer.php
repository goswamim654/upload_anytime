<?php  
	namespace App\Transformer;

	use App\ImageLikes;
	use League\Fractal\TransformerAbstract;

	class ImageLikesTransformer extends TransformerAbstract{
		public function transform(ImageLikes $imageLikes){
			return $imageLikes->toArray();
		}
	}
?>