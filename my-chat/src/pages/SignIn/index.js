import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import './style.css'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../config/http-config'
import { setSession } from '../../reducers/sessionReducer'
import { connect } from 'react-redux'

const SignIn = (props) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()
  const navigate = useNavigate();

  const onSubmit = async(values) => {
    console.log(values);
    const result = await axiosInstance.post('/sign_in', {
      user: values
    });
    console.log("RESULT:", result);
    props.setSession({
      current_user: result.data.current_user
    });
    navigate('/');
  }
  
  return (
    <div className='container'>
      <div className='row justify-content-md-center mt-4'>
        <div className='col-lg-4 col-md-4'>
          <div className='card' id="sign_in">
            <div className='card-body'>
              <h5>Sign In</h5>
              <form className='needs-validation' onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label htmlFor="login_email" className="form-label">Email address</label>
                  <input 
                    type="email"
                    className={`form-control ${errors.email && 'is-invalid'}`}
                    id="login_email"
                    placeholder="name@example.com" 
                    {...register(
                      "email",
                      {
                        required: 'Email is required',                        
                      }
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors?.email?.message}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="login_password" className="form-label">Password</label>
                  <input 
                    type="password"
                    className={`form-control ${errors.email && 'is-invalid'}`}
                    id="login_password"
                    placeholder="******" 
                    {...register(
                      "password",
                      {
                        required: 'Password is required',                        
                      }
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors?.password?.message}
                  </div>
                </div>
                <div>
                  <input type="submit" value="Login" className='btn btn-primary' />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {
  setSession
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn)