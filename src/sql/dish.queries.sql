-- Dish Queries

-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  availability ENUM('available', 'unavailable') DEFAULT 'available',
  restaurant_id INT NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Insert dish
INSERT INTO dishes (name, description, price, availability, restaurant_id, image_url, category) 
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Get all dishes by restaurant
SELECT * FROM dishes WHERE restaurant_id = ? ORDER BY created_at DESC;

-- Get available dishes by restaurant
SELECT * FROM dishes WHERE restaurant_id = ? AND availability = 'available' ORDER BY name;

-- Get dish by id
SELECT d.*, r.name as restaurant_name 
FROM dishes d 
JOIN restaurants r ON d.restaurant_id = r.id 
WHERE d.id = ?;

-- Update dish
UPDATE dishes SET name = ?, description = ?, price = ?, availability = ?, image_url = ?, category = ? WHERE id = ?;

-- Delete dish
DELETE FROM dishes WHERE id = ?;

-- Update dish availability
UPDATE dishes SET availability = ? WHERE id = ?;
