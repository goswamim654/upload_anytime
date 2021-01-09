<?php

namespace App\Http\Controllers\V1;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Hash;
use Dingo\Api\Routing\Helpers;
use Illuminate\Http\Request;

class UserController extends Controller
{

    use Helpers;

    //protected $userRepository;
    protected $userTransformer;


    //public function __construct(\App\Repository\UsersRepository $userRepository, \App\Transformer\UserTransformer $userTransformer){
    public function __construct(\App\User $user, \App\UserDetails $userDetails, \App\Transformer\UserTransformer $userTransformer){
    	//$this->userRepository = $userRepository;
        $this->user = $user;
    	$this->userDetails = $userDetails;
    	$this->userTransformer = $userTransformer;
    }

    public function index()
    {
    	$user=$this->user->paginate(20);
        return $this->response->paginator($user, $this->userTransformer);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $input=$request->all();

        $validationRules=[
            'name' => 'required|min:3',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ];
        $validator= \Validator::make($input, $validationRules);
        if($validator->fails()){
            // $result= new \Illuminate\Http\JsonResponse(
            //     [ 'errors' => $validator->errors() ],
            //     \Illuminate\Http\Response::HTTP_BAD_REQUEST
            // );
            $result['status']=1;
            $result['message']=$validator->errors();
            return $result;

        }
        $input['password']=Hash::make($input['password']);
        $user=$this->user->create($input);
        $response=$this->response->item($user, $this->userTransformer);
        return $response; 
        die();
    }

    public function facebookUsers(Request $request){
        $input=$request->all();

        $user=array();
        if(empty($input)){
            $result['status']=1;
            $result['message']="Required data not found.";
            return $result;
        }

        $user['name']=$input['name'];
        $user['email']=$input['email'];
        $userData=$this->user->create($user);

        $userDetailsArr['user_id']=$userData->id;
        $userDetailsArr['social_id']=$input['id'];
        $userDetailsArr['photo']=isset($input['picture']['data']['url']) ? $input['picture']['data']['url'] : NUll;
        $userDetailsData=$this->userDetails->create($userDetailsArr);

        if(!empty($userDetailsData)){
            $username=$input['email'];

            $client = new \GuzzleHttp\Client();
            $response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
                'headers' => [
                    // 'x-https' => '1',
                    // 'accept-language' => 'en-US,en;q=0.9',
                    // 'accept-encoding' => 'gzip, deflate, br',
                    // 'Accept'     => '*/*',
                    // 'Content-Type' => 'application/x-www-form-urlencoded',
                    // 'postman-token' => '27dd374a-7bc6-b1f0-3e12-aced6c6f8b55',
                    // 'origin' => 'chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop',
                    // 'cache-control' => 'no-cache',
                    'user-agent' => 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
                    // 'content-length' => '504',
                    // 'connection' => 'keep-alive',
                    // 'host' => 'www.snaplava.com',
                ],
                'form_params' => [
                    'grant_type' => 'personal_access', 
                    'client_id'=> 1, 
                    'client_secret' => 'ZYBK9KYAdNbPmct35EAaBKulLAzhqfR71uEvRlJC', 
                    'username'=>$username,
                ]
            ]);


            // You can provide other optional constructor arguments.
            // $headers = ['X-Foo' => 'Bar'];
            // $body = 'hello!';
            // $response = new \GuzzleHttp\Psr7\Request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', $headers, $body);


            // $response = $client->post('https://www.snaplava.com/live/public/api/v1/oauth/token', [
            //     'headers' => [
            //         'User-Agent' => 'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 920) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537',
            //         'Access-Control-Allow-Origin' => '*'
            //     ],
            //     'form_params' => [
            //         'grant_type' => 'password',
            //         'client_id'=> 2, 
            //         'client_secret' => 'e8XxyWFmnwPh3kDTa3KuryzdTcXtAIohWJDAlXsv', 
            //         'username'=>'dhurba@gmail.com',
            //         'password'=> '123456',
            //         'scope' => '*'
            //     ],
            // ]);
            
            //$getAccessToken=$this->api->post("api/v1/oauth/uses", ['grant_type' => 'personal_access', 'client_id'=> 1, 'client_secret' => 'ZYBK9KYAdNbPmct35EAaBKulLAzhqfR71uEvRlJC', 'username'=>'bunuhemant28@gmail.com']);

            $contents = $response->getBody();

            //$jsonData=$contents->();
            echo $contents;

            // echo '<pre>';
            // print_r($jsonData);
            //print_r($getAccessToken);
            die();

        }

        $response=$this->response->item($userDetailsData, $this->userTransformer);
        return $response;
        echo $user->id;
        echo "<pre>";
        print_r($user);
        die();
    }

    public function show(Request $request){
        $input=$request->all();
        echo '<pre>';
        print_r($input);
        exit;
    	$user=$this->user->paginate(20);
        return $this->response->paginator($user, $this->userTransformer);

    	// $user = $this->userRepository->getAll();
    	// $response=$this->response->item($user, $this->userTransformer);
    	// return $response;
    }
}
