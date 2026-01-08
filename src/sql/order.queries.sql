-- Order Queries

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'packed', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('COD') DEFAULT 'COD',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  delivery_address TEXT NOT NULL,
  delivery_man_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_man_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  dish_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

-- Insert order
INSERT INTO orders (user_id, restaurant_id, status, total_amount, payment_method, payment_status, delivery_address, delivery_man_id) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Insert order item
INSERT INTO order_items (order_id, dish_id, quantity, price) 
VALUES (?, ?, ?, ?);

-- Get order by id with details
SELECT o.*, 
       u.name as user_name, u.email as user_email,
       r.name as restaurant_name, r.location as restaurant_location,
       dm.name as delivery_man_name
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN restaurants r ON o.restaurant_id = r.id
LEFT JOIN users dm ON o.delivery_man_id = dm.id
WHERE o.id = ?;

-- Get order items
SELECT oi.*, d.name as dish_name, d.description as dish_description
FROM order_items oi
JOIN dishes d ON oi.dish_id = d.id
WHERE oi.order_id = ?;

-- Get orders by user
SELECT o.*, r.name as restaurant_name
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
WHERE o.user_id = ?
ORDER BY o.created_at DESC;

-- Get orders by restaurant
SELECT o.*, u.name as user_name, u.email as user_email
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.restaurant_id = ?
ORDER BY o.created_at DESC;

-- Get orders by delivery man
SELECT o.*, r.name as restaurant_name, u.name as user_name
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
JOIN users u ON o.user_id = u.id
WHERE o.delivery_man_id = ?
ORDER BY o.created_at DESC;

-- Update order status
UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- Assign delivery man to order
UPDATE orders SET delivery_man_id = ?, status = 'assigned', updated_at = CURRENT_TIMESTAMP WHERE id = ?;
