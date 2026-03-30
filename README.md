# PostgreSQL Basics

This repository contains basic PostgreSQL SQL scripts demonstrating various database operations including table creation, data manipulation, constraints, and joins.

## Connecting to PostgreSQL

To connect to a PostgreSQL database using the command line, use the `psql` command:

```bash
psql -U username -d database_name
```

Replace `username` with your PostgreSQL username and `database_name` with the target database.

## Common psql Meta-Commands

These are commands used within the psql interactive terminal to inspect and manage the database.

### \l - List All Databases

Lists all databases in the PostgreSQL cluster along with their owners and access privileges.

**Command:**
```sql
\l
```

**Example Output:**
```
                              List of databases
   Name    |  Owner   | Encoding | Collate | Ctype |   Access privileges   
-----------+----------+----------+---------+-------+------------------------
 postgres  | postgres | UTF8     | C       | C     | 
 template0 | postgres | UTF8     | C       | C     | =c/postgres          +
           |          |          |         |       | postgres=CTc/postgres
 template1 | postgres | UTF8     | C       | C     | =c/postgres          +
           |          |          |         |       | postgres=CTc/postgres
 mydb      | user     | UTF8     | C       | C     | 
(4 rows)
```

### \d tablename - Describe a Table

Shows the structure of a specific table, including column names, data types, and constraints.

**Command:**
```sql
\d person
```

**Example Output:**
```
                                      Table "public.person"
 Column |          Type          | Collation | Nullable |              Default               
--------+------------------------+-----------+----------+------------------------------------
 id     | integer                |           |          | 
 fname  | character varying(150) |           | not null | 'unknown'::character varying
 city   | character varying(100) |           |          | 
 mob    | character varying(15)  |           |          | 
Indexes:
    "person_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "mob_no_less_than_10" CHECK (length(mob::text) >= 10)
```

### \d+ - Describe with Extended Details

Provides detailed information about all tables in the current database, including indexes, constraints, and storage information.

**Command:**
```sql
\d+
```

**Example Output:**
```
                                      Table "public.customers"
 Column   |          Type          | Collation | Nullable |             Default              
-----------+------------------------+-----------+----------+---------------------------------
 cust_id   | integer                |           | not null | nextval('customers_cust_id_seq'::regclass)
 cust_name | character varying(100) |           | not null | 
Indexes:
    "customers_pkey" PRIMARY KEY, btree (cust_id)
Referenced by:
    TABLE "orders" CONSTRAINT "orders_cust_id_fkey" FOREIGN KEY (cust_id) REFERENCES customers(cust_id)

                                      Table "public.orders"
 Column  |         Type          | Collation | Nullable |            Default             
---------+-----------------------+-----------+----------+-------------------------------
 ord_id  | integer               |           | not null | nextval('orders_ord_id_seq'::regclass)
 ord_date| date                  |           | not null | 
 price   | numeric               |           | not null | 
 cust_id | integer               |           | not null | 
Indexes:
    "orders_pkey" PRIMARY KEY, btree (ord_id)
Foreign-key constraints:
    "orders_cust_id_fkey" FOREIGN KEY (cust_id) REFERENCES customers(cust_id)

                                      Table "public.person"
 Column |          Type          | Collation | Nullable |              Default               
--------+------------------------+-----------+----------+------------------------------------
 id     | integer                |           |          | 
 fname  | character varying(150) |           | not null | 'unknown'::character varying
 city   | character varying(100) |           |          | 
 mob    | character varying(15)  |           |          | 
Indexes:
    "person_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "mob_no_less_than_10" CHECK (length(mob::text) >= 10)
```

### \dt+ - List Tables with Details

Lists all tables in the current database along with their schema, owner, size, and description.

**Command:**
```sql
\dt+
```

**Example Output:**
```
                          List of relations
 Schema |     Name      | Type  |  Owner   |    Size    | Description 
--------+----------------+-------+----------+------------+-------------
 public | customers     | table | postgres | 8192 bytes | 
 public | orders        | table | postgres | 8192 bytes | 
 public | person        | table | postgres | 16 kB      | 
(3 rows)
```

## SQL Scripts in this Repository

This section provides detailed explanations of the tables created and queries demonstrated in each SQL file.

### Basic.sql

This script demonstrates fundamental table operations and data manipulation.

