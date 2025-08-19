-- =============== USERS TABLE ===============
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password TEXT NOT NULL,
    auth_type VARCHAR(50) NOT NULL,
    google_uid VARCHAR(255),
    firebase_uid VARCHAR(255),
    profile_image TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_blocked BOOLEAN,
    role VARCHAR(50)
);

-- =============== ADMINS TABLE ===============
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50)
);

-- =============== CHAT HISTORY TABLE ===============
CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    document_id INTEGER,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP
);

-- =============== CHUNK EMBEDDINGS TABLE ===============
CREATE TABLE chunk_embeddings (
    chunk_id BIGINT PRIMARY KEY,
    embedding USER-DEFINED NOT NULL
);

-- =============== CHUNK VECTORS TABLE ===============
CREATE TABLE chunk_vectors (
    id SERIAL PRIMARY KEY,
    chunk_id INTEGER,
    embedding USER-DEFINED,
    created_at TIMESTAMP,
    file_id UUID
);

-- =============== CHUNK VECTORS BACKUP TABLE ===============
CREATE TABLE chunk_vectors_backup (
    id SERIAL,
    chunk_id INTEGER,
    embedding USER-DEFINED,
    created_at TIMESTAMP,
    file_id INTEGER
);

-- =============== DOC CHUNKS TABLE ===============
CREATE TABLE doc_chunks (
    id BIGINT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- =============== DRAFTS TABLE ===============
CREATE TABLE drafts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title TEXT,
    content TEXT,
    template_used TEXT,
    gcs_path TEXT,
    created_at TIMESTAMP
);

-- =============== FILE CHATS TABLE ===============
CREATE TABLE file_chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    question TEXT,
    answer TEXT,
    used_chunk_ids TEXT[], -- ARRAY type
    created_at TIMESTAMP,
    session_id UUID,
    file_id UUID
);

-- =============== FILE CHUNKS TABLE ===============
CREATE TABLE file_chunks (
    id SERIAL PRIMARY KEY,
    chunk_index INTEGER,
    content TEXT,
    token_count INTEGER,
    created_at TIMESTAMP,
    file_id UUID
);

-- =============== PAYMENTS TABLE ===============
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    subscription_id INTEGER,
    razorpay_payment_id VARCHAR(255) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    amount NUMERIC NOT NULL,
    currency VARCHAR(3),
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
);

-- =============== PROCESSING JOBS TABLE ===============
CREATE TABLE processing_jobs (
    id SERIAL PRIMARY KEY,
    job_id TEXT,
    status TEXT,
    error_message TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    file_id_uuid UUID,
    file_id UUID
);

-- =============== SUBSCRIPTION PLANS TABLE ===============
CREATE TYPE plan_interval AS ENUM ('month', 'year');
CREATE TYPE plan_type AS ENUM ('individual', 'business');

<!-- CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    interval plan_interval NOT NULL,
    type plan_type NOT NULL,
    features TEXT[],
    limits JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
); -->
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) CHECK (price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    "interval" plan_interval NOT NULL,
    type plan_type NOT NULL,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    limits JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name, type, "interval")
);


-- =============== TEMPLATES TABLE ===============
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    type VARCHAR(100),
    status VARCHAR(50),
    gcs_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- =============== TOKEN USAGE LOGS TABLE ===============
CREATE TABLE token_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tokens_used INTEGER NOT NULL,
    action_description TEXT,
    used_at TIMESTAMP WITH TIME ZONE
);

-- =============== USER DRAFTS TABLE ===============
CREATE TABLE user_drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    template_id INTEGER,
    name VARCHAR(255) NOT NULL,
    gcs_path TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- =============== USER FILES TABLE ===============
CREATE TABLE user_files (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL,
    originalname TEXT NOT NULL,
    gcs_path TEXT NOT NULL,
    folder_path TEXT,
    mimetype TEXT,
    size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    is_folder BOOLEAN,
    edited_docx_path TEXT,
    edited_pdf_path TEXT,
    html_content TEXT,
    status TEXT,
    processed_at TIMESTAMP,
    processing_progress NUMERIC,
    updated_at TIMESTAMP,
    full_text_content TEXT
);

-- =============== USER SESSIONS TABLE ===============
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    login_time TIMESTAMP WITH TIME ZONE,
    logout_time TIMESTAMP WITH TIME ZONE,
    token TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);

-- =============== USER SUBSCRIPTIONS TABLE ===============
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    razorpay_subscription_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    current_token_balance INTEGER NOT NULL,
    last_reset_date DATE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- =============== USER TEMPLATE USAGE TABLE ===============
CREATE TABLE user_template_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);
