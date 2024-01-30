import React from 'react'
import { connect } from 'react-redux'
import axiosInstance from '../../config/http-config'
import { useNavigate } from 'react-router-dom'
import { setSession } from '../../reducers/sessionReducer'

const Navbar = (props) => {
  const navigate = useNavigate()
  
  const signOut = async() => {
    try {
      const result = await axiosInstance.get('/sign_out');
      props.setSession({
        current_user: null
      });
      window.location.assign('/');   
    } catch (error) {
      console.log(error);      
    }
  }

  return (
    <nav className="navbar navbar-expand-lg bg-primary mb-3">
      <div className="container">
        <a className="navbar-brand" href="#">My Chat</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">Home</a>
            </li>
          </ul>
          <div className="dropdown d-flex">
            <div className="dropdown-toggle btn btn-outline-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span className={`position-absolute top-0 start-100 translate-middle p-2 border bg-${props.online ? 'success' : 'danger' } rounded-circle`}>
                <span className="visually-hidden">New alerts</span>
              </span>
              {props.current_user?.full_name}
            </div>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" onClick={() => signOut()}>Sign out</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

const mapStateToProps = (state) => ({
  current_user: state.session.current_user,
  online: state.session.online
})

const mapDispatchToProps = {
  setSession
}


export default connect(mapStateToProps, mapDispatchToProps)(Navbar)