**Tables Created:**
- `person`: A basic table with columns `id` (INT), `name` (VARCHAR(100)), `city` (VARCHAR(100)). Later modified to include additional constraints and columns.

**Key Queries and Operations:**

1. **Database Listing:**
   ```sql
   SELECT datname FROM pg_database;
   ```
   Retrieves the names of all databases in the PostgreSQL cluster.

2. **Basic CRUD Operations:**
   - `SELECT * FROM person;`: Displays all records in the person table.
   - `INSERT INTO person VALUES(103,'Akshit','Delhi');`: Adds a new record.
   - `UPDATE person SET city='Banglour' WHERE id=103;`: Modifies existing data.
   - `DELETE FROM person WHERE id=103;`: Removes a record.

3. **Table Alterations:**
   - `ALTER TABLE person ADD COLUMN age INT;`: Adds a new column.
   - `ALTER TABLE person DROP COLUMN age;`: Removes a column.
   - `ALTER TABLE person RENAME COLUMN name TO fname;`: Renames a column.
   - `ALTER TABLE person RENAME TO perondata;`: Renames the table (note: later operations still use 'person', so this might be for demonstration).
   - `ALTER TABLE person ALTER COLUMN fname SET DATA TYPE VARCHAR(150);`: Changes column data type.
   - `ALTER TABLE person ALTER COLUMN fname SET DEFAULT 'unknown';`: Sets a default value.
   - `ALTER TABLE person ALTER COLUMN fname SET NOT NULL;`: Adds NOT NULL constraint.
   - `ALTER TABLE person ALTER COLUMN fname DROP DEFAULT;`: Removes default value.
   - `ALTER TABLE person ADD COLUMN mob VARCHAR(15) CHECK (LENGTH(mob)>=10);`: Adds column with check constraint.
   - `ALTER TABLE person DROP CONSTRAINT person_mob_check;`: Removes constraint.
   - `ALTER TABLE person ADD CONSTRAINT mob_no_less_than_10 CHECK (LENGTH(mob)>=10);`: Adds named constraint.

4. **Conditional Logic:**
   ```sql
   SELECT fname, salary, CASE WHEN salary >= 50000 THEN 'High' ELSE 'Low' END AS sal_cat FROM employees;
   ```
   Demonstrates CASE statements for conditional output (assumes employees table exists from ClauseOperation.sql).

### ClauseOperation.sql

This script creates a comprehensive employee database and demonstrates various SQL clauses, functions, and operations.

**Database and Tables Created:**
- Database: `bankdb`
- Table: `employees` with columns:
  - `emp_id` (SERIAL PRIMARY KEY): Auto-incrementing ID
  - `fname` (VARCHAR(50) NOT NULL): First name
  - `lname` (VARCHAR(50) NOT NULL): Last name
  - `email` (VARCHAR(100) NOT NULL UNIQUE): Email address
  - `dept` (VARCHAR(50)): Department
  - `salary` (DECIMAL(10,2) DEFAULT 30000.00): Salary
  - `hire_date` (DATE NOT NULL DEFAULT CURRENT_DATE): Hire date

**Key Queries and Operations:**

1. **Database and Table Setup:**
   - Creates the bankdb database and employees table with sample data (10 employees across different departments).

2. **Filtering Queries (WHERE clause):**
   - `SELECT * FROM employees WHERE emp_id=1;`: Exact match
   - `SELECT * FROM employees WHERE salary >= 50000;`: Greater than or equal
   - `SELECT * FROM employees WHERE dept='HR';`: String equality
   - `SELECT * FROM employees WHERE dept='HR' OR dept='Finance';`: OR condition
   - `SELECT * FROM employees WHERE dept='IT' AND salary>=50000;`: AND condition
   - `SELECT * FROM employees WHERE dept NOT IN ('IT','HR');`: NOT IN
   - `SELECT * FROM employees WHERE dept IN ('IT','HR');`: IN
   - `SELECT * FROM employees WHERE salary BETWEEN 50000 AND 60000;`: Range query

3. **Distinct and Ordering:**
   - `SELECT DISTINCT dept FROM employees;`: Unique department names
   - `SELECT * FROM employees ORDER BY fname;`: Sort by first name ascending
   - `SELECT * FROM employees ORDER BY fname DESC;`: Sort descending
   - `SELECT * FROM employees LIMIT 3;`: Limit results to 3 rows

