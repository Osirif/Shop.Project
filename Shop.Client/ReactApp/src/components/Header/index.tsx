import './Header.css'

import { Link } from 'react-router-dom'

function Header() {
  return (
    <div className="header">
      <div className="wrapper">
        <Link className="navLink" to="/">
          <div className="logo">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_102_2)">
                <path
                  d="M11 0C8.87827 0 6.84344 0.842855 5.34315 2.34315C3.84285 3.84344 3 5.87827 3 8V16H5V8C5 6.4087 5.63214 4.88258 6.75736 3.75736C7.88258 2.63214 9.4087 2 11 2C12.5913 2 14.1174 2.63214 15.2426 3.75736C16.3679 4.88258 17 6.4087 17 8V16H19V8C19 5.87827 18.1571 3.84344 16.6569 2.34315C15.1566 0.842855 13.1217 0 11 0Z"
                  fill="#F4900C"
                />
                <path
                  d="M1 8L3 10L5 8L7 10L9 8L11 10L13 8L15 10L17 8L19 10L21 8V31H1V8Z"
                  fill="#DD2E44"
                />
                <path
                  d="M25 5C22.8783 5 20.8434 5.84285 19.3431 7.34315C17.8429 8.84344 17 10.8783 17 13V21H19V13C19 11.4087 19.6321 9.88258 20.7574 8.75736C21.8826 7.63214 23.4087 7 25 7C26.5913 7 28.1174 7.63214 29.2426 8.75736C30.3679 9.88258 31 11.4087 31 13V21H33V13C33 10.8783 32.1571 8.84344 30.6569 7.34315C29.1566 5.84285 27.1217 5 25 5Z"
                  fill="#FFCC4D"
                />
                <path
                  d="M15 13L17 15L19 13L21 15L23 13L25 15L27 13L29 15L31 13L33 15L35 13V36H15V13Z"
                  fill="#744EAA"
                />
              </g>
              <defs>
                <clipPath id="clip0_102_2">
                  <rect width="36" height="36" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <h1>Shop</h1>
          </div>
        </Link>
        <nav>
          <Link className="navLink" to="/products-list">
            Products list
          </Link>
        </nav>
      </div>
    </div>
  )
}

export default Header
