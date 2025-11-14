-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 14, 2025 at 03:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gudnet`
--

-- --------------------------------------------------------

--
-- Table structure for table `agency_subscription_plans`
--

CREATE TABLE `agency_subscription_plans` (
  `id` int(11) NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `candidate_posting` varchar(50) DEFAULT NULL,
  `candidate_contact` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agency_subscription_plans`
--

INSERT INTO `agency_subscription_plans` (`id`, `plan_name`, `candidate_posting`, `candidate_contact`, `created_at`, `updated_at`) VALUES
(1, '30 Days Plan', 'Candidate Posting - 800 AED | 200 USD', 'Candidate Contact - 900 AED | 300 USD', '2025-09-05 18:02:39', '2025-09-05 18:02:39'),
(2, '60 Days Plan', 'Candidate Posting - 1200 AED | 300 USD', 'Candidate Contact - 1600 AED | 400 USD', '2025-09-05 18:02:43', '2025-10-17 08:05:58'),
(3, '90 Days Plan', 'Candidate Posting - 1600 AED | 400 USD', 'Candidate Contact - 2000 AED | 500 USD', '2025-09-05 18:02:48', '2025-10-17 08:06:11');

-- --------------------------------------------------------

--
-- Table structure for table `agency_user`
--

CREATE TABLE `agency_user` (
  `id` int(11) NOT NULL,
  `role` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `agency_name` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `full_address` text DEFAULT NULL,
  `whatsapp_number_1` varchar(20) DEFAULT NULL,
  `whatsapp_number_2` varchar(20) DEFAULT NULL,
  `whatsapp_number_3` varchar(20) DEFAULT NULL,
  `whatsapp_number_4` varchar(20) DEFAULT NULL,
  `official_phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `company_logo` varchar(255) DEFAULT NULL,
  `business_card` varchar(255) DEFAULT NULL,
  `license_copy` varchar(255) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `owner_nationality` varchar(100) DEFAULT NULL,
  `owner_photo` varchar(255) DEFAULT NULL,
  `owner_mobile` varchar(20) DEFAULT NULL,
  `owner_email` varchar(255) DEFAULT NULL,
  `manager_name` varchar(255) DEFAULT NULL,
  `manager_nationality` varchar(100) DEFAULT NULL,
  `manager_photo` varchar(255) DEFAULT NULL,
  `manager_mobile` varchar(20) DEFAULT NULL,
  `manager_email` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login_date` datetime DEFAULT NULL,
  `last_notification_sent` datetime DEFAULT NULL,
  `subscription_plan_id` int(11) DEFAULT NULL,
  `subscription` varchar(50) DEFAULT NULL,
  `plan_name` varchar(50) DEFAULT NULL,
  `plan_days` varchar(20) DEFAULT NULL,
  `plan_startdate` datetime DEFAULT NULL,
  `plan_enddate` datetime DEFAULT NULL,
  `payment_amount` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `candidate_subscription_plan_id` int(11) DEFAULT NULL,
  `candidate_subscription` varchar(100) DEFAULT NULL,
  `candidate_plan_name` varchar(100) DEFAULT NULL,
  `candidate_plan_days` int(11) DEFAULT NULL,
  `candidate_plan_startdate` datetime DEFAULT NULL,
  `candidate_plan_enddate` datetime DEFAULT NULL,
  `candidate_payment_status` varchar(50) DEFAULT NULL,
  `candidate_payment_amount` decimal(10,2) DEFAULT NULL,
  `candidate_posting` tinyint(1) DEFAULT 0,
  `candidate_contact` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agency_user`
--

INSERT INTO `agency_user` (`id`, `role`, `password`, `agency_name`, `city`, `province`, `country`, `full_address`, `whatsapp_number_1`, `whatsapp_number_2`, `whatsapp_number_3`, `whatsapp_number_4`, `official_phone`, `email`, `website_url`, `company_logo`, `business_card`, `license_copy`, `owner_name`, `owner_nationality`, `owner_photo`, `owner_mobile`, `owner_email`, `manager_name`, `manager_nationality`, `manager_photo`, `manager_mobile`, `manager_email`, `created_at`, `updated_at`, `last_login_date`, `last_notification_sent`, `subscription_plan_id`, `subscription`, `plan_name`, `plan_days`, `plan_startdate`, `plan_enddate`, `payment_amount`, `payment_status`, `candidate_subscription_plan_id`, `candidate_subscription`, `candidate_plan_name`, `candidate_plan_days`, `candidate_plan_startdate`, `candidate_plan_enddate`, `candidate_payment_status`, `candidate_payment_amount`, `candidate_posting`, `candidate_contact`) VALUES
(3, 'agency', 'agency@123', 'IIIQ Agency', 'New York', 'New York', 'India', '5-53, sircilla\r\n', '9381850288', '9381850280', '9381850281', '9381850282', '9874563215', 'saikrushnakadarla99@gmail.com', 'https://www.iiiqbets.com', 'uploads\\1755071310898.png', 'uploads\\1755071310899.png', 'uploads\\1755071310902.png', 'sai', 'india', 'uploads\\1755071310903.png', '9874563218', 'sai@gmail.com', 'ramakrishna', 'india', 'uploads\\1755071310904.png', '9856271632', 'ram@gmail.com', '2025-08-13 13:18:30', '2025-11-14 17:44:42', '2025-11-14 17:44:42', NULL, 2, 'cost', 'Silver', '15', '2025-10-14 00:00:00', '2025-10-29 00:00:00', '200', 'Paid', 1, 'cost', '30 Days Plan', 30, '2025-10-11 00:00:00', '2025-11-10 00:00:00', 'Paid', 600.00, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `candidate_report`
--

CREATE TABLE `candidate_report` (
  `id` int(11) NOT NULL,
  `emp_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `candidate_id` int(11) NOT NULL,
  `candidate_name` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `candidate_report`
--

INSERT INTO `candidate_report` (`id`, `emp_id`, `first_name`, `candidate_id`, `candidate_name`, `email`, `reason`, `description`, `created_at`) VALUES
(1, 2, 'Saikrishna', 4, 'sai', 'saikrushnakadarla01@gmail.com', 'Other', 'he is a fake candidate', '2025-10-04 11:32:44'),
(10, 3, 'Anonymous', 3, 'Saikrishna', 'saikrushnakadarla99@gmail.com', 'Fraudulent', 'gfbfg thhetthet', '2025-10-06 14:39:34'),
(11, 2, 'Saikrishna', 7, 'pavani', 'saikrushnakadarla01@gmail.com', 'Fraudulent', 'he is fake', '2025-10-12 08:40:09'),
(12, 2, 'Saikrishna', 3, 'Default', 'saikrushnakadarla01@gmail.com', 'Fraudulent', 'he is fake candidate', '2025-11-01 07:45:49');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_profile`
--

CREATE TABLE `doctor_profile` (
  `dtr_id` int(11) NOT NULL,
  `dtr_user_id` int(11) NOT NULL,
  `dtr_user_name` varchar(255) NOT NULL,
  `dtr_preferred_country` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_preferred_country`)),
  `dtr_language_skilled` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_language_skilled`)),
  `dtr_country_doctor_license` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_country_doctor_license`)),
  `dtr_driving_license_country` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_driving_license_country`)),
  `dtr_medical_job_position` varchar(255) DEFAULT NULL,
  `dtr_surgical_job_position` varchar(255) DEFAULT NULL,
  `dtr_other_medical_job_position` varchar(255) DEFAULT NULL,
  `dtr_academic_job_position` varchar(255) DEFAULT NULL,
  `dtr_preferred_job_location` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_preferred_job_location`)),
  `dtr_min_monthly_sal` decimal(10,2) DEFAULT NULL,
  `dtr_max_monthly_sal` decimal(10,2) DEFAULT NULL,
  `dtr_country_currency` varchar(3) DEFAULT NULL,
  `dtr_negotiable` tinyint(1) DEFAULT NULL,
  `dtr_job_start_date` date DEFAULT NULL,
  `dtr_job_position_for_applying` varchar(255) DEFAULT NULL,
  `dtr_day_off_preference` varchar(255) DEFAULT NULL,
  `dtr_accommodation_preference` varchar(255) DEFAULT NULL,
  `dtr_internship_clinical_experience` int(11) DEFAULT NULL,
  `dtr_graduation_clinical_experience` int(11) DEFAULT NULL,
  `dtr_years_of_experience_doctor` int(11) DEFAULT NULL,
  `dtr_linkedin_profile` varchar(500) DEFAULT NULL,
  `dtr_currently_working_hospital_name` varchar(255) DEFAULT NULL,
  `dtr_hospital_country` varchar(100) DEFAULT NULL,
  `dtr_work_start_date` date DEFAULT NULL,
  `dtr_work_end_date` date DEFAULT NULL,
  `dtr_current_country` varchar(50) DEFAULT NULL,
  `dtr_previous_hospital_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_previous_hospital_details`)),
  `dtr_administrative_leadership_job_position` varchar(255) DEFAULT NULL,
  `dtr_before_worked_country` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_before_worked_country`)),
  `dtr_certificate_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_certificate_options`)),
  `dtr_valid_passport` tinyint(1) DEFAULT NULL,
  `dtr_ug_qualification` varchar(255) DEFAULT NULL,
  `dtr_pg_qualification` varchar(255) DEFAULT NULL,
  `dtr_specialty_qualifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_specialty_qualifications`)),
  `dtr_super_spl_qualifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dtr_super_spl_qualifications`)),
  `dtr_fellowship_qualifications` varchar(255) DEFAULT NULL,
  `dtr_other_qualifications` varchar(255) DEFAULT NULL,
  `dtr_english_lang_qualifications` varchar(255) DEFAULT NULL,
  `dtr_other_language_qualifications` varchar(255) DEFAULT NULL,
  `dtr_language_proficiency` varchar(255) DEFAULT NULL,
  `dtr_cultural_qualifications` varchar(255) DEFAULT NULL,
  `dtr_prometric_certificate` tinyint(1) DEFAULT NULL,
  `dtr_prometric_issued_country` varchar(100) DEFAULT NULL,
  `dtr_data_flow_certificate` tinyint(1) DEFAULT NULL,
  `dtr_data_flow_issued_by_country` varchar(100) DEFAULT NULL,
  `dtr_resume_description` text DEFAULT NULL,
  `dtr_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `dtr_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_profile`