4. **Pattern Matching (LIKE):**
   - `SELECT * FROM employees WHERE fname LIKE 'A%';`: Names starting with 'A'
   - `SELECT * FROM employees WHERE fname LIKE '%a';`: Names ending with 'a'
   - `SELECT * FROM employees WHERE fname LIKE '%i%';`: Names containing 'i'
   - `SELECT * FROM employees WHERE dept LIKE '__';`: Departments with exactly 2 characters
   - `SELECT * FROM employees WHERE fname LIKE '_a%';`: Second character is 'a'

5. **Aggregate Functions:**
   - `SELECT COUNT(emp_id) FROM employees;`: Total number of employees
   - `SELECT SUM(salary) FROM employees;`: Total salary
   - `SELECT AVG(salary) FROM employees;`: Average salary
   - `SELECT MAX(salary) FROM employees;`: Highest salary
   - `SELECT MIN(salary) FROM employees;`: Lowest salary

6. **GROUP BY Operations:**
   - `SELECT dept FROM employees GROUP BY dept;`: Group by department
   - `SELECT dept, COUNT(fname) FROM employees GROUP BY dept;`: Count employees per department
   - `SELECT dept, SUM(salary) FROM employees GROUP BY dept;`: Total salary per department
   - `SELECT dept, MAX(salary) FROM employees GROUP BY dept;`: Highest salary per department

7. **String Functions:**
   - `SELECT CONCAT(fname, lname) FROM employees;`: Concatenate first and last names
   - `SELECT CONCAT_WS(' ', fname, lname) AS FullName FROM employees;`: Concatenate with separator
   - `SELECT REPLACE(dept, 'IT', 'TECH') FROM employees;`: Replace text
   - `SELECT LENGTH(fname) FROM employees;`: String length
   - `SELECT UPPER(fname) FROM employees;`: Convert to uppercase
   - `SELECT LEFT('Hello', 2);`: Left substring
   - `SELECT RIGHT('Hello', 2);`: Right substring
   - `SELECT TRIM('   alright!   ');`: Remove whitespace
   - `SELECT POSITION('om' IN 'Thomas');`: Find substring position

8. **Advanced Queries:**
   - Finding the highest paid employee using ORDER BY LIMIT and subquery
   - Complex concatenations with multiple functions

### foreign key.sql

This script demonstrates foreign key relationships and various join operations.

**Tables Created:**
- `customers`: 
  - `cust_id` (SERIAL PRIMARY KEY): Auto-incrementing customer ID
  - `cust_name` (VARCHAR(100) NOT NULL): Customer name
- `orders`:
  - `ord_id` (SERIAL PRIMARY KEY): Auto-incrementing order ID
  - `ord_date` (DATE NOT NULL): Order date
  - `price` (NUMERIC NOT NULL): Order price
  - `cust_id` (INTEGER NOT NULL): Foreign key referencing customers.cust_id

**Key Queries and Operations:**

1. **Table Creation with Relationships:**
   - Creates customers table with sample data (4 customers: Raju, Sham, Paul, Alex)
   - Creates orders table with foreign key constraint linking to customers

2. **Data Insertion:**
   - Inserts customer records
   - Inserts order records with references to customer IDs

3. **Basic Selects:**
   - `SELECT * FROM customers;`: Display all customers
   - `SELECT * FROM orders;`: Display all orders

4. **Join Operations:**
   - `SELECT * FROM customers CROSS JOIN orders;`: Cartesian product (all combinations)
   - `SELECT * FROM customers c INNER JOIN orders o ON c.cust_id=o.cust_id;`: Inner join (matching records only)
   - `SELECT * FROM customers c LEFT JOIN orders o ON c.cust_id=o.cust_id;`: Left join (all customers, matching orders)
   - `SELECT * FROM customers c RIGHT JOIN orders o ON c.cust_id=o.cust_id;`: Right join (all orders, matching customers)

5. **Aggregations with Joins:**
   - `SELECT c.cust_name, COUNT(o.ord_id) FROM customers c INNER JOIN orders o ON c.cust_id=o.cust_id GROUP BY cust_name;`: Count orders per customer
   - `SELECT c.cust_name, SUM(o.price) FROM customers c INNER JOIN orders o ON c.cust_id=o.cust_id GROUP BY cust_name;`: Total order value per customer

