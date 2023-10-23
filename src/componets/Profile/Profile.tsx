import React, { useEffect, useRef, useState } from 'react';
import styles from './Profile.module.scss';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import cn from 'classnames';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Form, Divider, message } from 'antd';
import {
  auth,
  useAuthApiQuery,
  useInfoApiSetMutation,
  useRenameApiSetMutation,
  useRepassApiSetMutation,
} from '../../store/MovieApi';
import { FieldType } from '../../types';
import TextArea from 'antd/es/input/TextArea';

const Profile = () => {
  const refImage = useRef<HTMLInputElement>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [repassApiSet, { data: dataRepass, error: errorRepass, status: statusRepass }] =
    useRepassApiSetMutation();
  const [selectedFile, setSelectedFile] = useState();
  const [error1, setError1] = useState('');
  const [text, setText] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const { data, isFetching, error: errorApi } = useAuthApiQuery('');
  const [renameApiSet, { error }] = useRenameApiSetMutation();
  const darkMode = useAppSelector((state) => state.sliceMovie.darkMode);
  const { data: dataApi, refetch } = auth.useAuthApiQuery('');
  const [area, setArea] = useState('');
  const [infoApiSet, { data: dataInfo }] = useInfoApiSetMutation();

  const errorMessage = () => {
    messageApi.open({
      type: 'error',
      content: 'Please input your old password',
    });
  };

  const errorMessageTwo = () => {
    messageApi.open({
      type: 'error',
      content: 'Incorrect old password',
    });
  };

  const successMess = () => {
    messageApi.open({
      type: 'success',
      content: 'Password changed!',
    });
  };

  const handleInput = (e) => {
    setText(e.target.value);
  };

  const handleInputOldPassword = (e) => {
    setOldPass(e.target.value);
  };

  const handleInputNewPassword = (e) => {
    setNewPass(e.target.value);
  };

  const handleClick = async () => {
    if (text.length < 4) {
      return;
    }
    const data = {
      newUsername: text,
      oldUsername: dataApi.username,
    };
    const dataRename = await renameApiSet(data);
    console.log('dataRename', dataRename);
    refetch();
  };

  const handleClickPassword = async () => {
    if (oldPass.length < 1) {
      errorMessage();
      return;
    }
    const data = {
      oldPassword: oldPass,
      newPassord: newPass,
      oldUsername: dataApi.username,
    };
    repassApiSet(data);
  };

  const handleChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onClickImage = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('filedata', selectedFile);
    formData.append('oldUsername', dataApi.username);

    let response = await fetch('https://backmovie.onrender.com/upload', {
      method: 'POST',
      body: formData,
    });
    let result = await response.json();
    console.log('rrr', result);
    refetch();
  };

  const darkModeTheme = cn({
    [styles.Main]: !darkMode,
  });

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const selFile = () => {
    refImage?.current?.click();
  };

  const handleArea = (e) => {
    setArea(e.target.value);
  };

  const cliclArea = () => {
    const data = {
      username: dataApi.username,
      info: area,
    };
    infoApiSet(data);
    setArea('');
  };

  const placeholderImage = 'https://cdn-icons-png.flaticon.com/512/219/219983.png';

  const onErr = (error) => {
    console.log('e', error);
    error.target.src = placeholderImage;
  };

  useEffect(() => {
    refetch();
  }, [refetch, dataInfo]);

  useEffect(() => {
    if (dataRepass) {
      if ('message' in dataRepass) {
        if (dataRepass.message.includes('Паспорт пользователя')) {
          successMess();
          console.log('44', dataRepass.message);
        }
      }
    }
    if (statusRepass === 'rejected') {
      errorMessageTwo();
    }
    
  }, [dataRepass, errorRepass, statusRepass, errorMessageTwo, successMess]);


  useEffect(() => {
    if (errorApi) {
      if ('data' in errorApi) {
        const data = errorApi.data as any;
        if ('message' in data) {
          if (data.message === 'Пользователь не авторизован') {
            navigate('/login');
          }
        }
      }
    }
  }, [data, navigate, isFetching, errorApi]);

  useEffect(() => {
    console.log('er', error);
    if (error) {
      if ('data' in error) {
        //@ts-ignore
        setError1(error.data.message);
        console.log('44', error1);
        // you can access all properties of `FetchBaseQueryError` here
      } else {
        // you can access all properties of `SerializedError` here
      }
    }
  }, [error, error1]);
 

  if (!dataApi) {
    navigate('/');
  }

  return (
    <>
      <div className={styles.mess}>{contextHolder}</div>
      <div className={darkModeTheme}>
        <div className={styles.container}>
          <img
            onError={onErr}
            className={styles.ava}
            src={`https://backmovie.onrender.com/${dataApi?.avatar}`}
            alt="Add"
          />

          <div className={styles.imageParent} style={{ width: '100%' }}>
            <Button className={styles.btnImage} onClick={selFile}>
              Select file
            </Button>
            <input
              style={{ display: 'none' }}
              ref={refImage}
              type="file"
              name="filedata"
              onChange={handleChange}
            />
            <Input className={styles.inpImgae} type="submit" value="Send" onClick={onClickImage} />
          </div>

          <Divider className={styles.divid} />

          <div className={styles.parent}>
            <div className={styles.text}>Current name: </div>
            <div className={styles.text}> {dataApi?.username}</div>
          </div>

          <div className={styles.parent1}>
            <div className={styles.text}>New username: </div>
            <div className={styles.newUsername}>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ display: 'flex' }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off">
                <Form.Item<FieldType>
                  label=""
                  name="username"
                  rules={[
                    { required: true, message: 'Please input your username!' },
                    { min: 4, message: 'Minimum 4 characters.' },
                  ]}>
                  <Input
                    className={styles.inp}
                    value={text}
                    onChange={(e) => handleInput(e)}
                    placeholder=""></Input>
                </Form.Item>
                <Button className={styles.btn} onClick={handleClick} htmlType="submit">
                  Send
                </Button>
              </Form>
            </div>
          </div>

          <Divider className={styles.divid} />

          <div className={styles.parent3}>
            <div className={styles.text}>Current password: </div>
            <div className={styles.inp2}>
              <Form
                name="basicPassword"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ display: 'flex' }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                className={styles.inp3}
                autoComplete="off">
                <Form.Item<FieldType>
                  label=""
                  name="username"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 4, message: 'Minimum 4 characters.' },
                  ]}>
                  <Input
                    className={styles.inp3}
                    value={text}
                    onChange={(e) => handleInputOldPassword(e)}
                    placeholder=""></Input>
                </Form.Item>
                {/* <Button  className={styles.btn} onClick={handleClick} htmlType="submit">
                Send
              </Button> */}
              </Form>
            </div>
          </div>

          <div className={styles.parent}>
            <div className={styles.text}>New password: </div>
            <div className={styles.newUsername}>
              <Form
                name="basicPasswordNew"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ display: 'flex' }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off">
                <Form.Item<FieldType>
                  label=""
                  name="username"
                  rules={[
                    { required: true, message: 'Please input your new password!' },
                    { min: 4, message: 'Minimum 4 characters.' },
                  ]}>
                  <Input
                    className={styles.inp}
                    value={text}
                    onChange={(e) => handleInputNewPassword(e)}
                    placeholder=""></Input>
                </Form.Item>
                <Button className={styles.btn} onClick={handleClickPassword} htmlType="submit">
                  Send
                </Button>
              </Form>
            </div>
          </div>

          <Divider />

          <div>
            <h1>Information</h1>
            <div className={styles.textInfo}>{dataApi && dataApi.info}</div>
          </div>

          <Divider />

          <div>
            <div>Change information</div>
            <div>
              <TextArea
                value={area}
                onChange={(e) => handleArea(e)}
                rows={4}
                placeholder="maxLength is 60"
                maxLength={60}
              />
            </div>
            <div className={styles.btnInfo}>
              <Button onClick={cliclArea}>Click</Button>
            </div>
          </div>
        </div>
        {error ? <div className={styles.err}>{error1}</div> : ''}
      </div>
    </>
  );
};

export default Profile;