--

INSERT INTO `doctor_profile` (`dtr_id`, `dtr_user_id`, `dtr_user_name`, `dtr_preferred_country`, `dtr_language_skilled`, `dtr_country_doctor_license`, `dtr_driving_license_country`, `dtr_medical_job_position`, `dtr_surgical_job_position`, `dtr_other_medical_job_position`, `dtr_academic_job_position`, `dtr_preferred_job_location`, `dtr_min_monthly_sal`, `dtr_max_monthly_sal`, `dtr_country_currency`, `dtr_negotiable`, `dtr_job_start_date`, `dtr_job_position_for_applying`, `dtr_day_off_preference`, `dtr_accommodation_preference`, `dtr_internship_clinical_experience`, `dtr_graduation_clinical_experience`, `dtr_years_of_experience_doctor`, `dtr_linkedin_profile`, `dtr_currently_working_hospital_name`, `dtr_hospital_country`, `dtr_work_start_date`, `dtr_work_end_date`, `dtr_current_country`, `dtr_previous_hospital_details`, `dtr_administrative_leadership_job_position`, `dtr_before_worked_country`, `dtr_certificate_options`, `dtr_valid_passport`, `dtr_ug_qualification`, `dtr_pg_qualification`, `dtr_specialty_qualifications`, `dtr_super_spl_qualifications`, `dtr_fellowship_qualifications`, `dtr_other_qualifications`, `dtr_english_lang_qualifications`, `dtr_other_language_qualifications`, `dtr_language_proficiency`, `dtr_cultural_qualifications`, `dtr_prometric_certificate`, `dtr_prometric_issued_country`, `dtr_data_flow_certificate`, `dtr_data_flow_issued_by_country`, `dtr_resume_description`, `dtr_created_at`, `dtr_updated_at`) VALUES
(5, 3, 'Saikrishna', '[\"Dubai\"]', '[\"English\"]', '[{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-22\",\"license_expiry_date\":\"2025-09-19\"},{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-22\",\"license_expiry_date\":\"2025-09-19\"},{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-22\",\"license_expiry_date\":\"2025-09-19\"}]', '[\"Qatar\"]', 'Doctor ', 'General Surgeon', 'General Practitioner', 'Medical Educator', '[\"India\"]', 20000.00, 50000.00, 'USD', 0, '2025-08-15', 'Specialist Doctor', 'Sunday', 'Live in', 2, 2, 2, 'https://www.linkedin.com/in/your-name-12345/', 'SR Hospital', 'India', '2025-07-24', '2025-08-14', 'India', '[{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"india\",\"work_start_date\":\"2023-08-22\",\"work_end_date\":\"2025-07-22\"}]', 'Medical Director', '[\"DELF\"]', '[\"Yes\"]', 1, 'MBBS', 'MS', '[\"Cardiology\"]', '[\"Cardiothoracic Surgery\"]', 'FRCP', '', 'TOEFL', 'DELF', 'Elementary language skills', 'Cultural Competence in Healthcare', 1, 'India', 1, 'India', 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)', '2025-08-22 09:48:28', '2025-11-06 11:06:41'),
(6, 4, 'sai', '[\"Qatar\"]', '[\"English\"]', '[{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-05\",\"license_expiry_date\":\"2030-08-23\"},{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-05\",\"license_expiry_date\":\"2030-08-23\"}]', '[\"Qatar\"]', 'Doctor ', 'Cardiothoracic Surgeon', 'Medical Geneticist', 'Professor of Medicine', '[\"India\"]', 20000.00, 50000.00, 'USD', 1, '2025-08-21', 'Specialist Doctor', 'Sunday', 'Live in', 2, 2, 2, '', 'SR Hospital', 'India', '2025-07-25', '2025-08-16', 'India', '[{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"india\",\"work_start_date\":\"2023-08-23\",\"work_end_date\":\"2024-08-23\"},{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"India\",\"work_start_date\":\"2024-08-24\",\"work_end_date\":\"2025-08-01\"}]', 'Medical Director', '[\"DELF\"]', '[\"No\"]', 1, 'MBBS', 'MS', '[\"Cardiology\"]', '[\"Cardiothoracic Surgery\"]', 'FRCP', '', 'TOEFL', 'DELF', 'Advanced language skills', 'Cultural Competence in Healthcare', 1, 'India', 1, 'India', NULL, '2025-08-23 05:05:46', '2025-10-10 05:44:09'),
(7, 5, '', '[\"Qatar\"]', '[\"English\"]', '[{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-23\",\"license_expiry_date\":\"2029-04-23\"},{\"country_name\":\"India\",\"license_issue_date\":\"2025-08-23\",\"license_expiry_date\":\"2029-04-23\"}]', '[\"Qatar\"]', 'Doctor ', 'Cardiothoracic Surgeon', 'General Practitioner', 'Research Scientist', '[\"India\"]', 20000.00, 50000.00, 'USD', 0, '2025-08-30', 'Gastroenterologist', 'Sunday', 'Live in', 3, 3, 3, '', 'Indian Hospital', 'India', '2025-08-19', '2025-08-19', '', '[{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"India\",\"work_start_date\":\"2025-08-23\",\"work_end_date\":\"2025-08-29\"}]', 'Medical Director', '[\"DELF\"]', '[\"Yes\"]', 1, 'MBBS', 'MS', '[\"Cardiology\"]', '[\"Cardiothoracic Surgery\"]', 'FRCP', '', 'TOEFL', 'DELF', 'Proficient language skills', 'Cultural Competence in Healthcare', 1, 'India', 1, 'India', NULL, '2025-08-23 10:47:03', '2025-08-30 05:08:37'),
(8, 8, 'ramu', '[\"Qatar\"]', '[\"English\"]', '[{\"country_name\":\"Qatar\",\"license_issue_date\":\"2023-02-23\",\"license_expiry_date\":\"2028-10-12\"},{\"country_name\":\"India\",\"license_issue_date\":\"2023-02-23\",\"license_expiry_date\":\"2028-10-12\"}]', '[\"Qatar\"]', 'Anesthesiologist', 'General Surgeon', 'Pain Management Specialist', 'Medical Educator', '[\"India\"]', 50000.00, 100000.00, 'USD', 1, '2025-09-11', 'Oncologist', 'Sunday', 'Live in', 2, 2, 2, '', 'SR Hospital', 'India', '2022-10-11', '2024-10-11', 'India', '[{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"India\",\"work_start_date\":\"2024-10-12\",\"work_end_date\":\"2025-09-12\"}]', 'Medical Director', '[\"DELF\"]', '[\"No\"]', 1, 'MBBS', 'MS', '[\"Cardiology\"]', '[\"Cardiothoracic Surgery\"]', 'FRCP', '', 'TOEFL', 'DELF', 'Professional working proficiency', 'Cultural Competence in Healthcare', 0, '', 0, '', NULL, '2025-09-12 16:40:34', '2025-10-10 05:49:30'),
(9, 24, '', '[]', '[]', '[]', '[]', 'Doctor ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'India', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 10:36:25', '2025-10-14 10:36:25');

-- --------------------------------------------------------

--
-- Table structure for table `employer`
--

CREATE TABLE `employer` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `temporary_id` int(10) NOT NULL,
  `emp_name` varchar(20) DEFAULT NULL,
  `domestic_worker_category` varchar(100) DEFAULT NULL,
  `job_type` varchar(50) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `job_description` text DEFAULT NULL,
  `job_starting_date` timestamp NULL DEFAULT NULL,
  `prefer_contract_status` varchar(50) DEFAULT NULL,
  `looking_worker_for` varchar(255) DEFAULT NULL,
  `candidate_experience` varchar(50) DEFAULT NULL,
  `prefer_experience` varchar(100) DEFAULT NULL,
  `preferred_years_of_experience` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferred_years_of_experience`)),
  `gulf_experience_years` int(11) DEFAULT NULL,
  `total_experience_years` int(11) DEFAULT NULL,
  `candidates_country_experience` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`candidates_country_experience`)),
  `preferred_candidates_country` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferred_candidates_country`)),
  `preferred_language_for_worker` varchar(100) DEFAULT NULL,
  `locaion_preference` text DEFAULT NULL,
  `most_important_skill` varchar(100) DEFAULT NULL,
  `main_skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`main_skills`)),
  `cooking_skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cooking_skills`)),
  `other_skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`other_skills`)),
  `gender` varchar(20) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `education_level` varchar(100) DEFAULT NULL,
  `age` varchar(20) DEFAULT NULL,
  `working_city` varchar(100) DEFAULT NULL,
  `state_or_province` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `contact_source` varchar(50) DEFAULT NULL,
  `email_id` varchar(255) DEFAULT NULL,
  `whatsapp_number_country_code` varchar(10) DEFAULT NULL,
  `whatsapp_number` varchar(20) DEFAULT NULL,
  `phone_number_country_code` varchar(10) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `organization_name` varchar(255) DEFAULT NULL,
  `offer_for_selected_candidates` text DEFAULT NULL,
  `country_currency` varchar(50) DEFAULT NULL,
  `minimum_monthly_salary` decimal(10,2) DEFAULT NULL,
  `maximum_monthly_salary` decimal(10,2) DEFAULT NULL,
  `negotiable` tinyint(1) DEFAULT NULL,
  `adults` int(11) DEFAULT NULL,
  `children` int(11) DEFAULT NULL,
  `type_of_house` varchar(100) DEFAULT NULL,
  `rooms` int(11) DEFAULT NULL,
  `bathrooms` int(11) DEFAULT NULL,
  `have_pets` tinyint(1) DEFAULT NULL,
  `worker_nationality` varchar(100) DEFAULT NULL,
  `phone_country_code` varchar(10) DEFAULT NULL,
  `location_preference` varchar(255) DEFAULT '',
  `domestic_worker_name` varchar(255) DEFAULT NULL,
  `have_domestic_worker` tinyint(1) DEFAULT NULL,
  `nationality_of_domestic_worker` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `subscription` varchar(50) DEFAULT NULL,
  `plan_name` varchar(50) DEFAULT NULL,
  `plan_days` varchar(20) DEFAULT NULL,
  `plan_startdate` timestamp NULL DEFAULT NULL,
  `plan_enddate` timestamp NULL DEFAULT NULL,
  `next_duedate` timestamp NULL DEFAULT NULL,
  `amount` int(100) DEFAULT NULL,
  `payment_amount` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `posted_by` varchar(100) NOT NULL DEFAULT 'Direct',
  `view_count` int(20) DEFAULT NULL,
  `posted_on` datetime NOT NULL DEFAULT current_timestamp(),
  `profile_photo` varchar(255) DEFAULT NULL COMMENT 'Stores path to employer profile photo',
  `offer` varchar(100) DEFAULT NULL,
  `profile_photo_url` varchar(100) DEFAULT NULL,
  `subscription_plan_id` varchar(100) DEFAULT NULL,
  `columns_percentage` varchar(20) DEFAULT NULL,
  `last_low_views_reminder_sent` varchar(100) DEFAULT NULL,
  `currency_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employer`
