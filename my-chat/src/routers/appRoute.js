import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import axiosInstance from '../config/http-config'
import { setSession } from '../reducers/sessionReducer'
import SignIn from '../pages/SignIn'
import Home from '../pages/Home'
import AppLayout from '../layouts/appLayout'

const AppRoute = (props) => {

  const getSession = () => {
    return new Promise((resolve, reject) => {
      axiosInstance.get('/get_current_user')
      .then(result => {
        console.log(result);
        if(result?.data?.current_user){
          props.setSession({
            current_user: result?.data?.current_user
          })
        }
        resolve(result);
      })
      .catch(error => {
        resolve("Not found")
      })
    })
  }

  useEffect(() => {
    getSession();
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'>
          {props.current_user ? 
            <Route path='/' Component={AppLayout}>
              <Route path='/' Component={Home} />
            </Route>
          :
            <Route path='/' element={<SignIn/>} />
          }
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

const mapStateToProps = (state) => ({
  current_user: state.session.current_user
})

const mapDispatchToProps = {
  setSession
}

export default connect(mapStateToProps, mapDispatchToProps)(AppRoute)