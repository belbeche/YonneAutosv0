<?php

use Symfony\Component\HttpFoundation\Request;

class Kernel
{
    // Yonne_App = yonne($1): ['index' ??  '$2'];

    public $yonne_app;
    public $trustedProxies;
    public $request;

    public function __construct($yonne_app,$trustedProxies){
        
        $this->yonne_app = $yonne_app;
        
        return $yonne_app;
    }

    public function getHost(Request $Request,$trustedProxies){
        
        $trustedProxies = $trustedProxies;
        
        $trustedProxies = $_SERVER['SERVER_NAME']; // 127.0.0.1

        $trustedProxies->handleRequest($request);

        return $trustedProxies;
    }

    public function setHost($yonne_app,$trustedProxies){
        $yonne_app = $trustedProxies;

        $yonne_app->getHost('127.0.0.1');

        return $this->trustedProxies;
    }
}



$yonne_app = [];
$trustedProxies = '';
$request = [];

$yonne_app = new Kernel($yonne_app,$trustedProxies);

$yonne_app->setHost($yonne_app,$trustedProxies);