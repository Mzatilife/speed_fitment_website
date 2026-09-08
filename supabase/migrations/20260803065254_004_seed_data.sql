/*
# SpeedFitment — Seed Data

Populates services, logistics, and parts with the business's initial catalog.
All inserts use ON CONFLICT DO NOTHING for idempotency.
*/

-- SERVICES
INSERT INTO public.services (name, description, price, price_label, category, features, image_url, is_active, sort_order) VALUES
  ('3D Computer Alignment', 'Precision wheel alignment using advanced 3D imaging technology for optimal handling and tire life.', 55000, 'From MWK 55,000', 'Alignment',
    ARRAY['3D Imaging Technology', 'Precision Adjustment', 'Tire Life Optimization', 'Steering Calibration'],
    '', true, 1),
  ('Car Diagnostics', 'Comprehensive computerized diagnostics to identify and resolve vehicle issues accurately.', 35000, 'From MWK 35,000', 'Diagnostics',
    ARRAY['Computer Diagnosis', 'Error Code Reading', 'System Scanning', 'Performance Analysis'],
    '', true, 2),
  ('Panel Beating & Spray Painting', 'Expert bodywork restoration including dent repairs, custom paint jobs, color matching, and rust treatment.', 0, 'Custom Quote', 'Bodywork',
    ARRAY['Dent Repairs', 'Custom Paint Jobs', 'Color Matching', 'Rust Treatment'],
    '', true, 3),
  ('Car Batteries', 'Quality car batteries supply, testing, and replacement for all vehicle types.', 0, 'From MWK 0.00', 'Electrical',
    ARRAY['Battery Testing', 'Premium Brands', 'Installation Included', 'Warranty Included'],
    '', true, 4),
  ('Car Alarms & Security', 'Professional car alarm installation and security system upgrades.', 32000, 'From MWK 32,000', 'Security',
    ARRAY['Alarm Installation', 'Immobilizer Systems', 'Remote Start', 'GPS Tracking'],
    '', true, 5)
ON CONFLICT DO NOTHING;

-- LOGISTICS
INSERT INTO public.logistics (name, description, price, unit, is_active, sort_order) VALUES
  ('Quarry Stone', 'High-quality quarry stone for construction and infrastructure projects.', 0, 'per load', true, 1),
  ('Quarry Dust', 'Fine quarry dust ideal for construction and landscaping.', 0, 'per load', true, 2),
  ('River Sand', 'Clean river sand for construction, plastering, and concrete mixing.', 0, 'per load', true, 3),
  ('Bricks', 'Quality construction bricks available in various specifications.', 135000, 'per load', true, 4)
ON CONFLICT DO NOTHING;

-- PARTS
INSERT INTO public.parts (name, description, category, price, stock_quantity, low_stock_threshold, sku, image_url, is_active, is_featured, is_new_arrival, is_best_seller, is_on_sale, tags, sort_order) VALUES
  ('Brake Pad Set — Premium', 'High-performance ceramic brake pads for superior stopping power and reduced dust.', 'Brake System', 45000, 32, 8, 'BRK-PAD-001',
    '',
    true, true, false, true, false, ARRAY['brake', 'pads', 'ceramic', 'safety'], 1),
  ('Brake Disc Rotors', 'Precision-engineered brake disc rotors for smooth, consistent braking performance.', 'Brake System', 78000, 18, 5, 'BRK-DSC-002',
    '',
    true, true, true, false, false, ARRAY['brake', 'rotors', 'disc'], 2),
  ('Suspension Shock Absorbers', 'Premium shock absorbers for improved ride comfort and handling stability.', 'Suspension', 95000, 12, 4, 'SUS-SHK-001',
    '',
    true, true, false, true, true, ARRAY['suspension', 'shocks', 'ride comfort'], 3),
  ('Coil Spring Set', 'Heavy-duty coil springs designed for durability and load-bearing capacity.', 'Suspension', 62000, 8, 3, 'SUS-SPR-002',
    '',
    true, false, true, false, false, ARRAY['suspension', 'springs'], 4),
  ('Performance Wheel Set', 'Lightweight alloy wheels for enhanced vehicle aesthetics and performance.', 'Wheels', 185000, 6, 2, 'WHL-SET-001',
    '',
    true, true, true, true, false, ARRAY['wheels', 'alloy', 'performance'], 5),
  ('Wheel Bearing Kit', 'Premium wheel bearing kits for smooth, quiet wheel rotation.', 'Suspension', 38000, 24, 6, 'WHL-BRG-001',
    '',
    true, false, false, false, true, ARRAY['wheel', 'bearing', 'suspension'], 6)
ON CONFLICT DO NOTHING;
