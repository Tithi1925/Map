import React, { useState } from 'react';
import './App.css';
import './Eyeicon.css';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Icon from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import Shubkeylogo from './Assets/Shubhkeylogo';
import Loading from './Assets/Loading';
import useAuth from './useAuth';

function Login() {
  // useAuth();
  
  const navigate = useNavigate();  
  const [passwordtype, setPasswordtype] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [icon, setIcon] = useState(eyeOff);
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setShowPassword(!showPassword);
    setPasswordtype(showPassword ? 'password' : 'text');
    setIcon(showPassword ? eyeOff : eye);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`http://192.168.0.153:7000/api/UserDetails/authenticate/Portal`, data, { timeout: 10000 }); // Timeout set to 10 seconds (10000 ms)
      toast.success(response.data.message);
      secureLocalStorage.setItem('user', JSON.stringify(response.data.userId));
      secureLocalStorage.setItem('role', JSON.stringify(response.data.roleIds));
      secureLocalStorage.setItem('menu', JSON.stringify(response.data.menuItems));
      secureLocalStorage.setItem('profilephoto', JSON.stringify(response.data.profilelogo));
      secureLocalStorage.setItem('token', JSON.stringify(response.data.token));
      secureLocalStorage.setItem('userCourier', JSON.stringify(response.data.userCourier));
      navigate('/courierdata');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response) {
          toast.error(error.response.data.message);   
      } else if (error.request) {
        toast.error('Server is not responding. Please try again later.');
      } else {
        toast.error('Failed to connect to the server. Please check your network connection.');
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <Shubkeylogo />
      <div className="container" style={{marginTop:'70px'}}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card p-4 shadow-lg">
              <h3 className="text-primary text-center">Login</h3>
              <form className="row mt-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="col-md-12">
                  <label htmlFor="inputUsername" className="form-label">
                    User Name<span className='errmsg'>*</span>
                  </label>
                  <input
                    autoComplete="off"
                    type="text"
                    className="form-control"
                    name="userName"
                    {...register("userName", {
                      required: "User name is required",
                    })}
                  />
                  <p className="errmsg">{errors.userName?.message}</p>
                </div>
                <div className="col-md-12">
                  <label htmlFor="inputPassword" className="form-label">
                    Password<span className='errmsg'>*</span>
                  </label>
                  <input
                    type={passwordtype}
                    autoComplete="off"
                    className="form-control"
                    name="password"
                    {...register("password", {
                      required: "Password is required.",
                      pattern: {
                        value: /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^0-9A-Za-z]).{0,32}$/,
                        message: "Please enter the valid password",
                      },
                    })}
                  />
                  <span className="eyeicon" onClick={handleToggle}>
                    <Icon className="absolute mr-10" icon={icon} size={25} />
                  </span>
                  <p className="errmsg">{errors.password?.message}</p>
                </div>
                <div className="col-md-12">
                  <label htmlFor="inputCourierId" className="form-label">
                    Courier ID<span className='errmsg'>*</span>
                  </label>
                  <input
                    autoComplete="off"
                    type="text"
                    className="form-control"
                    name="courierId"
                    {...register("courierId", {
                      required: "Courier ID is required",
                    })}
                  />
                  <p className="errmsg">{errors.courierId?.message}</p>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary w-100">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
