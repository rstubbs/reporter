ReadMe.txt
******************************************************************
******************************************************************

--Requirements--

You need Node.js and MongoDB installed and running.

We use Grunt as our task runner. Get the CLI (command line interface).

$ npm install grunt-cli -g
We use Bower as our front-end package manager. Get the CLI (command line interface).

$ npm install bower -g

******************************************************************
******************************************************************

--How to run--

-Copy the "example-config.js" and rename it "config.js" and fill in the appropiate details.
-Run your MongoDB.
-Open command line in the project directory and use the following command.

$ grunt

******************************************************************
******************************************************************

--Admin Setup--
To set up a admin user run these commands in a mongo CLI:

use drywall; //your mongo db name
db.admingroups.insert({ _id: 'root', name: 'Root' });
db.admins.insert({ name: {first: 'Root', last: 'Admin', full: 'Root Admin'}, groups: ['root'] });
var rootAdmin = db.admins.findOne();
db.users.save({ username: 'root', isActive: 'yes', email: 'your@email.addy', roles: {admin: rootAdmin._id} });
var rootUser = db.users.findOne();
rootAdmin.user = { id: rootUser._id, name: rootUser.username };
db.admins.save(rootAdmin);


Now just use the reset password feature to set a password.(smtp server details must be setup in order for the email to send)

http://localhost:3000/login/forgot/
Submit your email address and wait a second.
Go check your email and get the reset link.
http://localhost:3000/login/reset/:email/:token/
Set a new password.

******************************************************************
******************************************************************

--Functionality--

- Basic front end web pages.
- Contact page has form to email. 
- Login system with forgot password and reset password.	
- Signup and Login with Facebook, Twitter, GitHub, Google and Tumblr.
- Optional email verification during signup flow.
- User system with separate account and admin roles.
- Admin groups with shared permission settings.	 
- Administrator level permissions that override group permissions.
- Global admin quick search component.
- File management system(Allows basic CRUD fucntionality)
- File History logging

******************************************************************
******************************************************************

--To Be Added Features--

-//to be decided

******************************************************************
******************************************************************

--Trouble Shooting--

-If the Website is apearing as basic html or is lacking styling elements ensure Bootstrap is installed. You can do this useing a GitBash tool. Open a Git Bash in your project directory and use the following command.

$ bower install bootstrap

-Getting errors referenceing python during install? Make sure you have Pyhton version 2.7.9 installed and not any new versions as the project is only compatable with this verison of python.

******************************************************************
******************************************************************
