import * as React from 'react';
import { Redirect, Link, RouteComponentProps } from 'react-router-dom';
import Amplify from 'aws-amplify'
import Auth from '@aws-amplify/auth'
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




class LoginContainer extends React.Component{
  state = {
    loading: false,
    QRCode: "",
    showQRCode: false,
    cognitoUser: {},
    redirect: false,
  };


  handleSubmitMFA = (event) => {
    event.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      try{
        if (!err) {
          let { token } = values;
          this.setState({...this.state, loading: true });
          console.log(this.state)
          var user
          if(this.state.cognitoUser.challengeName !=="SOFTWARE_TOKEN_MFA"){
            user = await Auth.verifyTotpToken(this.state.cognitoUser, token);
          }else{
            user = await Auth.confirmSignIn(this.state.cognitoUser, token, "SOFTWARE_TOKEN_MFA")
          }
          if (user) {
            notification.success({
              message: 'Succesfully logged in user!',
              description: 'Logged in successfully, Redirecting you in a few!',
              placement: 'topRight',
              duration: 1.5,
              onClose: () => {
                this.setState({...this.state, redirect: true });
              }
            });
          }
        }
      }
      catch(e){
        console.log(e)
        this.setState({...this.state, message:e.message, loading:false})        
      }
    });
  }
  handleSubmit = (event) => {
    event.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      try{

        if (!err) {
          let { username, password } = values;

          this.setState({...this.state, loading: true });
          const user = await Auth.signIn(username, password);
          this.setState({...this.state, cognitoUser: user });
          if (user.challengeName === 'MFA_SETUP') {
            const res = await Auth.setupTOTP(user);
            const authCode = "otpauth://totp/AWSCognito:" + user.username + "?secret=" + res + "&issuer=Cognito";
            this.setState({...this.state, QRCode: authCode, showQRCode: true, loading: false });
          } else if (user.challengeName === 'SOFTWARE_TOKEN_MFA') {
            this.setState({...this.state, showQRCode: true, loading: false });
          }
        }
      }catch(e){
        this.setState({...this.state, message:e.message, loading:false})        
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, cognitoUser, redirect } = this.state;

    return (
      <React.Fragment>

        {!this.state.showQRCode && (
          <FormWrapper onSubmit={this.handleSubmit} className="login-form">
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
        {this.state.showQRCode && (
          <FormWrapper onSubmit={(event) => this.handleSubmitMFA(event)} className="login-form">
            {/* <img src={this.state.QRCode} /> */}
            <QRCode value={this.state.QRCode} />
            {this.state.QRCode}
            <Form.Item>
              {getFieldDecorator('token', {
                rules: [
                  {
                    required: true,
                    message: 'Please input token!'
                  }
                ]
              })(
                <Input prefix={<Icon type="user" style={{ color: "#000000" }} />} placeholder="Token" />
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
}

export default Form.create()(LoginContainer);
