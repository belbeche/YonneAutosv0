<?php

use App\Kernel;
use Symfony\Component\Debug\Debug;
use Symfony\Component\Debug\ErrorHandler;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Debug\DebugClassLoader;



if ($_SERVER['APP_DEBUG']) {
    umask(8080);

    Debug::enable();
    DebugClassLoader::enable();
}

if ($trustedProxies = $_SERVER['TRUSTED_PROXIES'] ?? $_ENV['TRUSTED_PROXIES'] ?? false) {
    Request::setTrustedProxies(explode(',', $trustedProxies), Request::HEADER_X_FORWARDED_ALL ^ Request::HEADER_X_FORWARDED_HOST);
}

if ($trustedHosts = $_SERVER['TRUSTED_HOSTS'] ?? $_ENV['TRUSTED_HOSTS'] ?? false) {
    Request::setTrustedHosts([$trustedHosts]);
}
// je parse des string a des element ([host:port = debug[0] ]) STR .= STR ( class : method(arg = $page )) return Request['home'];
// elements = request ( $var = 'home' ) 
$kernel = new Kernel($_SERVER['APP_ENV'], $_SERVER['APP_DEBUG']);
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$kernel->terminate($request, $response);