### ManyToMany.sql (students ↔ courses via enrollment)
- Tables:
  - `students` (`s_id`, `name`)
  - `courses` (`c_id`, `name`, `fee`)
  - `enrollment` (`enrollment_id`, `s_id`, `c_id`, `enrollment_date`)
- Note: fix the foreign key line in `enrollment` if needed:
  - `FOREIGN KEY (c_id) REFERENCES courses(c_id)`

Query:
```sql
SELECT e.enrollment_id,
       s.name AS student_name,
       c.name AS course_name,
       c.fee,
       e.enrollment_date
FROM enrollment e
JOIN students s ON e.s_id = s.s_id
JOIN courses c ON e.c_id = c.c_id;
```

Output example:
- Raju, Maths, 500.00, 2024-01-01
- Raju, Physics, 600.00, 2024-01-15
- Sham, Maths, 500.00, 2024-02-01
- Sham, Chemistry, 700.00, 2024-02-15
- Alex, Chemistry, 700.00, 2024-03-25

### Project.sql (customers, orders, products, order_items, revenue per order)
- Tables:
  - `customers` (`cust_id`, `cust_name`)
  - `orders` (`ord_id`, `ord_date`, `cust_id`)
  - `products` (`p_id`, `p_name`, `price`)
  - `order_items` (`item_id`, `ord_id`, `p_id`, `quantity`)
- Foreign keys:
  - `orders.cust_id` → `customers.cust_id`
  - `order_items.ord_id` → `orders.ord_id`
  - `order_items.p_id` → `products.p_id`

Query:
```sql
SELECT c.cust_name,
       o.ord_date,
       p.p_name,
       p.price,
       oi.quantity,
       (oi.quantity * p.price) AS total_price
FROM order_items oi
JOIN orders o ON oi.ord_id = o.ord_id
JOIN products p ON oi.p_id = p.p_id
JOIN customers c ON o.cust_id = c.cust_id;
```

Output example:
- Raju, 2024-01-01, Laptop, 55000.00, 1, 55000.00
- Raju, 2024-01-01, Cable, 250.00, 2, 500.00
- Sham, 2024-02-01, Laptop, 55000.00, 1, 55000.00
- Paul, 2024-03-01, Mouse, 500.00, 1, 500.00
- Paul, 2024-03-01, Cable, 250.00, 5, 1250.00
- Alex, 2024-04-04, Keyboard, 800.00, 1, 800.00

## Project.sql: Data Output + EXPLAIN

### `customers`
- (1, Raju)
- (2, Sham)
- (3, Paul)
- (4, Alex)

### `orders`
- (1, 2024-01-01, 1)
- (2, 2024-02-01, 2)
- (3, 2024-03-01, 3)
- (4, 2024-04-04, 2)

### `products`
- (1, Laptop, 55000.00)
- (2, Mouse, 500)
- (3, Keyboard, 800.00)
- (4, Cable, 250.00)

### `order_items`
- (1, 1, 1, 1)
- (2, 1, 4, 2)
- (3, 2, 1, 1)
- (4, 3, 2, 1)
- (5, 3, 4, 5)
- (6, 4, 3, 1)

### Billing query output (from view/join)
| cust_name | ord_date    | p_name   | price   | quantity | total_price |
|-----------|-------------|----------|---------|----------|-------------|
| Raju      | 2024-01-01  | Laptop   | 55000.00| 1        | 55000.00    |
| Raju      | 2024-01-01  | Cable    | 250.00  | 2        | 500.00      |
| Sham      | 2024-02-01  | Laptop   | 55000.00| 1        | 55000.00    |
| Paul      | 2024-03-01  | Mouse    | 500.00  | 1        | 500.00      |
| Paul      | 2024-03-01  | Cable    | 250.00  | 5        | 1250.00     |
| Alex      | 2024-04-04  | Keyboard | 800.00  | 1        | 800.00      |

### Aggregation outputs
- `SUM(total_price)` by `p_name`:
  - Cable: 1750.00
  - Keyboard: 800.00
  - Laptop: 110000.00
  - Mouse: 500.00
- `HAVING SUM(total_price) > 1500`:
  - Cable, Laptop
- `ROLLUP(p_name)` adds grand total row: NULL -> 113050.00

