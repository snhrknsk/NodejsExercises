MySQL Configuration:
Install MySQL8.0
-Create Table testdb and tables
-Create User "user" and set auth option
 CREATE USER user IDENTIFIED BY '!1234Password'
 ALTER USER 'user' IDENTIFIED WITH mysql_native_password BY '!1234Password';
 GRANT ALL ON *.* TO 'user'@'%' WITH GRANT OPTION;

Node.js Configuration
-Install express
-Install mysql
