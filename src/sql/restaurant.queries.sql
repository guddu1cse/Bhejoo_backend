-- Restaurant Queries

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(500) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert restaurant
INSERT INTO restaurants (name, location, description, phone, status) 
VALUES (?, ?, ?, ?, ?);

-- Get all restaurants
SELECT * FROM restaurants WHERE status = 'active';

-- Get restaurant by id
SELECT * FROM restaurants WHERE id = ?;

-- Update restaurant
UPDATE restaurants SET name = ?, location = ?, description = ?, phone = ?, status = ? WHERE id = ?;

-- Delete restaurant (soft delete)
UPDATE restaurants SET status = 'inactive' WHERE id = ?;

-- Get restaurant with dishes count
SELECT r.*, COUNT(d.id) as dishes_count 
FROM restaurants r 
LEFT JOIN dishes d ON r.id = d.restaurant_id AND d.availability = 'available'
WHERE r.id = ? 
GROUP BY r.id;
