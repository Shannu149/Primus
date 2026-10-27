CREATE TABLE IF NOT EXISTS store_information (
    topic VARCHAR(80) NOT NULL PRIMARY KEY,
    content TEXT NOT NULL
);


-- Safe on repeated starts. Existing order rows are labelled ONCE.
SET @order_type_migration = IF(
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='orders')
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='orders' AND column_name='order_type'),
  'ALTER TABLE orders ADD COLUMN order_type VARCHAR(16) NOT NULL DEFAULT ''ONCE''',
  'SELECT 1');
PREPARE order_type_statement FROM @order_type_migration;
EXECUTE order_type_statement;
DEALLOCATE PREPARE order_type_statement;

CREATE TABLE IF NOT EXISTS pmp_requests (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 request_token VARCHAR(36) NOT NULL UNIQUE,
 customer_name VARCHAR(120) NOT NULL,
 mobile VARCHAR(15) NOT NULL,
 area VARCHAR(200) NOT NULL,
 age INT NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'NEW',
 hospital_name VARCHAR(200) NOT NULL DEFAULT '',
 doctor_name VARCHAR(160) NOT NULL DEFAULT '',
 qualifications VARCHAR(200) NOT NULL DEFAULT '',
 hospital_address VARCHAR(500) NOT NULL DEFAULT '',
 hospital_phone VARCHAR(30) NOT NULL DEFAULT '',
 card_ready BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 published_at TIMESTAMP NULL
);
