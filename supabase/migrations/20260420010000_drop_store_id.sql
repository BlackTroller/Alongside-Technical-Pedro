-- Remove RLS policies that depend on store_id
DROP POLICY IF EXISTS "Merchants can manage products of their stores" ON products;

-- Remove redundant store_id field from products table
ALTER TABLE products DROP COLUMN IF EXISTS store_id;