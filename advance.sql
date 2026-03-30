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

