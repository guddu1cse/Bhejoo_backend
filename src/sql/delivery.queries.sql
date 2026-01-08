-- Delivery Queries

-- Create delivery_assignments table (optional - can use orders table)
CREATE TABLE IF NOT EXISTS delivery_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  delivery_man_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('assigned', 'picked_up', 'on_the_way', 'delivered') DEFAULT 'assigned',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_man_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert delivery assignment
INSERT INTO delivery_assignments (order_id, delivery_man_id, status) 
VALUES (?, ?, ?);

-- Get assignments by delivery man
SELECT da.*, o.*, r.name as restaurant_name, u.name as user_name, u.email as user_email
FROM delivery_assignments da
JOIN orders o ON da.order_id = o.id
JOIN restaurants r ON o.restaurant_id = r.id
JOIN users u ON o.user_id = u.id
WHERE da.delivery_man_id = ?
ORDER BY da.assigned_at DESC;

-- Update assignment status
UPDATE delivery_assignments SET status = ? WHERE order_id = ?;
