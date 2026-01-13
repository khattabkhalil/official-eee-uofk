const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    console.log('🚀 Starting database setup...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'eee_admin',
        password: process.env.DB_PASSWORD || 'eee_password',
        multipleStatements: true
    });

    try {
        // Create database
        console.log('📦 Creating database...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'eee'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.query(`USE ${process.env.DB_NAME || 'eee'}`);

        // Create tables
        console.log('📋 Creating tables...');

        // Admins table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Subjects table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name_ar VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        description_ar TEXT,
        description_en TEXT,
        semester INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_semester (semester)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Resources table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject_id INT NOT NULL,
        type ENUM('lecture', 'sheet', 'assignment', 'exam', 'reference', 'important_question') NOT NULL,
        title_ar VARCHAR(255) NOT NULL,
        title_en VARCHAR(255) NOT NULL,
        description_ar TEXT,
        description_en TEXT,
        file_path VARCHAR(500),
        file_url VARCHAR(500),
        file_size BIGINT,
        file_type VARCHAR(100),
        source VARCHAR(255),
        added_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (added_by) REFERENCES admins(id) ON DELETE SET NULL,
        INDEX idx_subject_type (subject_id, type),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Announcements table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title_ar VARCHAR(255) NOT NULL,
        title_en VARCHAR(255) NOT NULL,
        content_ar TEXT NOT NULL,
        content_en TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        type ENUM('exam', 'submission', 'schedule', 'general') DEFAULT 'general',
        is_active BOOLEAN DEFAULT TRUE,
        added_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (added_by) REFERENCES admins(id) ON DELETE SET NULL,
        INDEX idx_priority (priority),
        INDEX idx_active (is_active),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Questions table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject_id INT,
        topic_ar VARCHAR(255),
        topic_en VARCHAR(255),
        question_text_ar TEXT NOT NULL,
        question_text_en TEXT NOT NULL,
        answer_text_ar TEXT,
        answer_text_en TEXT,
        image_path VARCHAR(500),
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        added_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
        FOREIGN KEY (added_by) REFERENCES admins(id) ON DELETE SET NULL,
        INDEX idx_subject (subject_id),
        INDEX idx_difficulty (difficulty)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Activity log table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id INT,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100),
        entity_id INT,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
        INDEX idx_admin (admin_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Statistics table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS statistics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject_id INT,
        total_lectures INT DEFAULT 0,
        total_sheets INT DEFAULT 0,
        total_assignments INT DEFAULT 0,
        total_exams INT DEFAULT 0,
        total_references INT DEFAULT 0,
        total_questions INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_subject (subject_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        // Insert admin users
        console.log('👤 Creating admin users...');
        const adminPasswords = [
            { email: 'admin1@uofk.edu', password: 'adminpass1', name: 'Admin 1' },
            { email: 'admin2@uofk.edu', password: 'adminpass2', name: 'Admin 2' },
            { email: 'admin3@uofk.edu', password: 'adminpass3', name: 'Admin 3' },
            { email: 'admin4@uofk.edu', password: 'adminpass4', name: 'Admin 4' },
            { email: 'admin5@uofk.edu', password: 'adminpass5', name: 'Admin 5' }
        ];

        for (const admin of adminPasswords) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            await connection.query(
                'INSERT IGNORE INTO admins (email, password, name) VALUES (?, ?, ?)',
                [admin.email, hashedPassword, admin.name]
            );
        }

        // Insert subjects
        console.log('📚 Creating subjects...');
        const subjects = [
            { name_ar: 'الحسبان I', name_en: 'Calculus I', code: 'EGS11101' },
            { name_ar: 'الجبر الخطي', name_en: 'Linear Algebra', code: 'EGS11102' },
            { name_ar: 'الفيزياء I', name_en: 'Physics I', code: 'EGS11203' },
            { name_ar: 'الكيمياء I', name_en: 'Chemistry I', code: 'EGS11304' },
            { name_ar: 'برمجة الحاسوب', name_en: 'Computer Programming', code: 'EGS12405' },
            { name_ar: 'اللغة العربية I', name_en: 'Arabic Language I', code: 'HUM11101' },
            { name_ar: 'الثقافة الإسلامية I', name_en: 'Islamic Culture I', code: 'HUM12302' }
        ];

        for (const subject of subjects) {
            await connection.query(
                'INSERT IGNORE INTO subjects (name_ar, name_en, code, semester) VALUES (?, ?, ?, 1)',
                [subject.name_ar, subject.name_en, subject.code]
            );
        }

        // Initialize statistics
        console.log('📊 Initializing statistics...');
        await connection.query(`
      INSERT IGNORE INTO statistics (subject_id, total_lectures, total_sheets, total_assignments, total_exams, total_references, total_questions)
      SELECT id, 0, 0, 0, 0, 0, 0 FROM subjects
    `);

        console.log('✅ Database setup completed successfully!');
        console.log('\n📝 Admin credentials:');
        adminPasswords.forEach(admin => {
            console.log(`   ${admin.email} / ${admin.password}`);
        });

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run if called directly
if (require.main === module) {
    require('dotenv').config({ path: '.env.local' });
    setupDatabase().catch(console.error);
}

module.exports = setupDatabase;
