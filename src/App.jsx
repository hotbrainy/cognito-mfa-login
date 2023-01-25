import React from 'react';
import AppRouter from './Navigation/Routes';
import 'antd/dist/antd.css';

import { Amplify } from 'aws-amplify';
import UserPoolData from './Assets/config';


Amplify.configure({
    "aws_project_region": UserPoolData.region,
    "aws_cognito_identity_pool_id": "ap-southeast-2:e2478801-35af-4bca-9a5a-ccaed7d7fea2",
    "aws_cognito_region": UserPoolData.region,
    "aws_user_pools_id": UserPoolData.userPoolId,
    "aws_user_pools_web_client_id": UserPoolData.clientId,
    "oauth": {
        "domain": "laburigor132.auth.ap-southeast-2.amazoncognito.com",
        "scope": [
            "email",
            "phone",
            "openid",
            "profile",
            // "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "http://localhost:3000",
        "redirectSignOut": "http://localhost:3000",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS"
})

const App  = () => {
  return <AppRouter />;
};

export default App;
