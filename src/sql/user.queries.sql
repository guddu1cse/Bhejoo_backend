-- User Queries

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'Delivery Man') DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  mapped_restaurant INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mapped_restaurant) REFERENCES restaurants(id) ON DELETE SET NULL
);

-- Insert user
INSERT INTO users (name, email, password, role, status, mapped_restaurant) 
VALUES (?, ?, ?, ?, ?, ?);

-- Find user by email
SELECT * FROM users WHERE email = ?;

-- Find user by id
SELECT * FROM users WHERE id = ?;

-- Update user
UPDATE users SET name = ?, email = ?, status = ?, mapped_restaurant = ? WHERE id = ?;

-- Get user with restaurant details
SELECT u.*, r.name as restaurant_name, r.location as restaurant_location 
FROM users u 
LEFT JOIN restaurants r ON u.mapped_restaurant = r.id 
WHERE u.id = ?;
