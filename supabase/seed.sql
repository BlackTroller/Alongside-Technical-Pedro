-- Seed data para desenvolvimento
-- NOTA: O user_id deve ser um UUID válido de auth.users
-- Substitui pelo teu user_id real após autenticares

INSERT INTO merchants (id, user_id, email, name) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'demo@alongside.pt', 'Merchant Demo'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'admin@alongside.pt', 'Admin User');

INSERT INTO stores (merchant_id, name, phone, street, city, state, zip, timezone, latitude, longitude)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Loja Porto', '+351 912 345 678', 'Rua de Santa Catarina, 123', 'Porto', 'Porto', '4000-001', 'Europe/Lisbon', 41.1579438, -8.6291052),
  ('550e8400-e29b-41d4-a716-446655440001', 'Loja Braga', '+351 253 123 456', 'Av. da Liberdade, 50', 'Braga', 'Braga', '4700-001', 'Europe/Lisbon', 41.5454, -8.4265),
  ('550e8400-e29b-41d4-a716-446655440002', 'Loja Lisboa', '+351 211 234 567', 'Av. da Liberdade, 110', 'Lisboa', 'Lisboa', '1250-096', 'Europe/Lisbon', 38.7169, -9.1395);

INSERT INTO products (name, description, price, is_available)
VALUES 
  ('Produto A', 'Descrição do Produto A', 29.99, true),
  ('Produto B', 'Descrição do Produto B', 49.99, true),
  ('Produto C', 'Descrição do Produto C', 19.99, false),
  ('Produto D', 'Descrição do Produto D', 99.99, true),
  ('Produto E', 'Descrição do Produto E', 9.99, true);

INSERT INTO store_products (store_id, product_id)
VALUES 
  ((SELECT id FROM stores WHERE name = 'Loja Porto' LIMIT 1), (SELECT id FROM products WHERE name = 'Produto A' LIMIT 1)),
  ((SELECT id FROM stores WHERE name = 'Loja Porto' LIMIT 1), (SELECT id FROM products WHERE name = 'Produto B' LIMIT 1)),
  ((SELECT id FROM stores WHERE name = 'Loja Braga' LIMIT 1), (SELECT id FROM products WHERE name = 'Produto B' LIMIT 1)),
  ((SELECT id FROM stores WHERE name = 'Loja Braga' LIMIT 1), (SELECT id FROM products WHERE name = 'Produto C' LIMIT 1)),
  ((SELECT id FROM stores WHERE name = 'Loja Lisboa' LIMIT 1), (SELECT id FROM products WHERE name = 'Produto D' LIMIT 1)),
  ((SELECT id FROM stores WHERE name = 'Loja Lisboa' LIMIT 1), (SELECT id FROM products WHERE name = 'Produto E' LIMIT 1));