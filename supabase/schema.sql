-- TaskRabbit GE - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('customer', 'handyman', 'admin');
CREATE TYPE task_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE complexity_level AS ENUM ('simple', 'moderate', 'complex');

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  district TEXT,
  categories TEXT[] DEFAULT '{}',
  bio TEXT,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_ka TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🔧',
  base_price NUMERIC(10,2) NOT NULL DEFAULT 80,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  handyman_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  photo_url TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  complexity complexity_level NOT NULL DEFAULT 'simple',
  estimated_hours NUMERIC(4,1) DEFAULT 1,
  estimated_price NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tasker_payout NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID UNIQUE NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  handyman_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform settings (single row)
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commission_percent NUMERIC(5,2) NOT NULL DEFAULT 15,
  min_task_price NUMERIC(10,2) NOT NULL DEFAULT 30,
  max_task_price NUMERIC(10,2) NOT NULL DEFAULT 5000,
  currency TEXT NOT NULL DEFAULT 'GEL',
  platform_name TEXT NOT NULL DEFAULT 'TaskRabbit GE',
  support_email TEXT DEFAULT 'support@taskrabbit.ge',
  support_phone TEXT DEFAULT '+995 555 123 456',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_customer ON tasks(customer_id);
CREATE INDEX idx_tasks_handyman ON tasks(handyman_id);
CREATE INDEX idx_tasks_district ON tasks(district);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_reviews_handyman ON reviews(handyman_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update handyman rating after review
CREATE OR REPLACE FUNCTION update_handyman_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET
    rating_avg = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE handyman_id = NEW.handyman_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE handyman_id = NEW.handyman_id)
  WHERE id = NEW.handyman_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_handyman_rating();

-- Seed default categories
INSERT INTO categories (slug, name_ka, name_en, icon, base_price, sort_order) VALUES
  ('plumbing', 'სანტექნიკა', 'Plumbing', '🔧', 80, 1),
  ('ac-installation', 'კონდიციონერის დაყენება', 'AC Installation', '❄️', 150, 2),
  ('tv-mounting', 'ტელევიზორის მონტაჟი', 'TV Mounting', '📺', 60, 3),
  ('electrical', 'ელექტრიკა', 'Electrical', '⚡', 90, 4),
  ('painting', 'მოხატვა', 'Painting', '🎨', 100, 5),
  ('cleaning', 'დასუფთავება', 'Cleaning', '🧹', 70, 6),
  ('furniture', 'ავეჯის შეკრება', 'Furniture Assembly', '🪑', 85, 7),
  ('moving', 'გადაზიდვა', 'Moving Help', '📦', 120, 8);

-- Seed platform settings
INSERT INTO platform_settings (commission_percent, min_task_price, max_task_price)
VALUES (15, 30, 5000);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tasks policies
CREATE POLICY "Customers can create tasks"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can view relevant tasks"
  ON tasks FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR handyman_id = auth.uid()
    OR (status = 'pending' AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'handyman'
    ))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Task participants can update"
  ON tasks FOR UPDATE TO authenticated
  USING (
    customer_id = auth.uid()
    OR handyman_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by authenticated users"
  ON reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Customers can create reviews for their completed tasks"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- Platform settings policies
CREATE POLICY "Settings viewable by authenticated users"
  ON platform_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update settings"
  ON platform_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage bucket for task photos
INSERT INTO storage.buckets (id, name, public) VALUES ('task-photos', 'task-photos', true);

CREATE POLICY "Authenticated users can upload task photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-photos');

CREATE POLICY "Task photos are publicly viewable"
  ON storage.objects FOR SELECT USING (bucket_id = 'task-photos');

-- Enable realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
