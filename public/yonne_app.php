<?php
pathinfo();
use Symfony\Component\HttpFoundation\Request;

class Kernel
{
    // Yonne_App = yonne($1): ['index' ??  '$2'];

//     public $yonne_app;
//     public $trustedProxies;
//     public $request;

//     public function __construct($yonne_app,$trustedProxies){
        
//         $this->yonne_app = $yonne_app;
//         $this->trustedProxies = $trustedProxies;
        
//         echo $yonne_app.$trustedProxies;
//     }

//     public function getHost(Request $Request,$trustedProxies){
    
//         $trustedProxies = $trustedProxies;
        
//         $trustedProxies = $_SERVER['SERVER_NAME']; // 127.0.0.1

//         $trustedProxies->handleRequest($request); { [new obj] }

//         return $trustedProxies;
//     }

//     public function setHost($yonne_app,$trustedProxies){
//         $yonne_app = $trustedProxies;

//         $yonne_app->getHost($trustedProxies);

//         return $this->trustedProxies;
//     }
// }



// $yonne_app = [];
// $trustedProxies = [];
// $request = [];

// $yonne_app = new Kernel($yonne_app,$trustedProxies);

// $yonne_app->setHost($yonne_app,$trustedProxies);

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
    Debug::enable();
}
if ($trustedProxies = $_SERVER['TRUSTED_PROXIES'] ?? $_ENV['TRUSTED_PROXIES'] ?? false) {
    Request::setTrustedProxies(explode(',', $trustedProxies), Request::HEADER_X_FORWARDED_ALL ^ Request::HEADER_X_FORWARDED_HOST);
}
if ($trustedHosts = $_SERVER['TRUSTED_HOSTS'] ?? $_ENV['TRUSTED_HOSTS'] ?? false) {
    Request::setTrustedHosts([$trustedHosts]);
}
$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);