--

INSERT INTO `employer` (`id`, `user_id`, `temporary_id`, `emp_name`, `domestic_worker_category`, `job_type`, `job_title`, `job_description`, `job_starting_date`, `prefer_contract_status`, `looking_worker_for`, `candidate_experience`, `prefer_experience`, `preferred_years_of_experience`, `gulf_experience_years`, `total_experience_years`, `candidates_country_experience`, `preferred_candidates_country`, `preferred_language_for_worker`, `locaion_preference`, `most_important_skill`, `main_skills`, `cooking_skills`, `other_skills`, `gender`, `religion`, `education_level`, `age`, `working_city`, `state_or_province`, `country`, `name`, `contact_source`, `email_id`, `whatsapp_number_country_code`, `whatsapp_number`, `phone_number_country_code`, `phone_number`, `nationality`, `organization_name`, `offer_for_selected_candidates`, `country_currency`, `minimum_monthly_salary`, `maximum_monthly_salary`, `negotiable`, `adults`, `children`, `type_of_house`, `rooms`, `bathrooms`, `have_pets`, `worker_nationality`, `phone_country_code`, `location_preference`, `domestic_worker_name`, `have_domestic_worker`, `nationality_of_domestic_worker`, `status`, `subscription`, `plan_name`, `plan_days`, `plan_startdate`, `plan_enddate`, `next_duedate`, `amount`, `payment_amount`, `payment_status`, `posted_by`, `view_count`, `posted_on`, `profile_photo`, `offer`, `profile_photo_url`, `subscription_plan_id`, `columns_percentage`, `last_low_views_reminder_sent`, `currency_name`) VALUES
(2, 2, 2, 'Saikrishna', 'Nanny', 'Full Time', 'Live-in Nanny for Infant Care', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-09-03 09:30:00', 'Any', '', 'Fresher', NULL, '[\"1-2 year\"]', 1, 1, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\",\"Elderly care\",\"Child care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Atheist', 'Bachelor', '20', 'Dubai', 'Dubai Emirate', NULL, 'saikrishna', NULL, 'saikrushnakadarla01@gmail.com', '', '', NULL, '', 'Indian', 'iiiq', '[]', '', 0.00, 0.00, 0, 0, 0, '', 0, 0, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-10-24 09:30:00', '2025-11-10 09:30:00', '2025-11-10 09:49:00', NULL, '100', 'Paid', 'Direct', 20, '2025-08-16 06:41:56', '/images/profile_photo-1759554103645.png', NULL, 'http://localhost:5000/images/profile_photo-1759554103645.png', '1', '75', NULL, NULL),
(11, 4, 8, 'sai', 'Nanny', 'Full Time', NULL, NULL, '2025-09-15 02:00:00', NULL, NULL, 'Fresher', NULL, '[]', 1, 1, '[\"Dubai\"]', '[]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', NULL, NULL, NULL, NULL, 'Dubai', 'Dubai Emirate', NULL, NULL, NULL, 'saikrushnakadarla01@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-10-24 09:47:39', '2025-11-08 09:47:44', '2025-11-10 10:24:53', NULL, '100', NULL, 'Direct', 1, '2025-09-08 19:13:40', NULL, NULL, NULL, NULL, '41', '2025-11-08 15:56:02', NULL),
(19, 2, 15, 'Saikrishna', 'Nanny', 'Full Time', 'Dubai family looking for Nanny', 'Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n', '2025-09-18 20:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 1, 1, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '25-30', 'Dubai', 'Dubai Emirate', NULL, 'saikrishna', NULL, 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 2500.00, 5000.00, 1, 3, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-10-24 09:48:00', '2025-11-08 09:48:03', NULL, NULL, NULL, NULL, 'Direct', 3, '2025-09-12 12:38:49', '/images/profile_photo-1757740276788.png', NULL, 'http://localhost:5000/images/profile_photo-1757740276788.png', '2', '81', '2025-11-08 15:56:05', NULL),
(20, 2, 16, 'Saikrishna', 'Nanny', 'Part Time', 'Nanny for Infant Care Nanny for Infant Care ', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates ', '2025-09-21 18:30:00', 'Any', 'For my family', 'Domestic', NULL, '[\"1-2 year\"]', 3, 3, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', NULL, 'saikrushna', NULL, 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 2500.00, 5000.00, 1, 2, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-10-24 04:18:14', '2025-11-08 04:18:16', NULL, NULL, NULL, NULL, 'Direct', NULL, '2025-09-17 17:33:06', '/images/profile_photo-1758641005155.png', NULL, 'http://localhost:5000/images/profile_photo-1758191790966.png', '2', '4', NULL, NULL),
(21, 2, 17, 'Saikrishna', 'Nanny', 'Full Time', 'Nanny for Infant Care Nanny for Infant Care ', 'Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n', '2025-09-24 13:00:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 2, 2, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '20-25', 'Dubai', 'Dubai Emirate', NULL, 'saikrushna', NULL, 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 2500.00, 5000.00, 1, 2, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-10-24 04:18:22', '2025-11-08 04:18:39', NULL, NULL, NULL, NULL, 'Direct', 1, '2025-09-18 23:49:50', '/images/profile_photo-1758259318147.png', NULL, 'http://localhost:5000/images/profile_photo-1758259318147.png', '2', '81', '2025-11-08 15:56:07', NULL),
(22, 2, 18, 'Saikrishna', 'Nanny', 'Full Time', 'Nanny for Infant Care Nanny for Infant Care ', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates ', '2025-09-19 09:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 2, 2, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', NULL, 'saikrushna', NULL, 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 2500.00, 5000.00, 1, 3, 3, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-10-23 19:18:50', '2025-11-07 19:18:55', NULL, NULL, NULL, NULL, 'Direct', 6, '2025-09-16 16:53:21', '/images/profile_photo-1758259939884.png', NULL, 'http://localhost:5000/images/profile_photo-1758259939884.png', '2', '81', NULL, NULL),
(24, 2, 20, 'Saikrishna', 'Nanny', 'Full Time', 'Live-in Nanny for Infant Care', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-09-11 06:00:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 2, 2, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', NULL, 'saikrushna', NULL, 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 1500.00, 2500.00, 1, 3, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-10-23 08:00:00', '2025-11-07 08:00:00', NULL, NULL, NULL, NULL, 'Direct', 11, '2025-09-18 03:35:13', '/images/profile_photo-1759554150852.png', NULL, 'http://localhost:5000/images/profile_photo-1759554150852.png', NULL, '80', NULL, NULL),
(26, 11, 22, 'sai', 'Nanny', 'Full Time', 'Nanny for Infant Care Nanny for Infant Care', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-09-22 14:00:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 1, 1, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Indian', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', NULL, 'saikrushna', NULL, 'saikdarla085@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 1500.00, 2500.00, 1, 2, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, NULL, NULL, NULL, '2025-10-16 21:30:00', NULL, NULL, NULL, NULL, 'Direct', 27, '2025-09-17 13:16:49', '/images/profile_photo-1758689313531.png', NULL, 'http://localhost:5000/images/profile_photo-1758689313531.png', NULL, '77', NULL, NULL),
(40, 3, 27, NULL, 'Nanny', 'Full Time', 'Dubai family looking for Nanny', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates\nPlease provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates\nPlease provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates\nPlease provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates\nPlease provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates\n\n\n ', '2025-09-26 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 0, 0, '[]', '[\"India\"]', '\"English\"', NULL, 'Baby care', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '20-25', 'Rajanna Sircilla', 'Telangana', 'Dubai', 'bharath', '', 'amarendravangala@gmail.com', '+91', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'AED (UAE Dirham)', 1500.00, 2000.00, 1, 3, 3, 'Apartment', 3, 3, 0, '', '+91', 'Any location', NULL, 0, NULL, 'Pending', NULL, 'Silver', NULL, '2025-10-23 00:30:00', '2025-11-07 00:30:00', NULL, NULL, NULL, NULL, 'Agency', NULL, '2025-10-07 13:57:34', '/images/profile_photo-1761912770589.jpg', NULL, NULL, NULL, '6', NULL, NULL),
(42, 2, 28, 'Saikrishna', 'Nanny', 'Full Time', 'India Saudhi family looking for Nany', 'Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidatesPlease provide information about the job for the selected candidates&nbsp;', '2025-11-01 20:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 0, 0, '[]', '[]', '[\"English\"]', NULL, '', '[\"Baby care\"]', '[\"Arabic\",\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '20-25', 'Sircilla', 'Telangana', 'India', 'saikrushna', '', 'saikrushnakadarla01@gmail.com', '+91', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[]', 'AED (UAE Dirham)', 1200.00, 1500.00, 1, 2, 2, 'Villa', 3, 3, 0, 'India', '+91', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Gold', NULL, '2025-10-22 15:00:00', '2025-11-14 15:00:00', NULL, NULL, NULL, NULL, 'Direct', 4, '2025-10-13 16:53:08', '/images/profile_photo-1761301645735.jpg', NULL, 'http://localhost:5001/images/profile_photo-1761301645735.jpg', NULL, '82', '2025-11-08 15:56:09', NULL),
(45, 2, 29, 'Saikrishna', 'Cook', 'Full Time', 'India Live-in Nanny for Infant Care  Live-in N', 'Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates', '2025-10-30 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 0, 0, '[\"India\"]', '[\"Any\"]', '[\"English\"]', NULL, 'Baby care', '[\"Cooking\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '20-25', 'Sircilla', 'Telangana', 'India', 'saikrishna', '', 'saikrushnakadarla01@gmail.com', '+91', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[]', 'AED (UAE Dirham)', 1500.00, 2000.00, 0, 2, 2, 'Villa', 3, 3, 0, '', '+91', 'Any location', NULL, 0, NULL, 'Active', NULL, 'Free', NULL, '2025-11-10 18:30:00', '2025-11-17 18:30:00', NULL, NULL, NULL, NULL, 'Direct', 1, '2025-10-27 04:47:35', '/images/profile_photo-1762853552731.jpg', NULL, 'http://localhost:5000/images/profile_photo-1762181498550.jpg', NULL, '7', '2025-11-08 15:56:12', NULL),
(46, 28, 30, 'sai', 'Cook', 'Full Time', 'India family looking for cook', 'Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates&nbsp;Please provide information about the job for the selected candidates', '2025-10-31 17:00:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 0, 0, '[\"India\"]', '[\"India\"]', '[\"English\"]', NULL, '', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '20-25', 'Sircilla', 'Telangana', 'India', 'sai', '', 'saikdarla085@gmail.com', '+91', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[]', 'AED (UAE Dirham)', 1500.00, 2000.00, 1, 2, 2, 'Villa', 3, 3, 0, '', '+91', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'gold', NULL, '2025-10-28 06:00:00', '2025-12-28 06:00:00', NULL, NULL, NULL, NULL, 'Direct', 9, '2025-10-28 21:15:22', '/images/profile_photo-1761984841601.jpg', NULL, 'http://localhost:5001/images/profile_photo-1761984841601.jpg', NULL, '81', '2025-11-08 15:56:14', NULL),
(47, 2, 31, 'Saikrishna', 'Nanny', 'Full Time', 'India family looking for Nanny', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidatesPlease provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-11-13 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 0, 0, '[\"India\"]', '[\"Any\"]', '[\"English\"]', NULL, 'Indian', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Male', 'Hindu', '12th', '20-25', 'Sircilla', 'Telangana', 'India', 'saikrushna', '', 'saikrushnakadarla01@gmail.com', '+91', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[]', 'AED (UAE Dirham)', 1200.00, 1500.00, 0, 3, 3, 'Villa', 3, 3, 0, '', '+91', 'Any location', NULL, 0, NULL, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Direct', NULL, '2025-11-12 05:53:08', NULL, NULL, NULL, NULL, '14', NULL, NULL),
(48, 32, 32, 'Pavani', 'Cook', 'Full Time', 'India family looking for cook', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates hgvhjvh hjbjhjbvmv Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-11-19 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 0, 0, '[\"India\"]', '[\"Any\"]', '[\"English\"]', NULL, 'Indian', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '20-25', 'Sircilla', 'Telangana', 'India', 'Pavani', '', 'pavanimyana2000@gmail.com', '+91', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[]', 'AED (UAE Dirham)', 1500.00, 2000.00, 0, 2, 2, 'Villa', 3, 3, 0, '', '+91', 'Any location', NULL, 0, NULL, 'Pending', NULL, 'Silver', NULL, '2025-11-13 18:30:00', '2025-11-13 18:30:00', NULL, NULL, NULL, NULL, 'Direct', NULL, '2025-11-14 13:29:37', '/images/profile_photo-1763127079430.jpg', NULL, NULL, NULL, '7', NULL, NULL),
(49, 33, 33, 'Myana', 'Nanny', 'Full Time', 'India family looking for Nanny', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-11-20 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 0, 0, '[\"India\"]', '[\"Any\"]', '[\"English\"]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '20-25', 'Sircilla', 'Telangana', 'India', 'pavani', '', 'myanapavani570@gmail.com', '+91', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '\"Free food\"', 'AED (UAE Dirham)', 15000.00, 20000.00, 0, 2, 2, 'Villa', 3, 3, 0, '', '+91', 'Any location', NULL, 0, NULL, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Direct', NULL, '2025-11-14 19:07:59', '/images/profile_photo-1763127591487.jpg', NULL, NULL, NULL, '4', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL COMMENT 'Jobseeker who applied',
  `empuserid` int(11) NOT NULL COMMENT 'Employer who posted the job',
  `jobid` int(11) NOT NULL COMMENT 'The job that was applied to',
  `application_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('Applied','Shortlisted','Rejected') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_applications`
--

INSERT INTO `job_applications` (`id`, `userid`, `empuserid`, `jobid`, `application_date`, `status`) VALUES
(1, 3, 2, 19, '2025-09-13 05:17:31', 'Applied'),
(2, 2, 2, 2, '2025-10-03 06:02:09', 'Applied'),
(3, 2, 2, 4, '2025-10-03 06:02:29', 'Applied'),
(4, 2, 2, 22, '2025-10-03 06:10:54', 'Applied'),
(5, 2, 2, 21, '2025-10-03 06:15:12', 'Applied'),
(8, 3, 11, 26, '2025-10-11 10:11:05', 'Applied'),
(9, 23, 11, 26, '2025-10-12 07:10:15', 'Applied'),
(10, 3, 2, 44, '2025-10-27 11:06:16', 'Applied'),
(11, 3, 28, 46, '2025-11-05 07:48:21', 'Applied'),
(12, 3, 2, 2, '2025-11-05 07:53:12', 'Applied');

-- --------------------------------------------------------

--
-- Table structure for table `job_position`
--

CREATE TABLE `job_position` (
  `id` int(11) NOT NULL,
  `position` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_position`
--

INSERT INTO `job_position` (`id`, `position`, `category`, `description`) VALUES
(1, 'Maid', 'Domestic', 'Provide details about this job position (optional)'),
(2, 'Driver', 'Domestic', NULL),
(3, 'Cook', 'Domestic', NULL),
(4, 'Nanny', 'Domestic', NULL),
(5, 'Nurse', 'Domestic', NULL),
(6, 'Houseboy', 'Domestic', NULL),
(7, 'Tailor', 'Domestic', NULL),
(8, 'Teacher', 'Domestic', NULL),
(9, 'Trainer', 'Domestic', NULL),
(10, 'Gardener', 'Domestic', NULL),
(11, 'Butler', 'Domestic', NULL),
(12, 'Housekeeper', 'Domestic', NULL),
(13, 'Laundry Worker', 'Domestic', NULL),
(14, 'Personal Assistant', 'Domestic', NULL),
(15, 'Caregiver', 'Domestic', NULL),
(16, 'Elder Care Companion', 'Domestic', NULL),
(17, 'Pet Sitter/Dog Walker', 'Domestic', NULL),
(18, 'House Manager', 'Domestic', NULL),
(19, 'Cleaner', 'Domestic', NULL),
(20, 'Maintenance Worker', 'Domestic Helper', NULL),
(21, 'Baby Sitter', 'Domestic', NULL),
(22, 'Tutor', 'Domestic', NULL),
(23, 'Chauffeur', 'Domestic', NULL),
(24, 'Housemaid', 'Domestic', NULL),
(25, 'Kitchen Staff', 'Domestic', NULL),
(26, 'Dining Room Attendant', 'Domestic', NULL),
(27, 'Personal Chef', 'Domestic', NULL),
(28, 'Event Coordinator', 'Domestic', NULL),
(29, 'Household Administrator', 'Domestic', NULL),
(30, 'Domestic Assistant', 'Domestic', NULL),
(34, 'Doctor ', 'Company', NULL),
(35, 'Marketing Executive', 'Company', NULL),
(36, 'House Teacher', 'Domestic helper', NULL),
(37, 'gardaner', 'Domestic Helper', 'Some Description');

-- --------------------------------------------------------

--
-- Table structure for table `job_reports`
--

CREATE TABLE `job_reports` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emp_name` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `job_id` int(11) NOT NULL,
  `emp_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_reports`
--

INSERT INTO `job_reports` (`id`, `user_id`, `emp_name`, `first_name`, `job_id`, `emp_id`, `email`, `reason`, `description`, `created_at`) VALUES
(1, 3, NULL, 'Saikrishna', 45, 2, 'kadarlasaikrushna99@gmail.com', 'Fraudulent', 'this job is fake', '2025-11-05 04:50:47');

-- --------------------------------------------------------

--
-- Table structure for table `job_seekers`
--

CREATE TABLE `job_seekers` (
  `id` int(20) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `agency_uid` int(20) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(100) DEFAULT NULL,
  `marital_status` varchar(50) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `current_country` varchar(100) DEFAULT NULL,
  `total_work_experience` varchar(50) DEFAULT NULL,
  `email_id` varchar(100) DEFAULT NULL,
  `agency_mail` varchar(50) DEFAULT NULL,
  `whatsapp_country_code` varchar(20) DEFAULT NULL,
  `whatsapp_number` varchar(20) DEFAULT NULL,
  `telegram_country_code` varchar(20) DEFAULT NULL,
  `telegram_number` varchar(20) DEFAULT NULL,
  `botim_country_code` varchar(20) DEFAULT NULL,
  `botim_number` varchar(20) DEFAULT NULL,
  `has_valid_passport` varchar(20) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `job_position` varchar(100) DEFAULT NULL,
  `other_position` varchar(100) DEFAULT NULL,
  `is_ban` varchar(20) DEFAULT NULL,
  `ban_reason` varchar(100) DEFAULT NULL,
  `banned_country` varchar(50) DEFAULT NULL,
  `job_type` varchar(100) DEFAULT NULL,
  `preferred_start_date` date DEFAULT NULL,
  `current_work_status` varchar(100) DEFAULT NULL,
  `visa_type` varchar(100) DEFAULT NULL,
  `visa_issued_date` date DEFAULT NULL,
  `visa_expiry_date` date DEFAULT NULL,
  `noc_or_transfer_letter` tinyint(1) DEFAULT 0,
  `preffered_job_locations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preffered_job_locations`)),
  `other_job_location` varchar(50) DEFAULT NULL,
  `previous_country_worked` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`previous_country_worked`)),
  `previous_employer_house_duties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`previous_employer_house_duties`)),
  `expected_monthly_salary` decimal(10,2) DEFAULT NULL,
  `expected_monthly_salary_usd` decimal(10,2) DEFAULT NULL,
  `expected_monthly_salary_qar` decimal(10,2) DEFAULT NULL,
  `day_off_preference` varchar(100) DEFAULT NULL,
  `accommodation_preference` varchar(100) DEFAULT NULL,
  `language` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`language`)),
  `height` varchar(10) DEFAULT NULL,
  `weight` varchar(10) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `main_skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`main_skills`)),
  `cooking_skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cooking_skills`)),
  `other_skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`other_skills`)),
  `personality` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`personality`)),
  `otherLanguage` varchar(20) DEFAULT NULL,
  `otherCookingSkill` varchar(20) DEFAULT NULL,
  `experience` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`experience`)),
  `reference_letter` tinyint(1) DEFAULT 0,
  `education` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`education`)),
  `profile_photo` varchar(255) DEFAULT NULL,
  `show_profile_photo` tinyint(1) DEFAULT 1,
  `resume_description` text DEFAULT NULL,
  `subscription` varchar(100) DEFAULT NULL,
  `upload_video` varchar(255) DEFAULT NULL,
  `video_file_size` int(11) DEFAULT NULL,
  `video_file_type` varchar(50) DEFAULT NULL,
  `networking_opportunities` varchar(50) DEFAULT NULL,
  `source` varchar(20) NOT NULL DEFAULT 'Direct',
  `verification_status` varchar(20) DEFAULT 'Pending',
  `video_upload_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `subscription_plan` varchar(50) DEFAULT NULL,
  `last_upgrade_email_sent` datetime DEFAULT NULL,
  `candidate_posting` tinyint(1) DEFAULT NULL,
  `candidate_contact` tinyint(1) DEFAULT NULL,
  `plan_days` int(20) DEFAULT NULL,
  `plan_startdate` date DEFAULT NULL,
  `plan_enddate` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `driving_license_country` text DEFAULT NULL,
  `driving_license_countries` varchar(200) DEFAULT NULL,
  `other_driving_license_country` varchar(255) DEFAULT NULL,
  `car_type` text DEFAULT NULL,
  `car_types_driven` varchar(200) DEFAULT NULL,
  `previous_car` text DEFAULT NULL,
  `previous_cars_driven` varchar(200) DEFAULT NULL,
  `other_previous_car` varchar(255) DEFAULT NULL,
  `current_hospital_name` varchar(255) DEFAULT NULL,
  `current_hospital_country` varchar(100) DEFAULT NULL,
  `current_employment_date` date DEFAULT NULL,
  `current_finish_contract_date` date DEFAULT NULL,
  `previous_hospital_name` varchar(255) DEFAULT NULL,
  `previous_hospital_country` varchar(100) DEFAULT NULL,
  `previous_employment_date` date DEFAULT NULL,
  `previous_finish_contract_date` date DEFAULT NULL,
  `nursing_qualifications` text DEFAULT NULL,
  `professional_qualifications` text DEFAULT NULL,
  `specialized_qualifications` text DEFAULT NULL,
  `language_qualifications` text DEFAULT NULL,
  `has_prometric_certificate` tinyint(1) DEFAULT NULL,
  `prometric_issue_date` date DEFAULT NULL,
  `prometric_expiry_date` date DEFAULT NULL,
  `prometric_issued_country` varchar(100) DEFAULT NULL,
  `has_dataflow_certificate` tinyint(1) DEFAULT NULL,
  `dataflow_issue_date` date DEFAULT NULL,
  `dataflow_expiry_date` date DEFAULT NULL,
  `dataflow_issued_country` varchar(100) DEFAULT NULL,
  `cultural_adaptation_qualifications` text DEFAULT NULL,
  `nursing_job_countries` text DEFAULT NULL,
  `language_skills` text DEFAULT NULL,
  `nursing_license_countries` text DEFAULT NULL,
  `other_nursing_license_country` varchar(255) DEFAULT NULL,
  `nursing_license_issue_date` date DEFAULT NULL,
  `nursing_license_expiry_date` date DEFAULT NULL,
  `has_nursing_license` tinyint(1) DEFAULT 1,
  `no_of_children` varchar(20) DEFAULT NULL,
  `nursing_positions` text DEFAULT NULL,
  `offer` varchar(20) DEFAULT NULL,
  `next_duedate` timestamp NULL DEFAULT NULL,
  `columns_percentage` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_seekers`
--

INSERT INTO `job_seekers` (`id`, `user_id`, `agency_uid`, `first_name`, `last_name`, `age`, `gender`, `marital_status`, `nationality`, `religion`, `current_country`, `total_work_experience`, `email_id`, `agency_mail`, `whatsapp_country_code`, `whatsapp_number`, `telegram_country_code`, `telegram_number`, `botim_country_code`, `botim_number`, `has_valid_passport`, `category`, `job_position`, `other_position`, `is_ban`, `ban_reason`, `banned_country`, `job_type`, `preferred_start_date`, `current_work_status`, `visa_type`, `visa_issued_date`, `visa_expiry_date`, `noc_or_transfer_letter`, `preffered_job_locations`, `other_job_location`, `previous_country_worked`, `previous_employer_house_duties`, `expected_monthly_salary`, `expected_monthly_salary_usd`, `expected_monthly_salary_qar`, `day_off_preference`, `accommodation_preference`, `language`, `height`, `weight`, `color`, `main_skills`, `cooking_skills`, `other_skills`, `personality`, `otherLanguage`, `otherCookingSkill`, `experience`, `reference_letter`, `education`, `profile_photo`, `show_profile_photo`, `resume_description`, `subscription`, `upload_video`, `video_file_size`, `video_file_type`, `networking_opportunities`, `source`, `verification_status`, `video_upload_date`, `subscription_plan`, `last_upgrade_email_sent`, `candidate_posting`, `candidate_contact`, `plan_days`, `plan_startdate`, `plan_enddate`, `created_at`, `driving_license_country`, `driving_license_countries`, `other_driving_license_country`, `car_type`, `car_types_driven`, `previous_car`, `previous_cars_driven`, `other_previous_car`, `current_hospital_name`, `current_hospital_country`, `current_employment_date`, `current_finish_contract_date`, `previous_hospital_name`, `previous_hospital_country`, `previous_employment_date`, `previous_finish_contract_date`, `nursing_qualifications`, `professional_qualifications`, `specialized_qualifications`, `language_qualifications`, `has_prometric_certificate`, `prometric_issue_date`, `prometric_expiry_date`, `prometric_issued_country`, `has_dataflow_certificate`, `dataflow_issue_date`, `dataflow_expiry_date`, `dataflow_issued_country`, `cultural_adaptation_qualifications`, `nursing_job_countries`, `language_skills`, `nursing_license_countries`, `other_nursing_license_country`, `nursing_license_issue_date`, `nursing_license_expiry_date`, `has_nursing_license`, `no_of_children`, `nursing_positions`, `offer`, `next_duedate`, `columns_percentage`) VALUES
(5, 4, NULL, 'Sai', 'krushna', 22, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'kadarlasaikrushna01@gmail.com', NULL, '+91(India)', '9381850288', '+91(India)', '9381850288', '+91(India)', '9381850288', '0', 'Domestic Helper', '[\"Doctor \"]', NULL, '0', NULL, NULL, 'Full Time', '2025-07-29', 'Finish contract', 'No visa', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '/images/profile_photo-1760075100843.png', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) ', '1', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '1', 'Direct', 'Verified', '2025-11-08 10:02:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-23 05:04:17', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '1'),
(6, 5, 2, 'Sai', 'krishna', 23, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'asaikrishnachary@gmail.com', 'saikrushnakadarla99@gmail.com', '+91(India)', '8106815633', '+91(India)', '9381850200', '+91(India)', '9381850200', '0', 'Domestic Helper', '[\"Cook\"]', NULL, '0', NULL, NULL, 'Full Time', '2025-08-09', 'Finish contract', 'No visa', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '/images/profile_photo-1756530639168.jpg', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n\n \n \n', NULL, NULL, NULL, NULL, NULL, 'Agency', 'Verified', '2025-11-08 10:02:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-23 10:34:10', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '44'),
(7, 6, NULL, 'Manoj', 'duvva', 25, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'duvvamanoj123456789@gmail.com', NULL, '+91(India)', '9381850200', '+91(India)', '9381850200', '+91(India)', '9381850200', '0', 'Company', '[\"Nurse\"]', NULL, '0', NULL, NULL, 'Full Time', '1899-11-28', 'Finish contract', 'No visa', '2025-08-31', '2025-09-23', 0, '[\"Dubai\"]', 'India', NULL, NULL, 150000.00, 1800.00, 6600.00, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '158-160 cm', '55-60 kg', 'Fair', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Teacher\"],\"country\":[\"Qatar\"],\"other_country\":\"\",\"start_year\":\"2022\",\"end_year\":\"2023\",\"employer_type\":\"Family\",\"employer_nationality\":\"Dubai\",\"house_duties\":[\"Teacher\"],\"join_date\":\"2\",\"join_month\":\"April\",\"join_year\":\"2022\",\"exit_date\":\"2\",\"exit_month\":\"March\",\"exit_year\":\"2023\"}]', 0, '[{\"level\":\"Bachelor\",\"course\":\"4 year\",\"status\":\"Yes\",\"completion_year\":\"2023\"}]', '/images/profile_photo-1760075192472.png', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n\n\n\n\n\n\n ', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '0', 'Direct', 'Verified', '2025-11-08 10:02:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-05 18:09:04', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, 'SR Hospital', 'India', '2025-09-03', '2025-09-15', 'Hospital', 'India', '2025-09-03', '2025-09-13', '[\"ANM\"]', '[\"Registered Nurse\"]', '[\"Critical Care Registered Nurse\"]', '[\"TOEFL\"]', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, '[\"Transcultural Nursing\"]', '[\"Dubai\"]', '[\"English\"]', '[\"Qatar\"]', NULL, '2025-09-03', '2025-09-22', 1, '2', '[\"Registered Nurse\"]', NULL, NULL, '3'),
(8, 7, NULL, 'pavani', 'myana', 23, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'pavanimyana2000@gmail.com', NULL, '+91(India)', '9676704365', '+91(India)', '9381850208', '+91(India)', '9381850208', '0', 'Company', '[\"Nurse\"]', NULL, '0', NULL, NULL, 'Full Time', '1899-11-28', 'Finish contract', 'No visa', NULL, NULL, 0, '[\"Qatar\"]', 'India', NULL, NULL, 50000.00, 600.00, 2200.00, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '160-162 cm', '60-65 kg', 'Fair', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Nurse\"],\"country\":[\"Dubai\"],\"other_country\":\"\",\"start_year\":\"2022\",\"end_year\":\"2023\",\"employer_type\":\"Company\",\"employer_nationality\":\"Dubai\",\"house_duties\":[\"Nurse\"],\"join_date\":\"\",\"join_month\":\"January\",\"join_year\":\"2022\",\"exit_date\":\"7\",\"exit_month\":\"July\",\"exit_year\":\"2023\"}]', 0, '[{\"level\":\"Bachelor\",\"course\":\"4 year\",\"status\":\"Yes\",\"completion_year\":\"2022\"}]', '/images/profile_photo-1760075282843.png', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M', NULL, NULL, '0', 'Direct', 'Verified', '2025-11-08 10:02:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-06 05:32:42', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, 'SR Hospitals', 'India', '2025-09-03', '2025-09-23', 'Hospitals', 'India', '2025-08-03', '2025-09-03', '[\"ANM\"]', '[\"Registered Nurse\"]', '[\"Critical Care Registered Nurse\"]', '[\"TOEFL\"]', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, '[\"Transcultural Nursing\"]', '[\"Dubai\"]', '[\"English\"]', '[\"Qatar\"]', NULL, '2025-09-03', '2025-11-10', 1, '1', '[\"Registered Nurse\"]', '10% Limited offer', NULL, '1'),
(9, 10, NULL, 'Naveen', 'mogiloju', 27, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'mogilojunaveen123@gmail.com', NULL, '+91(India)', '9381850200', '+91(India)', '9381850200', '+91(India)', '9381850200', '0', 'Domestic Helper', '[\"Driver\"]', NULL, '0', NULL, NULL, 'Full Time', '2025-09-17', 'Finish contract', 'No visa', NULL, NULL, 0, '[\"Qatar\"]', '', NULL, NULL, 25000.00, 300.00, 1100.00, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '158-160 cm', '60-65 kg', 'Fair', '[\"Marketing\"]', '[]', '[\"Driving Lic.\"]', '[\"Honest\"]', '', '', '[{\"job_position\":[\"Driver\"],\"country\":[\"Qatar\"],\"other_country\":\"\",\"start_year\":\"2022\",\"end_year\":\"2024\",\"employer_type\":\"Family\",\"employer_nationality\":\"Qatar\",\"house_duties\":[\"Driver\"],\"join_date\":\"6\",\"join_month\":\"June\",\"join_year\":\"2022\",\"exit_date\":\"6\",\"exit_month\":\"June\",\"exit_year\":\"2024\"}]', 0, '[{\"level\":\"12th\",\"course\":\"2 year\",\"status\":\"Yes\",\"completion_year\":\"2021\"}]', '/images/profile_photo-1757687982276.png', 1, 'Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '0', 'Direct', 'Verified', '2025-11-08 10:02:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-12 14:19:35', '[\"Qatar\"]', NULL, NULL, '[\"Manual\"]', NULL, '[\"Land Cruiser\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '3'),
(10, 8, NULL, 'Ramu', 'ram', 24, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'myanapavani570@gmail.com', NULL, '+91(India)', '9381850201', '+91(India)', '9381850201', '+91(India)', '9381850201', '0', 'Company', '[\"Doctor \"]', NULL, '0', NULL, NULL, 'Full Time', '2025-09-15', 'Finish contract', 'No visa', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '/images/profile_photo-1760075399620.png', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '0', 'Direct', 'Verified', '2025-11-08 10:02:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-12 16:39:22', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '3'),
(11, 15, NULL, 'Krishna', 'kadarla', 22, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'saikdarla085@gmail.com', NULL, '+91(India)', '9381850288', '+91(India)', '9381850288', '+91(India)', '9381850288', '0', 'Domestic Helper', '[\"Nanny\"]', NULL, '1', 'RUN AWAY', NULL, 'Full Time', '0000-00-00', 'Finish contract', 'Need Family Visa', '2025-08-04', '2026-03-03', 0, '[\"India\"]', '', NULL, NULL, 25000.00, 300.00, 1100.00, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '158-160 cm', '55-60 kg', 'Fair', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Nany\"],\"country\":[\"India\"],\"other_country\":\"\",\"start_year\":\"2024\",\"end_year\":\"2025\",\"employer_type\":\"Family\",\"employer_nationality\":\"India\",\"house_duties\":[\"Nany\"],\"join_date\":\"3\",\"join_month\":\"January\",\"join_year\":\"2024\",\"exit_date\":\"4\",\"exit_month\":\"February\",\"exit_year\":\"2025\"}]', 0, '[{\"level\":\"12th\",\"course\":\"2 year\",\"status\":\"Yes\",\"completion_year\":\"2021\"}]', '/images/profile_photo-1759555739827.png', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n\n Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n\n \n', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '0', 'Direct', 'Pending', '2025-11-08 10:02:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-04 05:16:03', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '3'),
(13, 23, NULL, 'Sai', 'kadarla', 22, 'Male', 'Single', 'India', 'Hindu', 'India', '1 year', 'kadarlasaikrushna99@gmail.com', NULL, '+91(India)', '9381850288', '+91(India)', '9381850288', '+91(India)', '9381850288', '0', 'Domestic Helper', '[\"Maid\"]', NULL, '0', 'RUN AWAY', NULL, 'Full Time', '0000-00-00', 'Finish contract', 'No visa', NULL, NULL, 0, '[\"Dubai\"]', '', NULL, NULL, 15000.00, 180.00, 660.00, 'Weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '156-157 cm', '60-65 kg', 'Fair', '[\"Baby care\",\"Child care\"]', '[\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Cook\"],\"country\":[\"Dubai\"],\"other_country\":\"\",\"start_year\":\"2023\",\"end_year\":\"2024\",\"employer_type\":\"Family\",\"employer_nationality\":\"Dubai\",\"house_duties\":[\"Cook\"],\"join_date\":\"5\",\"join_month\":\"May\",\"join_year\":\"2023\",\"exit_date\":\"6\",\"exit_month\":\"June\",\"exit_year\":\"2024\"}]', 0, '[{\"level\":\"Master\",\"course\":\"2 year\",\"status\":\"Yes\",\"completion_year\":\"2023\"}]', '/images/profile_photo-1760253002867.png', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '0', 'Direct', 'Pending', '2025-11-08 10:02:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-12 06:42:25', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '3'),
(14, 24, 3, 'Suman', 'kadarla', 23, 'Male', 'Single', 'Philippines', 'Hindu', 'India', '1 years', 'saikrushnakadarla99@gmail.com', 'saikrushnakadarla99@gmail.com', '+63(Philippines)', '9381850288', '+63(Philippines)', '9381850288', '+63(Philippines)', '9381850288', '0', 'Domestic Helper', '[\"Cook\"]', NULL, '0', NULL, NULL, 'Full Time', '2025-09-04', 'Finish contract', 'No visa', NULL, NULL, 0, '[\"Dubai\",\"Qatar\",\"Oman\"]', '', NULL, NULL, 1500.00, 18.00, 66.00, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fair\",\"can_read\":true,\"can_write\":true}]', '160-162 cm', '55-60 kg', 'Fair', '[\"Baby care\",\"Child care\",\"Teen care\"]', '[\"Arabic\",\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Cook\"],\"country\":[\"Dubai\"],\"other_country\":\"\",\"start_year\":\"2021\",\"end_year\":\"2022\",\"employer_type\":\"Family\",\"employer_nationality\":\"Dubai\",\"house_duties\":[\"Cook\"],\"join_date\":\"9\",\"join_month\":\"July\",\"join_year\":\"2021\",\"exit_date\":\"18\",\"exit_month\":\"September\",\"exit_year\":\"2022\"}]', 0, '[{\"level\":\"12th\",\"course\":\"2 year\",\"status\":\"Yes\",\"completion_year\":\"2020\"}]', '/images/profile_photo-1760261153439.png', 1, 'Resume Description (Explain your work experience and personality Resume Description (Explain your work experience and personality Resume Description (Explain your work experience and personality Resume Description (Explain your work experience and personality Resume Description (Explain your work experience and personality Resume Description (Explain your work experience and personality Resume Description (Explain your work experience and personality', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M', NULL, NULL, '0', 'Agency', 'Pending', '2025-11-08 10:02:26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-12 09:07:52', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '2'),
(15, 25, NULL, 'Tharun', 'kumar', 22, 'Male', 'Single', 'India', 'Hindu', 'Philippines', '1 year', 'asaikrishnachary@gmail.com', NULL, '+91(India)', '9381850288', '+91(India)', '9381850288', '+91(India)', '9381850288', '0', 'Domestic Helper', '[\"Cook\"]', NULL, '0', NULL, NULL, 'Full Time', '0000-00-00', 'Finish contract', 'No visa', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Direct', 'Pending', '2025-11-08 10:02:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-12 09:59:19', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '20'),
(18, 3, NULL, 'Saikrishna', 'kadarla', 25, 'Male', 'Single', 'India', 'Hindu', 'India', '1 year', 'kadarlasaikrushna99@gmail.com', NULL, '+91(India)', '9381850288', '+91(India)', '9381850288', '+91(India)', '9381850288', '0', 'Domestic Helper', '[\"Cook\"]', NULL, '1', 'BROKEN CONTRACT', 'Srilanka', 'Full Time', '2025-10-04', 'Finished contract', 'Looking for visa', NULL, NULL, 0, '[\"India\"]', '', NULL, NULL, 15000.00, 180.00, 660.00, 'Weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '160-162 cm', '60-65 kg', 'Fair', '[\"Cooking\"]', '[\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Cook\"],\"country\":[\"India\"],\"other_country\":\"\",\"start_year\":\"\",\"end_year\":\"\",\"employer_type\":\"Family\",\"employer_nationality\":\"India\",\"house_duties\":[\"Cook\"],\"join_date\":\"3\",\"join_month\":\"March\",\"join_year\":\"2023\",\"exit_date\":\"3\",\"exit_month\":\"March\",\"exit_year\":\"2024\"}]', 0, '[{\"level\":\"12th\",\"course\":\"2 year\",\"status\":\"Yes\",\"completion_year\":\"2022\"}]', '/images/profile_photo-1762177851069.png', 1, 'Explain your work experience and personality Explain your work experience and personality Explain your work experience and personality v Explain your work experience and personality Explain your work experience and personality Explain your work experience and personality Explain your work experience and personality Explain your work experience and personalityExplain your work experience and personality', '1', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '1', 'Direct', 'Verified', '2025-11-14 12:12:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 13:24:47', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '2'),
(19, 30, NULL, 'Gudnet', 'guld', 25, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'gudnet@yahoo.co.uk', NULL, '+91(India)', '9321131120', '+91(India)', '9321131120', '+91(India)', '9321131120', '0', 'Domestic Helper', '[\"Cook\"]', NULL, '1', 'BROKEN CONTRACT', 'Srilanka', 'Full Time', '2025-11-11', 'Finished contract', 'Looking for visa', NULL, NULL, 0, '[\"Qatar\"]', '', NULL, NULL, 15000.00, 180.00, 660.00, 'Weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '160-162 cm', '60-65 kg', 'Fair', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Cook\"],\"country\":[\"India\"],\"other_country\":\"\",\"start_year\":\"\",\"end_year\":\"\",\"employer_type\":\"Family\",\"employer_nationality\":\"India\",\"house_duties\":[\"Cook\"],\"join_date\":\"4\",\"join_month\":\"May\",\"join_year\":\"2023\",\"exit_date\":\"5\",\"exit_month\":\"June\",\"exit_year\":\"2024\"}]', 0, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Direct', 'Pending', '2025-11-08 10:02:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-07 10:13:00', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, NULL, '3');

-- --------------------------------------------------------

--
-- Table structure for table `mails_table`
--

CREATE TABLE `mails_table` (
  `id` int(11) NOT NULL,
  `emp_id` int(11) NOT NULL,
  `job_seeker_id` int(11) NOT NULL,
  `sender_id` int(50) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mails_table`
--

INSERT INTO `mails_table` (`id`, `emp_id`, `job_seeker_id`, `sender_id`, `message`, `created_at`) VALUES
(35, 2, 3, 2, 'I\'m interested', '2025-11-07 13:47:02'),
(40, 2, 3, 3, 'I\'m interested in this job opportunity\n\n---\nMy Profile Details:\nName: Saikrishna \n      \n Contact: 9381850288\n      \nView Full Profile: http://localhost:3000/candidateview/3/Saikrishna', '2025-11-07 14:13:45'),
(41, 2, 3, 3, 'I\'m interested in this job opportunity\n\n---\nMy Profile Details:\nName: Saikrishna \n      \n Contact: 9381850288\n      \nView Full Profile: http://localhost:3000/candidateview/3/Saikrishna', '2025-11-07 15:32:58');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `publish_date` date NOT NULL,
  `read_time` varchar(20) NOT NULL DEFAULT '5 min read',
  `excerpt` text NOT NULL,
  `content` longtext NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `slug` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `title`, `category`, `publish_date`, `read_time`, `excerpt`, `content`, `image_url`, `status`, `slug`, `meta_description`, `tags`, `created_at`, `updated_at`) VALUES
(7, 'Article Title', 'Domestic Helper', '2025-09-19', '7 min read', 'fdg ghth ethytr tryetut  tyu5yu4t', 'trhytruh e56u6u 67u 67 67iy6ujj ghnhnh dyjtygjety tyj ety tyj etyju ety', 'http://localhost:5001/uploads/news-1763103105941-189244128.png', 'draft', 'productivity-tips-2025', 'dfgdfs  tyutyhjtyhgtfr gfhgfrhbgfhnhmetyhjtrsg trhgtrhty tryhu tryetjety yuhjetyd', 'AI, Technology, Innovation, Future', '2025-09-20 16:17:53', '2025-11-14 12:21:45');

-- --------------------------------------------------------

--
-- Table structure for table `shortlist`
--

CREATE TABLE `shortlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employer_id` int(20) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `email_id` varchar(255) NOT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `employer_source` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `plan_id` varchar(50) DEFAULT NULL,
  `plan_name` varchar(255) NOT NULL,
  `period` varchar(20) DEFAULT NULL,
  `listing_duration_days` varchar(20) NOT NULL,
  `access_type` varchar(20) NOT NULL,
  `job_position_priority` varchar(40) NOT NULL,
  `messaging_limit` varchar(20) NOT NULL,
  `whatsapp_access` varchar(30) NOT NULL,
  `direct_call_access` varchar(20) NOT NULL,
  `share_option` varchar(20) NOT NULL,
  `view_limit` varchar(20) NOT NULL,
  `alerts_for_new_cvs` tinyint(1) DEFAULT 0,
  `full_contact_details` tinyint(1) DEFAULT 0,
  `activate_deactivate_option` tinyint(1) DEFAULT 0,
  `currency` varchar(50) DEFAULT NULL,
  `price` int(50) DEFAULT NULL,
  `limit_count` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `contact_details` varchar(255) DEFAULT NULL,
  `candidate_contact_details` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `plan_id`, `plan_name`, `period`, `listing_duration_days`, `access_type`, `job_position_priority`, `messaging_limit`, `whatsapp_access`, `direct_call_access`, `share_option`, `view_limit`, `alerts_for_new_cvs`, `full_contact_details`, `activate_deactivate_option`, `currency`, `price`, `limit_count`, `description`, `created_at`, `updated_at`, `contact_details`, `candidate_contact_details`) VALUES
(42, NULL, 'Free', 'weekly', '7 Days', 'full', 'JObs Display at Bottom Position', 'Limited Messages', 'Limited Whatsapp Chat', 'NO Calls', 'NO Share ', 'semi', 0, 0, 1, 'INR', 0, 'Daily Limit Count-5', NULL, '2025-11-11 09:03:13', '2025-11-11 09:03:13', 'Whatsapp Call', 'Basic Acccess for contact'),
(45, 'plan_RfeA0GFB7nTHQt', 'Silver', 'weekly', '7 Days', 'standard', 'JObs Display at 2nd Top', 'Semi-Limited Message', 'Limited Whatsapp Chat', 'Limited Calls', 'Limited Sharing', 'semi', 0, 0, 1, 'INR', 1, 'Daily Limit Count-5', NULL, '2025-11-14 14:05:12', '2025-11-14 14:14:49', 'Message/ Email', 'Limited Acccess for contact'),
(46, 'plan_RfeBbrBHNibhqF', 'Gold', 'weekly', '15 Days', 'full', 'JObs Display at Top', 'unlimited Messages', 'unlimited Whatsapp Chat', 'Unlimited Calls', 'Unlimited Sharing', 'unlimited', 1, 0, 1, 'INR', 5, 'Daily Limit Count-Unlimited', NULL, '2025-11-14 14:06:44', '2025-11-14 14:14:56', 'Direct Call', 'Full Acccess for contact');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `user_role` enum('employee','employer') NOT NULL,
  `status` enum('open','in_progress','closed') DEFAULT 'open',
  `admin_notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `name`, `mobile_number`, `email`, `message`, `user_role`, `status`, `admin_notes`, `created_at`, `updated_at`) VALUES
(3, 'sai', '9381850200', 'asaikrishnachary@gmail.com', 'adsewgtrt trhtrhet 6try5u e56yue56 56u', 'employee', 'open', 'Admin responded to user\n', '2025-09-19 15:38:11', '2025-09-22 15:22:52'),
(8, 'saikrushna', '9381850288', 'saikrushnakadarla01@gmail.com', 'dfgdfh tyhjghj yujtykjhyg', 'employer', 'open', 'Admin responded to the user', '2025-09-20 15:13:56', '2025-09-22 15:23:20'),
(9, 'Saikrishna', '9381850288', 'kadarlasaikrushna99@gmail.com', 'dfsbgfsdbngfngf thherd', 'employer', 'open', NULL, '2025-10-10 13:56:20', '2025-10-10 13:56:20');

-- --------------------------------------------------------

--
-- Table structure for table `tips`
--

CREATE TABLE `tips` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `excerpt` text DEFAULT NULL,
  `section` enum('Hiring','Relationship Management','Regulation','Trainings') NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `slug` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tips`
--

INSERT INTO `tips` (`id`, `title`, `category`, `content`, `excerpt`, `section`, `image_url`, `status`, `slug`, `meta_description`, `tags`, `created_at`, `updated_at`) VALUES
(1, '5 Tips for Better Productivity', 'Lifestyle', 'Staying productive requires focus and planning. Start by prioritizing tasks, minimizing distractions, and taking regular breaks to recharge', 'Quick tips to boost your productivity and get more done every day.', '', 'https://example.com/images/productivity-tips.jpg', 'published', 'productivity-tips-2025', 'Boost your daily productivity with these 5 simple and effective tips.', 'Productivity, Lifestyle, Work, Focus', '2025-09-19 20:56:44', '2025-09-19 20:56:44'),
(3, 'Meta Description', 'GOLD JEWELLERY', 'Meta Description Meta Description Meta Description Meta Description', 'Meta Description Meta Description', '', NULL, 'published', 'dsfwqedf dfqewf', 'Meta Description Meta DescriptionMeta Description', 'AI, Technology, Innovation, Future', '2025-10-10 18:42:59', '2025-10-10 18:42:59');

-- --------------------------------------------------------

--
-- Table structure for table `trainings`
--

CREATE TABLE `trainings` (
  `id` int(11) NOT NULL,
  `training_title` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `our_services` text DEFAULT NULL,
  `back_profile` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trainings`
--

INSERT INTO `trainings` (`id`, `training_title`, `location`, `rating`, `description`, `our_services`, `back_profile`, `profile_image`, `created_at`, `updated_at`) VALUES
(10, 'CSM Academy International', 'Singapore', 5.00, 'Training Description Training Description Training Description', 'Services', 'http://localhost:5001/uploads/trainings/training-1763102747291-400540422.png', 'http://localhost:5001/uploads/trainings/training-1763102747261-289239103.png', '2025-11-14 12:15:47', '2025-11-14 12:15:47'),
(11, 'CSA Academy International', 'Singapore', 5.00, 'Training Description training description', 'Services ', 'http://localhost:5001/uploads/trainings/training-1763102905737-397614622.png', 'http://localhost:5001/uploads/trainings/training-1763102905684-189642442.png', '2025-11-14 12:18:25', '2025-11-14 12:18:25'),
(12, 'MSC Academy International', 'India', 5.00, 'Training Description Training Description Training Description', 'Services', 'http://localhost:5001/uploads/trainings/training-1763102979669-666173410.png', 'http://localhost:5001/uploads/trainings/training-1763102979668-340154053.png', '2025-11-14 12:19:39', '2025-11-14 12:19:39');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `customer_id` varchar(100) DEFAULT NULL,
  `agency_uid` int(20) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `agency_mail` varchar(50) DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` varchar(200) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `language_preference` varchar(50) DEFAULT NULL,
  `source` varchar(20) DEFAULT 'Direct',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_verified` tinyint(1) DEFAULT 0,
  `last_login_date` datetime DEFAULT NULL,
  `last_notification_sent` datetime DEFAULT NULL,
  `subscription_plan_id` int(11) DEFAULT NULL,
  `razorpay_plan_id` varchar(50) DEFAULT NULL,
  `razorpay_subscription_id` varchar(50) DEFAULT NULL,
  `subscription` varchar(50) DEFAULT NULL,
  `plan_name` varchar(50) DEFAULT NULL,
  `plan_days` varchar(20) DEFAULT NULL,
  `plan_startdate` timestamp NULL DEFAULT NULL,
  `plan_enddate` timestamp NULL DEFAULT NULL,
  `next_duedate` timestamp NULL DEFAULT NULL,
  `payment_amount` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `subscription_status` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `customer_id`, `agency_uid`, `email`, `agency_mail`, `mobile_number`, `password`, `first_name`, `last_name`, `role`, `location`, `language_preference`, `source`, `created_at`, `is_verified`, `last_login_date`, `last_notification_sent`, `subscription_plan_id`, `razorpay_plan_id`, `razorpay_subscription_id`, `subscription`, `plan_name`, `plan_days`, `plan_startdate`, `plan_enddate`, `next_duedate`, `payment_amount`, `payment_status`, `subscription_status`) VALUES
(1, NULL, NULL, 'admin@gmail.com', NULL, '9381850288', 'admin@123', 'admin', '', 'admin', NULL, NULL, 'Direct', '2025-08-12 12:44:57', 1, '2025-11-14 19:15:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'cust_RbazREArr8ztCI', NULL, 'saikrushnakadarla01@gmail.com', NULL, '', 'sai@123', 'Saikrishna', 'krishna', 'employer', 'Hong Kong', 'English', 'Direct', '2025-08-13 07:28:39', 1, '2025-11-14 12:55:40', NULL, 42, NULL, NULL, 'Free', 'Free', '7 Days', '2025-11-10 18:30:00', '2025-11-17 18:30:00', '2025-11-17 18:30:00', '0', 'Paid', NULL),
(3, NULL, NULL, 'kadarlasaikrushna99@gmail.com', NULL, '9381850288', 'sai@123', 'Saikrishna', 'kadarla', 'job seeker', NULL, NULL, 'Direct', '2025-08-13 10:07:29', 1, '2025-11-14 18:02:38', '2025-11-07 19:16:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, NULL, NULL, 'kadarlasaikrushna01@gmail.com', NULL, NULL, 'sai@123', 'sai', 'krushna', 'job seeker', NULL, NULL, 'Direct', '2025-08-23 04:08:39', 1, '2025-10-31 20:53:35', '2025-09-05 19:16:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, NULL, NULL, 'duvvamanoj123456789@gmail.com', NULL, NULL, 'manoj@123', 'manoj', 'duvva', 'job seeker', NULL, NULL, 'Direct', '2025-09-05 18:08:20', 1, '2025-10-10 11:15:41', '2025-10-17 19:16:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, NULL, NULL, 'mogilojinaveen123@gmail.com', NULL, NULL, 'naveen123', 'naveen', 'mogiloju', 'job seeker', NULL, NULL, 'Direct', '2025-09-12 14:16:51', 1, '2025-09-12 20:09:08', '2025-10-13 19:16:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, NULL, NULL, 'saikadarla085@gmail.com', NULL, NULL, 'sai@123', 'sai', 'krishna', 'employer', NULL, NULL, 'Direct', '2025-10-31 15:14:56', 1, '2025-11-11 11:30:35', NULL, 24, NULL, NULL, 'cost', 'Gold', '60', '2025-11-04 18:30:00', '2025-12-05 05:28:46', NULL, '84', 'Pending', NULL),
(30, NULL, NULL, 'gudnet@yahoo.co.uk', NULL, NULL, 'gudent1234', 'Gudnet', 'guld', 'job seeker', NULL, NULL, 'Direct', '2025-11-07 10:12:26', 1, '2025-11-07 15:42:33', '2025-11-14 19:16:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'cust_RfdXn9VShaVggo', NULL, 'pavanimyana2000@gmail.com', NULL, NULL, 'pavani@123', 'Pavani', 'Myana', 'employer', NULL, NULL, 'Direct', '2025-11-14 13:29:02', 1, '2025-11-14 19:14:39', NULL, 45, 'plan_RfeA0GFB7nTHQt', 'sub_RfeCetJ7CHLQkm', 'Cost', 'Silver', '7 Days', '2025-11-13 18:30:00', '2025-11-20 18:30:00', '2025-11-20 18:30:00', '100', 'Paid', 'Active'),
(33, 'cust_RfdgkfaE1FVxQf', NULL, 'myanapavani570@gmail.com', NULL, NULL, 'pavani@123', 'Myana', 'Pavani', 'employer', NULL, NULL, 'Direct', '2025-11-14 13:37:31', 1, '2025-11-14 19:07:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agency_subscription_plans`
--
ALTER TABLE `agency_subscription_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `agency_user`
--
ALTER TABLE `agency_user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `candidate_report`
--
ALTER TABLE `candidate_report`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctor_profile`
--
ALTER TABLE `doctor_profile`
  ADD PRIMARY KEY (`dtr_id`),
  ADD UNIQUE KEY `dtr_user_id` (`dtr_user_id`),
  ADD KEY `idx_dtr_user_id` (`dtr_user_id`),
  ADD KEY `idx_dtr_user_name` (`dtr_user_name`),
  ADD KEY `idx_dtr_hospital_country` (`dtr_hospital_country`),
  ADD KEY `idx_dtr_experience` (`dtr_years_of_experience_doctor`);

--
-- Indexes for table `employer`
--
ALTER TABLE `employer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userid` (`userid`),
  ADD KEY `empuserid` (`empuserid`),
  ADD KEY `jobid` (`jobid`);

--
-- Indexes for table `job_position`
--
ALTER TABLE `job_position`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_reports`
--
ALTER TABLE `job_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_seekers`
--
ALTER TABLE `job_seekers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mails_table`
--
ALTER TABLE `mails_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `shortlist`
--
ALTER TABLE `shortlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tips`
--
ALTER TABLE `tips`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `trainings`
--
ALTER TABLE `trainings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agency_subscription_plans`
--
ALTER TABLE `agency_subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `agency_user`
--
ALTER TABLE `agency_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `candidate_report`
--
ALTER TABLE `candidate_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `doctor_profile`
--
ALTER TABLE `doctor_profile`
  MODIFY `dtr_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `employer`
--
ALTER TABLE `employer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `job_position`
--
ALTER TABLE `job_position`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `job_reports`
--
ALTER TABLE `job_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `job_seekers`
--
ALTER TABLE `job_seekers`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `mails_table`
--
ALTER TABLE `mails_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `shortlist`
--
ALTER TABLE `shortlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tips`
--
ALTER TABLE `tips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `trainings`
--
ALTER TABLE `trainings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `shortlist`
--
ALTER TABLE `shortlist`
  ADD CONSTRAINT `shortlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
