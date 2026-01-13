-- Database Schema for Official EEE UofK Academic Management System

-- Create database
CREATE DATABASE IF NOT EXISTS eee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eee;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subjects table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resources table (lectures, sheets, assignments, exams, references)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Announcements table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity log table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Statistics table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin users
INSERT INTO admins (email, password, name) VALUES
('admin1@uofk.edu', '$2a$10$YourHashedPasswordHere1', 'Admin 1'),
('admin2@uofk.edu', '$2a$10$YourHashedPasswordHere2', 'Admin 2'),
('admin3@uofk.edu', '$2a$10$YourHashedPasswordHere3', 'Admin 3'),
('admin4@uofk.edu', '$2a$10$YourHashedPasswordHere4', 'Admin 4'),
('admin5@uofk.edu', '$2a$10$YourHashedPasswordHere5', 'Admin 5');

-- Insert Semester 1 subjects
INSERT INTO subjects (name_ar, name_en, code, semester) VALUES
('الحسبان I', 'Calculus I', 'EGS11101', 1),
('الجبر الخطي', 'Linear Algebra', 'EGS11102', 1),
('الفيزياء I', 'Physics I', 'EGS11203', 1),
('الكيمياء I', 'Chemistry I', 'EGS11304', 1),
('برمجة الحاسوب', 'Computer Programming', 'EGS12405', 1),
('اللغة العربية I', 'Arabic Language I', 'HUM11101', 1),
('الثقافة الإسلامية I', 'Islamic Culture I', 'HUM12302', 1);

-- Initialize statistics for each subject
INSERT INTO statistics (subject_id, total_lectures, total_sheets, total_assignments, total_exams, total_references, total_questions)
SELECT id, 0, 0, 0, 0, 0, 0 FROM subjects;
