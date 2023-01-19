import React, {useState, useEffect} from 'react';
import { Redirect, Link, RouteComponentProps } from 'react-router-dom';
import { Amplify, Auth } from 'aws-amplify';
// import Auth from '@aws-amplify/auth'
import { Form, Icon, Spin, Input, Button, notification, Col, Row } from 'antd';
import UserPoolData from '../../Assets/config';
import QRCode from 'qrcode.react'
import FormWrapper from '../../Components/FormWrapper';
 
const QR = require('qrcode');

Amplify.configure({
  Auth: {
    userPoolWebClientId: UserPoolData.clientId,
    userPoolId: UserPoolData.userPoolId,
    region: UserPoolData.region,
  }
})




const LoginContainer = props=>{

  const [loading, setLoading] = useState(false);
  const [QRCode, setQRCode] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [cognitoUser, setCognitoUser] = useState({});
  const [redirect, setRedirect] = useState(false);



  const handleSubmitMFA = (event) => {
    event.preventDefault();
    props.form.validateFields(async (err, values) => {
      try{
        if (!err) {
          let { token } = values;
          setLoading( true );
          var user
          if(cognitoUser.challengeName !== 'SMS_MFA' ||
            cognitoUser.challengeName !== 'SOFTWARE_TOKEN_MFA'){
            user = await Auth.verifyTotpToken(cognitoUser, token);
          }else{
            user = await Auth.confirmSignIn(cognitoUser, token)
          }
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

          if (user.challengeName === 'MFA_SETUP') {
            const res = await Auth.setupTOTP(user);
            const authCode = "otpauth://totp/AWSCognito:" + user.username + "?secret=" + res + "&issuer=Cognito";
            setQRCode(authCode);
            setShowQRCode(true);
            setLoading(false)
          } else if (user.challengeName === 'SMS_MFA' ||
            user.challengeName === 'SOFTWARE_TOKEN_MFA') {
            const code = prompt();
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
          </FormWrapper>
        )}
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