### EXPLAIN (plan / concept)
- Base: sequential scan on `order_items`.
- Join `orders` on `oi.ord_id = orders.ord_id` (hash join in default Postgres for small tables).
- Join `products` on `oi.p_id = products.p_id`.
- Join `customers` on `orders.cust_id = customers.cust_id`.
- Compute `total_price` as `oi.quantity * p.price` to project final output.
- For group by queries, group aggregate by `p_name`, then optional `HAVING` or `ROLLUP`.

## advance.sql (procedures + function)

### `update_emp_salary` procedure
- Input: `p_employee_id` INT, `p_new_salary` NUMERIC
- Behavior: Updates `employees.salary` for matching `emp_id`.
- Sample call:
  - `CALL update_emp_salary(3, 70000);`
- Result: employee 3 salary becomes `70000` (assumes `employees` table exists and id 3 exists).

### `add_employee` procedure
- Input: `p_fname`, `p_lname`, `p_email`, `p_dept`, `p_salary`.
- Behavior: Inserts new employee into `employees`.
- Sample call (not in file but can run):
  - `CALL add_employee('Nina','Patel','nina@example.com','IT',65000);`
- Result: new row added to `employees`.

### `dept_max_sal_emp1` function
- Input: `dept_name` VARCHAR
- Returns: table with `(emp_id, fname, salary)`.
- Behavior: returns employee(s) with max salary in department.
- Sample query:
  - `SELECT * FROM dept_max_sal_emp1('IT');`
- Output example: row for employee with max salary in IT (from current data).

### Window function samples (in advance.sql)
- `SELECT fname, SUM(salary) OVER() FROM empployees;`  -- typo `empployees` should be `employees`
- `SELECT fname, SUM(salary) OVER(ORDER BY salary) FROM employees;`
- `SELECT fname, AVG(salary) OVER(ORDER BY salary) FROM employees;`

### Implementation notes
- `update_emp_salary` & `add_employee` are PL/pgSQL procedures using `LANGUAGE plpgsql`.
- `dept_max_sal_emp1` uses `RETURN QUERY` + correlated subquery.
- `UPDATE`, `INSERT`, and `SELECT` behavior assumes `employees` data state.
- `execute` is not used; the logic is declarative and safe when parameters are validated.

## Running the Scripts

To execute these SQL scripts against your PostgreSQL database:

```bash
psql -U username -d database_name -f Basic.sql
psql -U username -d database_name -f ClauseOperation.sql
psql -U username -d database_name -f foreign\ key.sql
```

Note: Make sure to handle the space in "foreign key.sql" by escaping it or using quotes.

## Prerequisites

- PostgreSQL installed and running
- Access to a PostgreSQL user with appropriate permissions
- psql command-line tool available

## Additional: describe, query, relationships, \dt, \dv

### Describe a table (`\d`)
- Use `\d table_name` in `psql` to inspect columns, data types, constraints, indexes, and defaults.
- For example, `\d customers` shows:
  - `cust_id SERIAL PRIMARY KEY`
  - `cust_name VARCHAR(100) NOT NULL`

### Describe all tables (`\dt`)
- `\dt` lists tables in the current schema, such as `customers`, `orders`, `products`, `order_items`.
- `\dt+` adds size and description details.

### Describe all views (`\dv`)
- `\dv` lists views in the current schema, including `billing_info`.

### Table relationships from Project.sql
- `customers` (cust_id PK)
- `orders` (ord_id PK, cust_id FK → customers(cust_id))
- `products` (p_id PK)
- `order_items` (item_id PK, ord_id FK → orders(ord_id), p_id FK → products(p_id))
- Relationship model:
  - 1 customer → N orders
  - 1 order → N order_items
  - 1 product → N order_items

### Query overview (Project.sql)
```sql
SELECT c.cust_name,
       o.ord_date,
       p.p_name,
       p.price,
       oi.quantity,
       (oi.quantity * p.price) AS total_price
FROM order_items oi
JOIN orders o ON oi.ord_id = o.ord_id
JOIN products p ON oi.p_id = p.p_id
JOIN customers c ON o.cust_id = c.cust_id;
```
- Starts with `order_items` as the line-item anchor.
- Joins to `orders`, `products`, `customers` by foreign keys.
- Calculates row-level `total_price` as `quantity * price`.
- Returns full billing details per item row.
