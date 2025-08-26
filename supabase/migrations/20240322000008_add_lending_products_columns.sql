ALTER TABLE lenders ADD COLUMN IF NOT EXISTS has_conventional BOOLEAN DEFAULT false;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS has_fha BOOLEAN DEFAULT false;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS has_heloc BOOLEAN DEFAULT false;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS has_dpa BOOLEAN DEFAULT false;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS has_jumbo BOOLEAN DEFAULT false;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS has_va BOOLEAN DEFAULT false;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS has_usda BOOLEAN DEFAULT false;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS has_bank_statement BOOLEAN DEFAULT false;
ALTER TABLE lenders ADD COLUMN IF NOT EXISTS has_dscr BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_lenders_conventional ON lenders(has_conventional);
CREATE INDEX IF NOT EXISTS idx_lenders_fha ON lenders(has_fha);
CREATE INDEX IF NOT EXISTS idx_lenders_va ON lenders(has_va);
CREATE INDEX IF NOT EXISTS idx_lenders_jumbo ON lenders(has_jumbo);