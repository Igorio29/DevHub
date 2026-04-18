<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gitlab' => [
        'client_id' => env('GITLAB_CLIENT_ID'),
        'client_secret' => env('GITLAB_CLIENT_SECRET'),
        'redirect' => env('GITLAB_REDIRECT_URI'),
        'ssl_verify' => filter_var(env('GITLAB_SSL_VERIFY', env('GITLAB_VERIFY_SSL', true)), FILTER_VALIDATE_BOOL),
    ],

    'ai' => [
        'driver' => env('AI_DRIVER', 'openai'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-5.2'),
        'timeout' => env('OPENAI_TIMEOUT', 45),
        'ssl_verify' => filter_var(env('OPENAI_SSL_VERIFY', env('AI_SSL_VERIFY', true)), FILTER_VALIDATE_BOOL),
        'ca_bundle' => env('OPENAI_CA_BUNDLE', env('AI_CA_BUNDLE')),
    ],

    'groq' => [
        'api_key' => env('GROQ_API_KEY'),
        'model' => env('GROQ_MODEL', 'openai/gpt-oss-120b'),
        'timeout' => env('GROQ_TIMEOUT', 45),
        'ssl_verify' => filter_var(env('GROQ_SSL_VERIFY', env('AI_SSL_VERIFY', true)), FILTER_VALIDATE_BOOL),
        'ca_bundle' => env('GROQ_CA_BUNDLE', env('AI_CA_BUNDLE')),
    ],

];
