import React, {useState, useEffect} from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Auth, Hub } from 'aws-amplify';
// import Auth from '@aws-amplify/auth'

// import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Form, Icon, Spin, Input, Button, notification, Col, Row } from 'antd';
// import UserPoolData from '../../Assets/config';
// import QRCode from 'qrcode.react'
import FormWrapper from '../../Components/FormWrapper';
// import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
// const QR = require('qrcode');


const LoginContainer = props=>{

  const [loading, setLoading] = useState(false);
  const [QRCode, setQRCode] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  // const [cognitoUser, setCognitoUser] = useState({});
  const [redirect, setRedirect] = useState(false);

  // in useEffect, we create the listener
  useEffect(() => {
    Hub.listen('auth', (data) => {
      const { payload } = data
      console.log('A new auth event has happened: ', data)
       if (payload.event === 'signIn') {
         console.log('a user has signed in!')
         checkUser();
         setRedirect( true );
       }
       if (payload.event === 'signOut') {
         console.log('a user has signed out!')
       }
    })
  }, [])

  function checkUser() {
    Auth.currentAuthenticatedUser()
      .then(user => console.log({ user }))
      .catch(err => console.log(err));
  }

  // function signOut() {
  //   Auth.signOut()
  //     .then(data => console.log(data))
  //     .catch(err => console.log(err));
  // }

  const handleSubmitMFA = (event) => {
    event.preventDefault();
    props.form.validateFields(async (err, values) => {
      try{
        if (!err) {
          let { token } = values;
          setLoading( true );
          var user
          // if(cognitoUser.challengeName !== 'SMS_MFA' ||
          //   cognitoUser.challengeName !== 'SOFTWARE_TOKEN_MFA'){
          //   user = await Auth.verifyTotpToken(cognitoUser, token);
          // }else{
          //   user = await Auth.confirmSignIn(cognitoUser, token)
          // }
          if (user) {
            notification.success({
              message: 'Succesfully logged in user!',
              description: 'Logged in successfully, Redirecting you in a few!',
              placement: 'topRight',
              duration: 1.5,
              onClose: () => {
                setRedirect( true );
              }
            });
          }
        }
      }
      catch(e){
        console.log(e)
        setLoading(false)        
      }
    });
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    props.form.validateFields(async (err, values) => {
      try{

        if (!err) {
          let { username, password } = values;
          setLoading( true );
          const user = await Auth.signIn(username, password);
          // setCognitoUser( user );
          console.log(user)
          console.log(QRCode)

          if (user.challengeName === 'MFA_SETUP') {
            const res = await Auth.setupTOTP(user);
            const authCode = "otpauth://totp/AWSCognito:" + user.username + "?secret=" + res + "&issuer=Cognito";
            setQRCode(authCode);
            setShowQRCode(true);
            setLoading(false)
          } else if (user.challengeName === 'SMS_MFA' ||
            user.challengeName === 'SOFTWARE_TOKEN_MFA') {
            const code = prompt("Please enter SMS code");
            const u = await Auth.confirmSignIn(user, code);
            if (u) {
            notification.success({
              message: 'Succesfully logged in user!',
              description: 'Logged in successfully, Redirecting you in a few!',
              placement: 'topRight',
              duration: 1.5,
              onClose: () => {
                setRedirect(true)
              }
            });
            return;
          }
            setShowQRCode(true)
            setLoading(false);
          }
        }
      }catch(e){
        setLoading(false)
      }
    });
  };
  const { getFieldDecorator } = props.form;

  return (
    <React.Fragment>

      {!showQRCode && (
        <FormWrapper onSubmit={handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [
                {
                  required: true,
                  message: 'Please input your username!'
                }
              ]
            })(
              <Input prefix={<Icon type="user" style={{ color: "#000000" }} />} placeholder="Username" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: 'Please input your password!'
                }
              ]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: '#000000' }} />}
                type="password"
                placeholder="Password"
              />
            )}
          </Form.Item>
          <Form.Item className="text-center">
            <Row type="flex" gutter={16}>
              <Col lg={24}>
                <Button
                  style={{ width: '100%' }}
                  type="primary"
                  disabled={loading}
                  htmlType="submit"
                  className="login-form-button"
                >
                  {loading ? <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} /> : 'Log in'}
                </Button>
              </Col>
              <Col lg={24}>
                Or <Link to="/signup">register now!</Link>
              </Col>
            </Row>
          </Form.Item>

          {/*<Form.Item className="text-center">
            <Row type="flex" gutter={16}>
              <Col lg={24}>
                <GoogleLogin
                  onSuccess={googleSignInSuccess}
                  onError={googleSignInFailure}
                  text="Sign in with Google"
                  context="Sign in with Google"
                />
              </Col>
            </Row>
          </Form.Item>*/}
          <Form.Item className="text-center">
            <Row type="flex" gutter={16}>
              <Col lg={24}>
              <Button
                  style={{ width: '100%' }}
                  type="primary"
                  onClick={() => Auth.federatedSignIn({provider: 'Google'})}
                >
                  Log in With Google
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </FormWrapper>
      )}
     {/* <Button onClick={() => Auth.federatedSignIn()}>Sign In</Button>
      <Button onClick={checkUser}>Check User</Button>
      <Button onClick={signOut}>Sign Out</Button>
      <Button onClick={() => Auth.federatedSignIn({provider: 'Facebook'})}>Sign In with Facebook</Button>
      <Button onClick={() => Auth.federatedSignIn({provider: 'Google'})}>Sign In with Google</Button>
      */}
      {showQRCode && (
        <FormWrapper onSubmit={(event) => handleSubmitMFA(event)} className="login-form">
          {/* <img src={QRCode} />
          <QRCode value={QRCode} />*/}
          <Form.Item>
            {getFieldDecorator('token', {
              rules: [
                {
                  required: true,
                  message: 'Please input token!'
                }
              ]
            })(
              <Input 
              type="number"
               prefix={<Icon type="user" style={{ color: "#000000" }} />} placeholder="Token" />
            )}
          </Form.Item>
          <Form.Item className="text-center">
            <Row type="flex" gutter={16}>
              <Col lg={24}>
                <Button
                  style={{ width: '100%' }}
                  type="primary"
                  disabled={loading}
                  htmlType="submit"
                  className="login-form-button"
                >
                  {loading ? <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} /> : 'Log in'}
                </Button>
              </Col>
            </Row>
          </Form.Item>

        </FormWrapper>)}
      {redirect && <Redirect to={{ pathname: '/dashboard' }} />}
    </React.Fragment>
  );
}

export default Form.create()(LoginContainer);
