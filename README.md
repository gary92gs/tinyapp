# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

#### Features (implemented):
* Create a shortened url that links to an originally-sized url.
* Edit/Delete your old shortened urls as you see fit.
* Account Password is stored securely
* Registration/Login Verification is handled securely 

#### Features (to-be implemented)
* Persistent URL Storage

#### App Screen Shots:
* [Login Page](https://github.com/gary92gs/tinyapp/blob/master/docs/login-page.png)
* [User Registration Page](https://github.com/gary92gs/tinyapp/blob/master/docs/registration-page.png)
* [Main URLs Page (Index)](https://github.com/gary92gs/tinyapp/blob/master/docs/main-urls-page.png)
* [Create New URL Page (New)](https://github.com/gary92gs/tinyapp/blob/master/docs/create-url-page.png)
* [View/Edit Individual URLs Page (Show)](https://github.com/gary92gs/tinyapp/blob/master/docs/individual-urls-page.png)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Register a user account to begin creating, editing, and using your shortened urls
  - Default/Testing Login Credentials are as follows:
    - email: test@test.com
    - password: amazing
  