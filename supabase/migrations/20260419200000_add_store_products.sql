-- Criar tabela de relação Many-to-Many entre stores e products
CREATE TABLE IF NOT EXISTS store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- Mover produtos existentes para a nova tabela
INSERT INTO store_products (store_id, product_id, created_at)
SELECT store_id, id, created_at
FROM products
WHERE store_id IS NOT NULL;

-- Tornar store_id nullable na tabela products
ALTER TABLE products ALTER COLUMN store_id DROP NOT NULL;

-- Policy para merchants gerenciarem store_products
CREATE POLICY "Merchants can manage store_products" 
ON store_products FOR ALL 
USING (
  store_id IN (
    SELECT s.id 
    FROM stores s
    JOIN merchants m ON s.merchant_id = m.id
    WHERE m.user_id = auth.uid()
  )
);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON store_products TO authenticated;