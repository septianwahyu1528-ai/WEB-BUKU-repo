-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS purchase_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============ USERS TABLE ============
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'pelanggan' CHECK (role IN ('admin', 'pelanggan')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ BOOKS TABLE ============
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    image VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    description TEXT,
    isbn VARCHAR(50) UNIQUE,
    publisher VARCHAR(255),
    publication_date DATE,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ CUSTOMERS TABLE ============
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_purchase DECIMAL(12, 2) DEFAULT 0 CHECK (total_purchase >= 0),
    total_orders INTEGER DEFAULT 0 CHECK (total_orders >= 0),
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ ORDERS TABLE ============
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    payment_method VARCHAR(50),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ ORDER ITEMS TABLE ============
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ PURCHASE HISTORY TABLE ============
CREATE TABLE purchase_history (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    total DECIMAL(12, 2) NOT NULL CHECK (total > 0),
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL
);

-- ============ INDEXES ============
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_city ON customers(city);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_book_id ON order_items(book_id);
CREATE INDEX idx_purchase_history_customer_id ON purchase_history(customer_id);
CREATE INDEX idx_purchase_history_book_id ON purchase_history(book_id);

-- ============ INSERT SAMPLE DATA - USERS ============
INSERT INTO users (email, password, name, role) VALUES
('admin@tokobuku.com', 'admin123', 'Admin Toko', 'admin'),
('pelanggan1@toko.buku.com', 'pelanggan123', 'Ahmad Rizki', 'pelanggan'),
('pelanggan2@toko.buku.com', 'pelanggan123', 'Siti Nurhaliza', 'pelanggan'),
('pelanggan3@toko.buku.com', 'pelanggan123', 'Budi Santoso', 'pelanggan');

-- ============ INSERT SAMPLE DATA - BOOKS ============
INSERT INTO books (title, author, price, image, rating, stock, description, isbn, publisher, publication_date, category) VALUES
('Laskar Pelangi', 'Andrea Hirata', 85000.00, 'laskar-pelangi.svg', 4.8, 50, 'Cerita inspiratif tentang perjuangan siswa di sebuah sekolah terpencil', '978-979-8927-51-7', 'Bentang Pustaka', '2005-09-26', 'Fiksi'),
('Bumi', 'Tere Liye', 79000.00, 'bumi.svg', 4.7, 45, 'Petualangan dua anak yang menemukan kekuatan bumi', '978-602-8518-09-8', 'Gramedia Pustaka Utama', '2007-07-16', 'Fiksi'),
('Ayah', 'Guus Dur', 75000.00, 'ayah.svg', 4.9, 60, 'Refleksi mendalam tentang hubungan ayah dan anak', '978-979-1476-36-4', 'Gramedia Pustaka Utama', '2010-06-15', 'Biografi'),
('Aku dan Dilan', 'Pidi Baiq', 85000.00, 'aku-dilan.svg', 4.6, 40, 'Kisah cinta di era 1990an yang menyentuh hati', '978-602-59438-2-0', 'Pastel Books', '2014-09-01', 'Fiksi Remaja'),
('Laut Bercerita', 'Leila S. Chudori', 95000.00, 'laut-bercerita.svg', 4.5, 35, 'Novel tentang sejarah Indonesia yang penuh emosi', '978-602-291-396-0', 'Kepustakaan Populer Gramedia', '2017-08-09', 'Fiksi Sejarah'),
('Filosofi Teras', 'Henry Manampiring', 65000.00, 'filosofi-teras.svg', 4.7, 70, 'Mengajarkan cara hidup sederhana dari filosofi Stoa', '978-602-347-968-5', 'Kompas', '2018-03-12', 'Filosofi'),
('Negeri 5 Menara', 'A. Fuadi', 95000.00, 'negeri-5-menara.svg', 4.8, 55, 'Perjalanan spiritual dan pendidikan di pesantren Timur Tengah', '978-979-1521-29-5', 'Gramedia Pustaka Utama', '2010-08-15', 'Fiksi'),
('Hujan', 'Tere Liye', 88000.00, 'hujan.svg', 4.6, 48, 'Misteri dan petualangan dalam kehidupan yang penuh rahasia', '978-602-405-032-2', 'Gramedia Pustaka Utama', '2012-05-20', 'Fiksi'),
('Biang Kerok', 'Tere Liye', 92000.00, 'biang-kerok.svg', 4.5, 38, 'Investigasi misterius yang mengubah hidup tokoh utama', '978-602-405-032-3', 'Gramedia Pustaka Utama', '2013-09-10', 'Fiksi'),
('Para Priyayi', 'Upamanyu Chatterjee', 78000.00, 'para-priyayi.svg', 4.4, 42, 'Satire sosial tentang kehidupan kelas menengah', '978-979-616-654-7', 'Gramedia Pustaka Utama', '2006-01-15', 'Fiksi');

-- ============ INSERT SAMPLE DATA - CUSTOMERS ============
INSERT INTO customers (name, email, phone, address, city, postal_code, country, total_purchase, total_orders) VALUES
('Ahmad Rizki', 'ahmad@email.com', '081234567890', 'Jl. Merdeka No. 123', 'Jakarta', '12345', 'Indonesia', 2500000, 5),
('Siti Nurhaliza', 'siti@email.com', '082987654321', 'Jl. Sudirman No. 456', 'Bandung', '40123', 'Indonesia', 1800000, 4),
('Budi Santoso', 'budi@email.com', '083456789012', 'Jl. Gatot Subroto No. 789', 'Surabaya', '60111', 'Indonesia', 3200000, 7),
('Rina Wijaya', 'rina@email.com', '084567890123', 'Jl. Ahmad Yani No. 321', 'Medan', '20111', 'Indonesia', 950000, 2),
('Hendra Kusuma', 'hendra@email.com', '085678901234', 'Jl. Diponegoro No. 654', 'Yogyakarta', '55111', 'Indonesia', 1200000, 3);

-- ============ INSERT SAMPLE DATA - ORDERS ============
-- Reset sequence untuk memastikan order IDs dimulai dari 1
ALTER SEQUENCE orders_id_seq RESTART WITH 1;

INSERT INTO orders (customer_id, total_amount, status, payment_method) VALUES
(1, 170000, 'delivered', 'transfer'),
(1, 240000, 'delivered', 'transfer'),
(2, 175000, 'delivered', 'credit_card'),
(3, 258000, 'delivered', 'transfer'),
(3, 265000, 'confirmed', 'credit_card'),
(4, 165000, 'pending', 'transfer'),
(5, 160000, 'delivered', 'transfer');

-- ============ INSERT SAMPLE DATA - ORDER ITEMS ============
INSERT INTO order_items (order_id, book_id, quantity, unit_price, subtotal) VALUES
(1, 1, 2, 85000, 170000),
(2, 2, 3, 79000, 237000),
(3, 3, 1, 75000, 75000),
(3, 4, 1, 85000, 85000),
(4, 5, 2, 95000, 190000),
(4, 6, 1, 65000, 65000),
(5, 7, 2, 95000, 190000),
(5, 1, 1, 85000, 85000),
(6, 8, 1, 88000, 88000),
(6, 2, 1, 79000, 79000),
(7, 9, 1, 92000, 92000),
(7, 10, 1, 78000, 78000);

-- ============ INSERT SAMPLE DATA - PURCHASE HISTORY ============
INSERT INTO purchase_history (customer_id, book_id, quantity, price, total, order_id) VALUES
(1, 1, 2, 85000, 170000, 1),
(1, 2, 3, 79000, 237000, 2),
(2, 3, 1, 75000, 75000, 3),
(2, 4, 1, 85000, 85000, 3),
(3, 5, 2, 95000, 190000, 4),
(3, 6, 1, 65000, 65000, 4),
(3, 7, 2, 95000, 190000, 5),
(3, 1, 1, 85000, 85000, 5),
(4, 8, 1, 88000, 88000, 6),
(4, 2, 1, 79000, 79000, 6),
(5, 9, 1, 92000, 92000, 7),
(5, 10, 1, 78000, 78000, 7);
