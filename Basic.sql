CREATE TABLE person(
	id INT,
	name VARCHAR(100),
	city VARCHAR(100)
);

SELECT datname FROM pg_database;

SELECT * FROM person;

INSERT INTO person values(103,'Akshit','Delhi');

UPDATE person SET city='Banglour' WHERE id=103;

DELETE FROM person where id=103;


ALTER TABLE person ADD COLUMN age INT;

ALTER TABLE person DROP COLUMN age;

ALTER TABLE person RENAME COLUMN name TO fname;

ALTER TABLE person TO perondata;


ALTER TABLE person  ALTER COLUMN fname SET DATA TYPE VARCHAR(150);

ALTER TABLE person  ALTER COLUMN fname SET DEFAULT 'unknown';

ALTER TABLE person  ALTER COLUMN fname SET NOT NULL;

ALTER TABLE person  ALTER COLUMN fname DROP DEFAULT;

ALTER TABLE person ADD COLUMN mob VARCHAR(15) CHECK (LENGTH(mob)>=10);

alter table person drop constraint person_mob_check;

ALTER TABLE person ADD CONSTRAINT mob_no_less_than_10 CHECK (LENGTH(mob)>=10);

SELECT fname,salary, CASE WHEN salary >= 50000 THEN 'High' ELSE 'Low' END AS sal_cat FROM employees;

 SELECT fname,salary, CASE WHEN salary >= 50000 THEN 'High' WHEN salary >=48000 AND salary < 50000 THEN 'Mid' ELSE 'Low' END AS sal_cat FROM employees;