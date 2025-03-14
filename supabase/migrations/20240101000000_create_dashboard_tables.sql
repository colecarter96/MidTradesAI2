-- Create daily_advice table
CREATE TABLE daily_advice (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    advice TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, DATE(created_at))
);

-- Create positions table
CREATE TABLE positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    quantity DECIMAL(18,8) NOT NULL,
    entry_price DECIMAL(18,2) NOT NULL,
    current_price DECIMAL(18,2) NOT NULL,
    change_percentage DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create portfolio_history table
CREATE TABLE portfolio_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_value DECIMAL(18,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, date)
);

-- Create RLS policies
ALTER TABLE daily_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_history ENABLE ROW LEVEL SECURITY;

-- Policies for daily_advice
CREATE POLICY "Users can view their own advice"
    ON daily_advice FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create advice"
    ON daily_advice FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for positions
CREATE POLICY "Users can view their own positions"
    ON positions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own positions"
    ON positions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions"
    ON positions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own positions"
    ON positions FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for portfolio_history
CREATE POLICY "Users can view their own portfolio history"
    ON portfolio_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create portfolio history"
    ON portfolio_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to update positions current price
CREATE OR REPLACE FUNCTION update_position_prices()
RETURNS trigger AS $$
BEGIN
    -- Here we'll add logic to fetch current price from external API
    -- For now, we'll just calculate a dummy change percentage
    NEW.change_percentage := ((NEW.current_price - NEW.entry_price) / NEW.entry_price) * 100;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for positions
CREATE TRIGGER update_position_prices_trigger
    BEFORE INSERT OR UPDATE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION update_position_prices();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for positions updated_at
CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 