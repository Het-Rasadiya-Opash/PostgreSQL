CREATE OR REPLACE PROCEDURE update_emp_salary(
    p_employee_id INT,
    p_new_salary NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE employees
    SET salary = p_new_salary
    WHERE emp_id = p_employee_id;
END;
$$;

CALL update_emp_salary(3,70000);




CREATE OR REPLACE PROCEDURE add_employee(
    p_fname VARCHAR,
    p_lname VARCHAR,
    p_email VARCHAR,
    p_dept VARCHAR,
    p_salary NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO employees (fname, lname, email, dept, salary)
    VALUES (p_fname, p_lname, p_email, p_dept, p_salary);
END;
$$;


CREATE OR REPLACE FUNCTION dept_max_sal_emp1(dept_name VARCHAR)
RETURNS TABLE(emp_id INT, fname VARCHAR, salary NUMERIC) 
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.emp_id,  e.fname, e.salary
    FROM 
        employees e
    WHERE 
        e.dept = dept_name
        AND e.salary = (
            SELECT MAX(emp.salary)
            FROM employees emp
            WHERE emp.dept = dept_name
        );
END;
$$ LANGUAGE plpgsql;

SELECT * FROM dept_max_sal_emp1('IT');

SELECT fname, SUM(salary) OVER() FROM empployees;

SELECT fname, SUM(salary) OVER(ORDER BY salary) FROM employees;
SELECT fname, AVG(salary) OVER(ORDER BY salary) FROM employees;

SELECT ROW_NUMBER() OVER(ORDER BY fname), fname, dept, salary FROM employees;

SELECT ROW_NUMBER() OVER(PARTITION BY dept), fname, dept, salary FROM employees;

SELECT fname,salary, RANK() OVER(ORDER BY salary) FROM employees;

SELECT fname,salary, RANK() OVER(ORDER BY salary DESC) FROM employees;

SELECT fname,salary, DENSE_RANK() OVER(ORDER BY salary DESC) FROM employees;

SELECT fname,salary, LAG(salary) OVER() FROM employees;

SELECT fname,salary, LEAD(salary) OVER() FROM employees;

SELECT fname,salary, LEAD(salary) OVER(ORDER BY salary DESC) FROM employees;

SELECT fname,salary, (salary - LEAD(salary) OVER(ORDER BY salary DESC)) FROM employees;

SELECT fname,salary, (salary - LEAD(salary) OVER(ORDER BY salary DESC)) AS Salary_Diff FROM employees;





WITH AvgSal AS (
    SELECT 
        dept, AVG(salary) AS avg_salary FROM employees
    GROUP BY 
        dept
)
SELECT 
    e.emp_id, e.fname, e.dept, e.salary, 
    a.avg_salary
FROM 
    employees e
JOIN 
    AvgSal a ON e.dept = a.dept
WHERE 
    e.salary > a.avg_salary;




WITH HighestPaid AS (
    SELECT 
        dept, 
        MAX(salary) AS max_salary
    FROM 
        employees
    GROUP BY 
        dept
)
SELECT 
    e.emp_id, 
    e.fname, 
    e.lname,  
    e.dept, 
    e.salary
FROM 
    employees e
JOIN 
    HighestPaid h ON e.dept = h.dept AND e.salary = h.max_salary;



CREATE OR REPLACE FUNCTION check_salary()	
RETURNS TRIGGER AS $$
BEGIN 
	IF NEW.salary < 0 THEN
		NEW.salary = 0;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_update_salary
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION check_salary();

CALL update_emp_salary(1,-56000);



CREATE TABLE orders(
	FOREIGN KEY (cust_id) REFERENCES customers(cust_id) ON DELETE CASCADE
)