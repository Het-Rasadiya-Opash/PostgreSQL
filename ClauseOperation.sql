CREATE DATABASE bankdb;

CREATE TABLE employees(
	emp_id SERIAL PRIMARY KEY,
	fname VARCHAR(50) NOT NULL,
	lname VARCHAR(50) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	dept VARCHAR(50),
	salary DECIMAL(10,2) DEFAULT 30000.00,
	hire_date DATE NOT NULL DEFAULT CURRENT_DATE
);

SELECT datname FROM pg_database;

SELECT * FROM employees;

INSERT INTO employees (emp_id, fname, lname, email, dept, salary, hire_date)
VALUES
(1, 'Raj', 'Sharma', 'raj.sharma@example.com', 'IT', 50000.00, '2020-01-15'),
(2, 'Priya', 'Singh', 'priya.singh@example.com', 'HR', 45000.00, '2019-03-22'),
(3, 'Arjun', 'Verma', 'arjun.verma@example.com', 'IT', 55000.00, '2021-06-01'),
(4, 'Suman', 'Patel', 'suman.patel@example.com', 'Finance', 60000.00, '2018-07-30'),
(5, 'Kavita', 'Rao', 'kavita.rao@example.com', 'HR', 47000.00, '2020-11-10'),
(6, 'Amit', 'Gupta', 'amit.gupta@example.com', 'Marketing', 52000.00, '2020-09-25'),
(7, 'Neha', 'Desai', 'neha.desai@example.com', 'IT', 48000.00, '2019-05-18'),
(8, 'Rahul', 'Kumar', 'rahul.kumar@example.com', 'IT', 53000.00, '2021-02-14'),
(9, 'Anjali', 'Mehta', 'anjali.mehta@example.com', 'Finance', 61000.00, '2018-12-03'),
(10, 'Vijay', 'Nair', 'vijay.nair@example.com', 'Marketing', 50000.00, '2020-04-19');

SELECT * FROM employees  WHERE emp_id=1;
SELECT * FROM employees  WHERE salary >= 50000;
SELECT * FROM employees  WHERE dept='HR';
SELECT * FROM employees  WHERE dept='HR' or dept='Finance';
SELECT * FROM employees  WHERE dept='IT' AND salary>=50000;
SELECT * FROM employees  WHERE dept NOT IN ('IT','HR');
SELECT * FROM employees  WHERE dept IN ('IT','HR');
SELECT * FROM employees  WHERE salary BETWEEN 50000 AND 60000;
SELECT DISTINCT dept FROM employees;
SELECT * FROM employees ORDER BY fname;
SELECT * FROM employees ORDER BY fname DESC;
SELECT * FROM employees LIMIT 3;
SELECT * FROM employees WHERE fname LIKE 'A%';
SELECT * FROM employees WHERE fname LIKE '%a';
SELECT * FROM employees WHERE fname LIKE '%i%';
SELECT * FROM employees WHERE dept LIKE  '__';
SELECT * FROM employees WHERE fname LIKE  '_a%';




SELECT COUNT(emp_id) FROM Employees;
SELECT COUNT(fname) FROM Employees;
SELECT SUM(salary) FROM Employees;
SELECT AVG(salary) FROM Employees;
SELECT MAX(salary) FROM Employees;
SELECT MIN(salary) FROM Employees;



SELECT dept FROM Employees GROUP BY dept;
SELECT dept, COUNT(fname) FROM Employees GROUP BY dept;
SELECT dept, SUM(salary) FROM Employees GROUP BY dept;
SELECT dept, MAX(salary) FROM Employees GROUP BY dept;


SELECT CONCAT(fname,lname) FROM Employees;
SELECT CONCAT(fname,lname) AS FullName FROM Employees;
SELECT emp_id, CONCAT(fname,lname) AS FullName FROM Employees;
SELECT emp_id, CONCAT(fname,' ',lname) AS FullName FROM Employees;
SELECT emp_id, CONCAT_WS('-',fname,lname) AS FullName FROM Employees;
SELECT REPLACE(dept,'IT','TECH') from Employees;
SELECT * from Employees WHERE LENGTH(fname)>5;
SELECT LENGTH(fname) from Employees;
SELECT SUBSTR('Het Rasadiya',1,3);
SELECT REPLACE('Het Rasadiya','Het','Demo');
SELECT UPPER(fname) from Employees;
SELECT LEFT('Hello',2);
SELECT RIGHT('Hello',2);
SELECT TRIM('   alright!  ');
SELECT LENGTH(TRIM('   Alright   '));
SELECT POSITION('om' in 'Thomas');


SELECT CONCAT_WS(':',emp_id,fname,lname,dept,salary) FROM Employees LIMIT 1;
SELECT CONCAT_WS(':',emp_id, CONCAT_WS(' ',fname,lname) ,dept,salary) FROM Employees LIMIT 1;
SELECT CONCAT_WS(':',emp_id,fname,UPPER(dept)) FROM Employees WHERE emp_id=4;
SELECT CONCAT(LEFT(dept,1),emp_id), fname FROM Employees limit 2;
SELECT DISTINCT dept from Employees;
SELECT * FROM Employees ORDER BY salary DESC;
SELECT * FROM Employees LIMIT 3;
SELECT * FROM Employees WHERE fname LIKE 'A%';
SELECT * FROM Employees  WHERE LENGTH(lname)=5;
SELECT COUNT(emp_id) FROM Employees;
SELECT dept, COUNT(emp_id) FROM Employees GROUP BY dept;

select * from employees order  by salary desc limit 1;
select * from employees where salary=(select max(salary) from employees);
