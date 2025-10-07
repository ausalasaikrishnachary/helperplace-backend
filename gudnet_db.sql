-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 07, 2025 at 05:13 PM
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
(2, '60 Days Plan', 'Candidate Posting - 800 AED | 200 USD', 'Candidate Contact - 900 AED | 300 USD', '2025-09-05 18:02:43', '2025-09-05 18:02:43'),
(3, '90 Days Plan', 'Candidate Posting - 800 AED | 200 USD', 'Candidate Contact - 900 AED | 300 USD', '2025-09-05 18:02:48', '2025-09-05 18:02:48');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login_date` datetime DEFAULT NULL,
  `last_notification_sent` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agency_user`
--

INSERT INTO `agency_user` (`id`, `role`, `password`, `agency_name`, `city`, `province`, `country`, `full_address`, `whatsapp_number_1`, `whatsapp_number_2`, `whatsapp_number_3`, `whatsapp_number_4`, `official_phone`, `email`, `website_url`, `company_logo`, `business_card`, `license_copy`, `owner_name`, `owner_nationality`, `owner_photo`, `owner_mobile`, `owner_email`, `manager_name`, `manager_nationality`, `manager_photo`, `manager_mobile`, `manager_email`, `created_at`, `updated_at`, `last_login_date`, `last_notification_sent`) VALUES
(3, 'agency_admin', 'agency@123', 'IIIQ Agency', 'New York', 'New York', 'India', '5-53, sircilla\r\n', '9381850288', '9381850280', '9381850281', '9381850282', '9874563215', 'saikrushnakadarla99@gmail.com', 'https://www.iiiqbets.com', 'uploads\\1755071310898.png', 'uploads\\1755071310899.png', 'uploads\\1755071310902.png', 'sai', 'india', 'uploads\\1755071310903.png', '9874563218', 'sai@gmail.com', 'ramakrishna', 'india', 'uploads\\1755071310904.png', '9856271632', 'ram@gmail.com', '2025-08-13 07:48:30', '2025-10-07 09:06:20', '2025-10-07 14:36:20', NULL);

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
(10, 3, 'Anonymous', 3, 'Saikrishna', 'saikrushnakadarla99@gmail.com', 'Fraudulent', 'gfbfg thhetthet', '2025-10-06 14:39:34');

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
(5, 3, 'Saikrishna', '[\"Dubai\"]', '[\"English\"]', '[{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-22\",\"license_expiry_date\":\"2025-09-19\"},{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-22\",\"license_expiry_date\":\"2025-09-19\"},{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-22\",\"license_expiry_date\":\"2025-09-19\"}]', '[\"Qatar\"]', 'Doctor ', 'General Surgeon', 'General Practitioner', 'Medical Educator', '[\"India\"]', 20000.00, 50000.00, 'USD', 0, '2025-08-17', 'Specialist Doctor', 'Sunday', 'Live in', 2, 2, 2, 'https://www.linkedin.com/in/your-name-12345/', 'SR Hospital', 'India', '2025-07-25', '2025-08-15', 'India', '[{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"india\",\"work_start_date\":\"2023-08-22\",\"work_end_date\":\"2025-07-22\"}]', 'Medical Director', '[\"DELF\"]', '[\"Yes\"]', 1, 'MBBS', 'MS', '[\"Cardiology\"]', '[\"Cardiothoracic Surgery\"]', 'FRCP', '', 'TOEFL', 'DELF', 'Elementary language skills', 'Cultural Competence in Healthcare', 1, 'India', 1, 'India', 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)', '2025-08-22 09:48:28', '2025-09-12 09:36:00'),
(6, 4, 'sai', '[\"Qatar\"]', '[\"English\"]', '[{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-05\",\"license_expiry_date\":\"2030-08-23\"},{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-05\",\"license_expiry_date\":\"2030-08-23\"}]', '[\"Qatar\"]', 'Doctor ', 'Cardiothoracic Surgeon', 'Medical Geneticist', 'Professor of Medicine', '[\"India\"]', 20000.00, 50000.00, 'USD', 1, '2025-08-22', 'Specialist Doctor', 'Sunday', 'Live in', 2, 2, 2, '', 'SR Hospital', 'India', '2025-07-26', '2025-08-17', 'India', '[{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"india\",\"work_start_date\":\"2023-08-23\",\"work_end_date\":\"2024-08-23\"},{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"India\",\"work_start_date\":\"2024-08-24\",\"work_end_date\":\"2025-08-01\"}]', 'Medical Director', '[\"DELF\"]', '[\"No\"]', 1, 'MBBS', 'MS', '[\"Cardiology\"]', '[\"Cardiothoracic Surgery\"]', 'FRCP', '', 'TOEFL', 'DELF', 'Advanced language skills', 'Cultural Competence in Healthcare', 1, 'India', 1, 'India', NULL, '2025-08-23 05:05:46', '2025-09-16 06:15:52'),
(7, 5, '', '[\"Qatar\"]', '[\"English\"]', '[{\"country_name\":\"Qatar\",\"license_issue_date\":\"2025-08-23\",\"license_expiry_date\":\"2029-04-23\"},{\"country_name\":\"India\",\"license_issue_date\":\"2025-08-23\",\"license_expiry_date\":\"2029-04-23\"}]', '[\"Qatar\"]', 'Doctor ', 'Cardiothoracic Surgeon', 'General Practitioner', 'Research Scientist', '[\"India\"]', 20000.00, 50000.00, 'USD', 0, '2025-08-30', 'Gastroenterologist', 'Sunday', 'Live in', 3, 3, 3, '', 'Indian Hospital', 'India', '2025-08-19', '2025-08-19', '', '[{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"India\",\"work_start_date\":\"2025-08-23\",\"work_end_date\":\"2025-08-29\"}]', 'Medical Director', '[\"DELF\"]', '[\"Yes\"]', 1, 'MBBS', 'MS', '[\"Cardiology\"]', '[\"Cardiothoracic Surgery\"]', 'FRCP', '', 'TOEFL', 'DELF', 'Proficient language skills', 'Cultural Competence in Healthcare', 1, 'India', 1, 'India', NULL, '2025-08-23 10:47:03', '2025-08-30 05:08:37'),
(8, 8, 'ramu', '[\"Qatar\"]', '[\"English\"]', '[{\"country_name\":\"Qatar\",\"license_issue_date\":\"2023-02-23\",\"license_expiry_date\":\"2028-10-12\"},{\"country_name\":\"India\",\"license_issue_date\":\"2023-02-23\",\"license_expiry_date\":\"2028-10-12\"}]', '[\"Qatar\"]', 'Anesthesiologist', 'General Surgeon', 'Pain Management Specialist', 'Medical Educator', '[\"India\"]', 50000.00, 100000.00, 'USD', 1, '2025-09-12', 'Oncologist', 'Sunday', 'Live in', 2, 2, 2, '', 'SR Hospital', 'India', '2022-10-12', '2024-10-12', 'India', '[{\"previous_hospital_name\":\"Hospital\",\"hospital_country_name\":\"India\",\"work_start_date\":\"2024-10-12\",\"work_end_date\":\"2025-09-12\"}]', 'Medical Director', '[\"DELF\"]', '[\"No\"]', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-12 16:40:34', '2025-09-12 16:42:28');

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
  `name` varchar(255) DEFAULT NULL,
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
  `currency_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employer`
--

INSERT INTO `employer` (`id`, `user_id`, `temporary_id`, `emp_name`, `domestic_worker_category`, `job_type`, `job_title`, `job_description`, `job_starting_date`, `prefer_contract_status`, `looking_worker_for`, `candidate_experience`, `prefer_experience`, `preferred_years_of_experience`, `gulf_experience_years`, `total_experience_years`, `candidates_country_experience`, `preferred_candidates_country`, `preferred_language_for_worker`, `locaion_preference`, `most_important_skill`, `main_skills`, `cooking_skills`, `other_skills`, `gender`, `religion`, `education_level`, `age`, `working_city`, `state_or_province`, `name`, `email_id`, `whatsapp_number_country_code`, `whatsapp_number`, `phone_number_country_code`, `phone_number`, `nationality`, `organization_name`, `offer_for_selected_candidates`, `country_currency`, `minimum_monthly_salary`, `maximum_monthly_salary`, `negotiable`, `adults`, `children`, `type_of_house`, `rooms`, `bathrooms`, `have_pets`, `worker_nationality`, `phone_country_code`, `location_preference`, `domestic_worker_name`, `have_domestic_worker`, `nationality_of_domestic_worker`, `status`, `subscription`, `plan_name`, `plan_days`, `plan_startdate`, `plan_enddate`, `payment_amount`, `payment_status`, `posted_by`, `view_count`, `posted_on`, `profile_photo`, `offer`, `profile_photo_url`, `subscription_plan_id`, `columns_percentage`, `currency_name`) VALUES
(2, 2, 2, 'Saikrishna', 'Nanny', 'Full Time', 'Live-in Nanny for Infant Care', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-09-04 07:30:00', 'Any', '', 'Fresher', NULL, '[\"1-2 year\"]', 1, 1, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\",\"Elderly care\",\"Child care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Atheist', 'Bachelor', '20', 'Dubai', 'Dubai Emirate', 'saikrishna', 'saikrushnakadarla01@gmail.com', '', '', NULL, '', 'Indian', 'iiiq', '[]', '', 0.00, 0.00, 0, 0, 0, '', 0, 0, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-22 07:30:00', '2025-10-07 07:30:00', '0', 'Paid', 'Direct', 16, '2025-08-17 04:41:56', '/images/profile_photo-1759554103645.png', NULL, 'http://localhost:5000/images/profile_photo-1759554103645.png', '1', '76', NULL),
(5, 2, 4, 'Saikrishna', 'Nanny', 'Full Time', 'Live-in Nanny for Infant Care', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-09-10 13:00:00', '', '', 'Fresher', NULL, '[]', 2, 2, '[\"Dubai\"]', '[]', '[]', NULL, '', '[]', '[]', '[]', '', '', '', '0', 'Dubai', 'Dubai Emirate', '', '', '', '', NULL, '', '', '', '[]', '', 0.00, 0.00, 0, 0, 0, '', 0, 0, 0, '', '', '', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-23 09:46:17', '2025-10-08 09:46:22', NULL, NULL, 'Direct', 1, '2025-09-02 04:10:30', '/images/profile_photo-1757097690536.png', NULL, 'http://localhost:5000/images/profile_photo-1757097690536.png', '1', '59', NULL),
(11, 4, 8, 'sai', 'Nanny', 'Full Time', NULL, NULL, '2025-09-15 07:30:00', NULL, NULL, 'Fresher', NULL, '[]', 1, 1, '[\"Dubai\"]', '[]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', NULL, NULL, NULL, NULL, 'Dubai', 'Dubai Emirate', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-23 15:17:39', '2025-09-08 15:17:44', NULL, NULL, 'Direct', NULL, '2025-09-09 00:43:40', NULL, NULL, NULL, NULL, '36', NULL),
(13, 2, 9, 'Saikrishna', 'Nanny', 'Full Time', 'Dubai family looking for Nanny', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-09-10 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 1, 1, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', 'Any', 'Atheist', 'Bachelor', '18', 'Abu Dhabi', 'Dubai Emirate', 'saikrishna', 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Do', 15000.00, 50000.00, 1, 2, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-23 09:47:51', '2025-10-08 09:47:54', NULL, NULL, 'Direct', NULL, '2025-09-10 22:09:56', '/images/profile_photo-1757584740930.png', NULL, 'http://localhost:5000/images/profile_photo-1757584740930.png', '1', '80', NULL),
(19, 2, 15, 'Saikrishna', 'Nanny', 'Full Time', 'Dubai family looking for Nanny', 'Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n', '2025-09-18 20:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 1, 1, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '25-30', 'Dubai', 'Dubai Emirate', 'saikrishna', 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 2500.00, 5000.00, 1, 3, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-23 09:48:00', '2025-10-08 09:48:03', NULL, NULL, 'Direct', 3, '2025-09-12 12:38:49', '/images/profile_photo-1757740276788.png', NULL, 'http://localhost:5000/images/profile_photo-1757740276788.png', '2', '81', NULL),
(20, 2, 16, 'Saikrishna', 'Nanny', 'Part Time', 'Nanny for Infant Care Nanny for Infant Care ', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates ', '2025-09-21 18:30:00', 'Any', 'For my family', 'Domestic', NULL, '[\"1-2 year\"]', 3, 3, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', 'saikrushna', 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 2500.00, 5000.00, 1, 2, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-23 04:18:14', '2025-10-08 04:18:16', NULL, NULL, 'Direct', NULL, '2025-09-17 17:33:06', '/images/profile_photo-1758641005155.png', NULL, 'http://localhost:5000/images/profile_photo-1758191790966.png', '2', '4', NULL),
(21, 2, 17, 'Saikrishna', 'Nanny', 'Full Time', 'Nanny for Infant Care Nanny for Infant Care ', 'Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n Please provide information about the job for the selected candidates\n', '2025-09-24 13:00:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 2, 2, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '20-25', 'Dubai', 'Dubai Emirate', 'saikrushna', 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 2500.00, 5000.00, 1, 2, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-23 04:18:22', '2025-10-08 04:18:39', NULL, NULL, 'Direct', 1, '2025-09-18 23:49:50', '/images/profile_photo-1758259318147.png', NULL, 'http://localhost:5000/images/profile_photo-1758259318147.png', '2', '81', NULL),
(22, 2, 18, 'Saikrishna', 'Nanny', 'Full Time', 'Nanny for Infant Care Nanny for Infant Care ', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates ', '2025-09-20 07:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 2, 2, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', 'saikrushna', 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 2500.00, 5000.00, 1, 3, 3, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-22 17:18:50', '2025-10-07 17:18:55', NULL, NULL, 'Direct', 2, '2025-09-17 14:53:21', '/images/profile_photo-1758259939884.png', NULL, 'http://localhost:5000/images/profile_photo-1758259939884.png', '2', '81', NULL),
(23, 2, 19, 'Saikrishna', 'Nanny', 'Full Time', NULL, NULL, '2025-09-27 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 6, 10, '[\"Dubai\"]', '[\"Philippines\"]', '[]', NULL, 'Baby care', '[\"Baby care\",\"Postpartum care\"]', '[\"Arabic\",\"Indonesian\"]', '[\"Baking\",\"Yoga instruction\"]', 'Any', 'Atheist', 'High school', '20-25', 'Dubai', 'Dubai', 'Rahul kumar', 'dusarahul21@gmail.com', '', '9392398856', NULL, '9392398856', 'Indian', 'KRIKA MKB Corporation Private Limited', '[\"Free food\"]', 'AED (UAE Dirham)', 40000.00, 50000.00, 1, 2, 1, 'Apartment', 1, 1, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, NULL, NULL, '2025-09-23 04:19:00', '2025-10-08 04:19:05', NULL, NULL, 'Direct', NULL, '2025-09-22 06:28:34', NULL, NULL, NULL, NULL, '72', NULL),
(24, 2, 20, 'Saikrishna', 'Nanny', 'Full Time', 'Live-in Nanny for Infant Care', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-09-13 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 2, 2, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', 'saikrushna', 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 1500.00, 2500.00, 1, 3, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-21 20:30:00', '2025-10-06 20:30:00', NULL, NULL, 'Direct', NULL, '2025-09-20 16:05:13', '/images/profile_photo-1759554150852.png', NULL, 'http://localhost:5000cartoon1', NULL, '4', NULL),
(25, 2, 21, 'Saikrishna', 'Nanny', 'Full Time', 'Dubai family looking for Nanny', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates ', '2025-09-24 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 1, 1, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Baby care', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', 'saikrishna', 'saikrushnakadarla01@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 1500.00, 2500.00, 1, 2, 2, '', 2, 2, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, 'Silver', NULL, '2025-09-22 13:00:00', '2025-10-07 13:00:00', NULL, NULL, 'Direct', NULL, '2025-09-22 17:09:00', 'cartoon1', NULL, NULL, NULL, '76', NULL),
(26, 11, 22, 'sai', 'Nanny', 'Full Time', 'Nanny for Infant Care Nanny for Infant Care', 'Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates Please provide information about the job for the selected candidates', '2025-09-28 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"1-2 year\"]', 1, 1, '[\"Dubai\"]', '[\"India\"]', '[]', NULL, 'Indian', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', 'saikrushna', 'saikdarla085@gmail.com', '', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 1500.00, 2500.00, 1, 2, 2, 'Villa', 3, 3, 0, '', '', 'Any location', NULL, 0, NULL, 'Approved', NULL, NULL, NULL, NULL, '2025-10-08 02:00:00', NULL, NULL, 'Direct', NULL, '2025-09-23 17:46:49', '/images/profile_photo-1758689313531.png', NULL, 'http://localhost:5000/images/profile_photo-1758689313531.png', NULL, '76', NULL),
(27, 2, 23, 'Saikrishna', 'Nanny', 'Full Time', 'Dubai family looking for Nanny', 'Please provide information about the job for the selected candidates&nbsp;<span style=\"font-weight: 600;\">Please provide information about the job for the selected candidates&nbsp;</span><span style=\"font-weight: 600;\">Please provide information about the job for the selected candidates&nbsp;</span>Please provide information about the job for the selected candidates&nbsp;<span style=\"font-weight: 600;\">Please provide information about the job for the selected candidates&nbsp;</span><span style=\"font-weight: 600;\">Please provide information about the job for the selected candidat</span>', '2025-10-10 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 0, 0, '[\"Italy\"]', '[\"Kenya\"]', '\"English\"', NULL, 'Baby care', '[\"Baby care\",\"Child care\",\"Teen care\"]', '[\"Indian\",\"Arabic\",\"Italian\"]', '[\"Baking\",\"Caregiver\",\"Car wash\",\"Computer\"]', 'Any', 'Hindu', 'Bachelor', '20-25', 'Dubai', 'Dubai Emirate', 'saikrushna', 'saikrushnakadarla01@gmail.com', '+91 (India', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 1500.00, 2500.00, 0, 2, 2, 'Apartment', 0, 0, 0, '', '+91 (India', 'Any location', NULL, 0, NULL, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Direct', NULL, '2025-10-04 11:22:17', 'cartoon3', NULL, NULL, NULL, '10', NULL),
(28, 17, 24, 'ramu', 'Nanny', 'Full Time', 'Dubai family looking for Nanny', '<span style=\"font-weight: 600;\">Please provide information about the job for the selected candidates</span><span style=\"font-weight: 600;\">Please provide information about the job for the selected candidates</span><span style=\"font-weight: 600;\">&nbsp;Please provide information about the job for the selected candidates</span><span style=\"font-weight: 600;\">&nbsp;Please provide information about the job for the selected candidates</span><span style=\"font-weight: 600;\">&nbsp;Please provide information about the job for the selected candidates</span><span style=\"font-weight: 600;\">&nbsp;Please provide information about the job for the selected candidates&nbsp;</span>', '2025-10-10 18:30:00', 'Any', 'For my family', 'Fresher', NULL, '[\"Fresher\"]', 0, 0, '[\"Dubai\"]', '[\"India\"]', '\"English\"', NULL, 'Baby care', '[\"Baby care\"]', '[\"Arabic\"]', '[\"Baking\"]', 'Any', 'Hindu', '12th', '20-25', 'Dubai', 'Dubai Emirate', 'saikrushna', 'saikdarla085@gmail.com', '+91 (India', '9381850288', NULL, '9381850288', 'Indian', 'iiiq', '[\"Free food\"]', 'USD (US Dollar)', 1500.00, 2000.00, 1, 2, 2, 'Villa', 3, 3, 0, '', '+91 (India', 'Any location', NULL, 0, NULL, 'Pending', NULL, 'Silver', NULL, '2025-10-03 18:30:00', '2025-10-18 18:30:00', NULL, NULL, 'Direct', NULL, '2025-10-04 16:42:17', 'http://localhost:5000/images/profile_photo-1759576458073.png', NULL, NULL, NULL, '7', NULL);

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
(7, 3, 3, 29, '2025-10-06 16:28:20', 'Applied');

-- --------------------------------------------------------

--
-- Table structure for table `job_position`
--

CREATE TABLE `job_position` (
  `id` int(11) NOT NULL,
  `position` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_position`
--

INSERT INTO `job_position` (`id`, `position`, `category`) VALUES
(1, 'Maid', 'Domestic'),
(2, 'Driver', 'Domestic'),
(3, 'Cook', 'Domestic'),
(4, 'Nanny', 'Domestic'),
(5, 'Nurse', 'Domestic'),
(6, 'Houseboy', 'Domestic'),
(7, 'Tailor', 'Domestic'),
(8, 'Teacher', 'Domestic'),
(9, 'Trainer', 'Domestic'),
(10, 'Gardener', 'Domestic'),
(11, 'Butler', 'Domestic'),
(12, 'Housekeeper', 'Domestic'),
(13, 'Laundry Worker', 'Domestic'),
(14, 'Personal Assistant', 'Domestic'),
(15, 'Caregiver', 'Domestic'),
(16, 'Elder Care Companion', 'Domestic'),
(17, 'Pet Sitter/Dog Walker', 'Domestic'),
(18, 'House Manager', 'Domestic'),
(19, 'Cleaner', 'Domestic'),
(20, 'Maintenance Worker/Handyman', 'Domestic'),
(21, 'Baby Sitter', 'Domestic'),
(22, 'Tutor', 'Domestic'),
(23, 'Chauffeur', 'Domestic'),
(24, 'Housemaid', 'Domestic'),
(25, 'Kitchen Staff', 'Domestic'),
(26, 'Dining Room Attendant', 'Domestic'),
(27, 'Personal Chef', 'Domestic'),
(28, 'Event Coordinator', 'Domestic'),
(29, 'Household Administrator', 'Domestic'),
(30, 'Domestic Assistant', 'Domestic'),
(34, 'Doctor ', 'Company'),
(35, 'Marketing Executive', 'Company'),
(36, 'House Teacher', 'Domestic helper');

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
  `has_valid_passport` tinyint(1) DEFAULT 0,
  `category` varchar(100) DEFAULT NULL,
  `job_position` varchar(100) DEFAULT NULL,
  `other_position` varchar(100) DEFAULT NULL,
  `is_ban` varchar(20) DEFAULT NULL,
  `ban_reason` varchar(100) DEFAULT NULL,
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
  `columns_percentage` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_seekers`
--

INSERT INTO `job_seekers` (`id`, `user_id`, `agency_uid`, `first_name`, `last_name`, `age`, `gender`, `marital_status`, `nationality`, `religion`, `current_country`, `total_work_experience`, `email_id`, `agency_mail`, `whatsapp_country_code`, `whatsapp_number`, `telegram_country_code`, `telegram_number`, `botim_country_code`, `botim_number`, `has_valid_passport`, `category`, `job_position`, `other_position`, `is_ban`, `ban_reason`, `job_type`, `preferred_start_date`, `current_work_status`, `visa_type`, `visa_issued_date`, `visa_expiry_date`, `noc_or_transfer_letter`, `preffered_job_locations`, `other_job_location`, `previous_country_worked`, `previous_employer_house_duties`, `expected_monthly_salary`, `expected_monthly_salary_usd`, `expected_monthly_salary_qar`, `day_off_preference`, `accommodation_preference`, `language`, `height`, `weight`, `color`, `main_skills`, `cooking_skills`, `other_skills`, `personality`, `otherLanguage`, `otherCookingSkill`, `experience`, `reference_letter`, `education`, `profile_photo`, `show_profile_photo`, `resume_description`, `subscription`, `upload_video`, `video_file_size`, `video_file_type`, `networking_opportunities`, `source`, `verification_status`, `video_upload_date`, `subscription_plan`, `candidate_posting`, `candidate_contact`, `plan_days`, `plan_startdate`, `plan_enddate`, `created_at`, `driving_license_country`, `driving_license_countries`, `other_driving_license_country`, `car_type`, `car_types_driven`, `previous_car`, `previous_cars_driven`, `other_previous_car`, `current_hospital_name`, `current_hospital_country`, `current_employment_date`, `current_finish_contract_date`, `previous_hospital_name`, `previous_hospital_country`, `previous_employment_date`, `previous_finish_contract_date`, `nursing_qualifications`, `professional_qualifications`, `specialized_qualifications`, `language_qualifications`, `has_prometric_certificate`, `prometric_issue_date`, `prometric_expiry_date`, `prometric_issued_country`, `has_dataflow_certificate`, `dataflow_issue_date`, `dataflow_expiry_date`, `dataflow_issued_country`, `cultural_adaptation_qualifications`, `nursing_job_countries`, `language_skills`, `nursing_license_countries`, `other_nursing_license_country`, `nursing_license_issue_date`, `nursing_license_expiry_date`, `has_nursing_license`, `no_of_children`, `nursing_positions`, `offer`, `columns_percentage`) VALUES
(3, 3, NULL, 'Saikrishna', 'kadarla', 22, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'kadarlasaikrushna99@gmail.com', NULL, '+91(India)', '8106815633', '+91(India)', '9381850288', '+91(India)', '9381850288', 0, 'Company', '[\"Marketing Executive\"]', NULL, '0', NULL, 'Full Time', '2025-05-04', 'Finish contract', 'No visa', NULL, NULL, 0, '[\"Qatar\"]', '', NULL, NULL, 11999.00, 143.99, 527.96, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '158-160 cm', '60-65 kg', 'Fair', '[\"Child care\"]', '[\"Indian\"]', '[\"Caregiver\"]', '[\"Good listener\"]', '', '', '[{\"job_position\":[\"Cook\"],\"country\":[\"Qatar\"],\"other_country\":\"\",\"start_year\":\"2023\",\"end_year\":\"2024\",\"employer_type\":\"Company\",\"employer_nationality\":\"Qatar\",\"house_duties\":[\"Cook\"],\"join_date\":\"4\",\"join_month\":\"January\",\"join_year\":\"2023\",\"exit_date\":\"7\",\"exit_month\":\"June\",\"exit_year\":\"2024\"}]', 0, '[{\"level\":\"Bachelor\",\"course\":\"4 year\",\"status\":\"Yes\",\"completion_year\":\"2022\"}]', NULL, 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '0', 'Direct', 'Verified', '2025-10-07 14:42:11', NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-18 08:43:02', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', '10% offer', '2'),
(5, 4, NULL, 'sai', 'krushna', 22, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'kadarlasaikrushna01@gmail.com', NULL, '+91(India)', '9381850288', '+91(India)', '9381850288', '+91(India)', '9381850288', 0, 'Domestic Helper', '[\"Doctor \"]', NULL, '0', NULL, 'Full Time', '2025-08-04', 'Finish contract', 'No visa', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '/images/profile_photo-1757096698040.jpg', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) ', '1', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '1', 'Direct', 'Verified', '2025-09-26 09:59:24', NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-23 05:04:17', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, '45'),
(6, 5, 2, 'sai', 'krishna', 23, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'asaikrishnachary@gmail.com', 'saikrushnakadarla99@gmail.com', '+91(India)', '8106815633', '+91(India)', '9381850200', '+91(India)', '9381850200', 0, 'Domestic Helper', '[\"Cook\"]', NULL, '0', NULL, 'Full Time', '2025-08-10', 'Finish contract', 'No visa', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '/images/profile_photo-1756530639168.jpg', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n\n \n \n', NULL, NULL, NULL, NULL, NULL, 'Agency', 'Verified', '2025-09-26 04:26:11', NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-23 10:34:10', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, '44'),
(7, 6, NULL, 'manoj', 'duvva', 25, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'duvvamanoj123456789@gmail.com', NULL, '+91(India)', '9381850200', '+91(India)', '9381850200', '+91(India)', '9381850200', 0, 'Company', '[\"Nurse\"]', NULL, '0', NULL, 'Full Time', '0000-00-00', 'Finish contract', 'No visa', '2025-09-02', '2025-09-25', 0, '[\"Dubai\"]', 'India', NULL, NULL, 150000.00, 1800.00, 6600.00, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '158-160 cm', '55-60 kg', 'Fair', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Teacher\"],\"country\":[\"Qatar\"],\"other_country\":\"\",\"start_year\":\"2022\",\"end_year\":\"2023\",\"employer_type\":\"Family\",\"employer_nationality\":\"Dubai\",\"house_duties\":[\"Teacher\"],\"join_date\":\"2\",\"join_month\":\"April\",\"join_year\":\"2022\",\"exit_date\":\"2\",\"exit_month\":\"March\",\"exit_year\":\"2023\"}]', 0, '[{\"level\":\"Bachelor\",\"course\":\"4 year\",\"status\":\"Yes\",\"completion_year\":\"2023\"}]', '/images/profile_photo-1757096401937.jpg', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n\n\n\n\n\n\n ', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '0', 'Direct', 'Verified', '2025-09-17 08:26:21', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-05 18:09:04', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, 'SR Hospital', 'India', '2025-09-05', '2025-09-17', 'Hospital', 'India', '2025-09-05', '2025-09-15', '[\"ANM\"]', '[\"Registered Nurse\"]', '[\"Critical Care Registered Nurse\"]', '[\"TOEFL\"]', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, '[\"Transcultural Nursing\"]', '[\"Dubai\"]', '[\"English\"]', '[\"Qatar\"]', NULL, '2025-09-05', '2025-09-24', 1, '2', '[\"Registered Nurse\"]', NULL, '34'),
(8, 7, NULL, 'pavani', 'myana', 23, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'pavanimyana2000@gmail.com', NULL, '+91(India)', '9676704365', '+91(India)', '9381850208', '+91(India)', '9381850208', 0, 'Company', '[\"Nurse\"]', NULL, '0', NULL, 'Full Time', '0000-00-00', 'Finish contract', 'No visa', NULL, NULL, 0, '[\"Qatar\"]', 'India', NULL, NULL, 50000.00, 600.00, 2200.00, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '160-162 cm', '60-65 kg', 'Fair', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Nurse\"],\"country\":[\"Dubai\"],\"other_country\":\"\",\"start_year\":\"2022\",\"end_year\":\"2023\",\"employer_type\":\"Company\",\"employer_nationality\":\"Dubai\",\"house_duties\":[\"Nurse\"],\"join_date\":\"\",\"join_month\":\"January\",\"join_year\":\"2022\",\"exit_date\":\"7\",\"exit_month\":\"July\",\"exit_year\":\"2023\"}]', 0, '[{\"level\":\"Bachelor\",\"course\":\"4 year\",\"status\":\"Yes\",\"completion_year\":\"2022\"}]', NULL, 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M', NULL, NULL, '0', 'Direct', 'Verified', '2025-09-26 10:11:21', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-06 05:32:42', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, 'SR Hospitals', 'India', '2025-09-05', '2025-09-25', 'Hospitals', 'India', '2025-08-05', '2025-09-05', '[\"ANM\"]', '[\"Registered Nurse\"]', '[\"Critical Care Registered Nurse\"]', '[\"TOEFL\"]', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, '[\"Transcultural Nursing\"]', '[\"Dubai\"]', '[\"English\"]', '[\"Qatar\"]', NULL, '2025-09-05', '2025-11-12', 1, '1', '[\"Registered Nurse\"]', '10% Limited offer', '1'),
(9, 10, NULL, 'naveen', 'mogiloju', 27, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'mogilojunaveen123@gmail.com', NULL, '+91(India)', '9381850200', '+91(India)', '9381850200', '+91(India)', '9381850200', 0, 'Domestic Helper', '[\"Driver\"]', NULL, '0', NULL, 'Full Time', '2025-09-17', 'Finish contract', 'No visa', NULL, NULL, 0, '[\"Qatar\"]', '', NULL, NULL, 25000.00, 300.00, 1100.00, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '158-160 cm', '60-65 kg', 'Fair', '[\"Marketing\"]', '[]', '[\"Driving Lic.\"]', '[\"Honest\"]', '', '', '[{\"job_position\":[\"Driver\"],\"country\":[\"Qatar\"],\"other_country\":\"\",\"start_year\":\"2022\",\"end_year\":\"2024\",\"employer_type\":\"Family\",\"employer_nationality\":\"Qatar\",\"house_duties\":[\"Driver\"],\"join_date\":\"6\",\"join_month\":\"June\",\"join_year\":\"2022\",\"exit_date\":\"6\",\"exit_month\":\"June\",\"exit_year\":\"2024\"}]', 0, '[{\"level\":\"12th\",\"course\":\"2 year\",\"status\":\"Yes\",\"completion_year\":\"2021\"}]', '/images/profile_photo-1757687982276.png', 1, 'Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality)\n', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '0', 'Direct', 'Verified', '2025-09-12 14:39:42', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-12 14:19:35', '[\"Qatar\"]', NULL, NULL, '[\"Manual\"]', NULL, '[\"Land Cruiser\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, '3'),
(10, 8, NULL, 'ramu', 'ram', 24, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'myanapavani570@gmail.com', NULL, '+91(India)', '9381850201', '+91(India)', '9381850201', '+91(India)', '9381850201', 0, 'Company', '[\"Doctor \"]', NULL, '0', NULL, 'Full Time', '2025-09-17', 'Finish contract', 'No visa', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Direct', 'Verified', '2025-09-12 16:46:08', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-12 16:39:22', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, '40'),
(11, 15, NULL, 'krishna', 'kadarla', 22, 'Male', 'Single', 'India', 'Hindu', 'India', '2 years', 'saikdarla085@gmail.com', NULL, '+91(India)', '9381850288', '+91(India)', '9381850288', '+91(India)', '9381850288', 0, 'Domestic Helper', '[\"Nanny\"]', NULL, '1', 'RUN AWAY', 'Full Time', '0000-00-00', 'Finish contract', 'Need Family Visa', '2025-08-04', '2026-03-03', 0, '[\"India\"]', '', NULL, NULL, 25000.00, 300.00, 1100.00, 'weekly', 'Live in', '[{\"language\":\"English\",\"speaking_level\":\"Fluent\",\"can_read\":true,\"can_write\":true}]', '158-160 cm', '55-60 kg', 'Fair', '[\"Baby care\"]', '[\"Indian\"]', '[\"Baking\"]', '[\"Hard working\"]', '', '', '[{\"job_position\":[\"Nany\"],\"country\":[\"India\"],\"other_country\":\"\",\"start_year\":\"2024\",\"end_year\":\"2025\",\"employer_type\":\"Family\",\"employer_nationality\":\"India\",\"house_duties\":[\"Nany\"],\"join_date\":\"3\",\"join_month\":\"January\",\"join_year\":\"2024\",\"exit_date\":\"4\",\"exit_month\":\"February\",\"exit_year\":\"2025\"}]', 0, '[{\"level\":\"12th\",\"course\":\"2 year\",\"status\":\"Yes\",\"completion_year\":\"2021\"}]', '/images/profile_photo-1759555739827.png', 1, 'Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n\n Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality) Resume Description (Explain your work experience and personality)\n\n \n', '0', 'https://www.youtube.com/watch?v=vor_Ue_nJ6M&t=5s', NULL, NULL, '0', 'Direct', 'Pending', '2025-10-04 05:28:59', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-04 05:16:03', '[]', NULL, NULL, '[]', NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL, 1, NULL, '[]', NULL, '3');

-- --------------------------------------------------------

--
-- Table structure for table `mails_table`
--

CREATE TABLE `mails_table` (
  `id` int(11) NOT NULL,
  `emp_id` int(11) NOT NULL,
  `job_seeker_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mails_table`
--

INSERT INTO `mails_table` (`id`, `emp_id`, `job_seeker_id`, `message`, `created_at`) VALUES
(1, 1, 5, 'Hello, we would like to schedule an interview with you next week.', '2025-08-13 14:10:15'),
(2, 3, 6, 'Hello, we would like to schedule an interview with you next week.', '2025-08-14 07:28:15'),
(3, 2, 3, 'hii', '2025-08-14 07:43:33'),
(4, 2, 3, 'hi Saikrushna', '2025-08-23 05:25:27'),
(5, 2, 3, 'hai', '2025-09-26 14:17:32'),
(6, 2, 3, 'I\'m interested', '2025-09-26 15:24:37'),
(7, 2, 3, 'I\'m from Gulf worker company. I am intersted on your Profile', '2025-10-04 11:26:59'),
(8, 2, 3, 'I\'m interested', '2025-10-06 06:34:25'),
(9, 2, 3, 'write something', '2025-10-06 12:05:50'),
(10, 3, 3, 'I\'m interested', '2025-10-06 14:39:56'),
(11, 3, 3, 'I\'m interested', '2025-10-07 08:36:44');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `title`, `category`, `publish_date`, `read_time`, `excerpt`, `content`, `image_url`, `status`, `slug`, `meta_description`, `tags`, `created_at`, `updated_at`) VALUES
(7, 'Article Title', 'Domestic Helper', '2025-09-20', '7 min read', 'fdg ghth ethytr tryetut  tyu5yu4t', 'trhytruh e56u6u 67u 67 67iy6ujj ghnhnh dyjtygjety tyj ety tyj etyju ety', 'http://localhost:5000/uploads/image-1758365273400-593343845.png', 'draft', 'productivity-tips-2025', 'dfgdfs  tyutyhjtyhgtfr gfhgfrhbgfhnhmetyhjtrsg trhgtrhty tryhu tryetjety yuhjetyd', 'AI, Technology, Innovation, Future', '2025-09-20 10:47:53', '2025-09-20 10:47:53');

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
  `employer_source` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `listing_duration_days` varchar(20) NOT NULL,
  `access_type` varchar(20) NOT NULL,
  `job_position_priority` varchar(20) NOT NULL,
  `messaging_limit` varchar(20) NOT NULL,
  `whatsapp_access` varchar(30) NOT NULL,
  `direct_call_access` varchar(20) NOT NULL,
  `share_option` varchar(20) NOT NULL,
  `view_limit` varchar(20) NOT NULL,
  `alerts_for_new_cvs` tinyint(1) DEFAULT 0,
  `full_contact_details` tinyint(1) DEFAULT 0,
  `activate_deactivate_option` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `plan_name`, `listing_duration_days`, `access_type`, `job_position_priority`, `messaging_limit`, `whatsapp_access`, `direct_call_access`, `share_option`, `view_limit`, `alerts_for_new_cvs`, `full_contact_details`, `activate_deactivate_option`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Free Posting', 'Listing for 7 days', 'Limited Access', 'Job posted at bottom', 'Employer & Employee ', 'WhatsApp message Limited', 'Limited Direct call', 'Limited Share', 'Limited View', 0, 0, 0, NULL, '2025-09-05 18:01:53', '2025-09-05 18:01:53'),
(2, 'Silver', 'Listing for 15 days', 'Limited Access', 'Job listed at 2nd po', 'Unlimited messaging ', 'WhatsApp message limited acces', 'Direct call', 'Share Option Unlimit', 'Unlimited View', 1, 0, 0, NULL, '2025-09-05 18:02:07', '2025-09-05 18:02:07'),
(3, 'Gold', 'Listing for Unlimite', 'Unlimited Access', 'Job listed at Top po', 'Unlimited messaging ', 'Direct WhatsApp chat enabled', 'Direct call', 'Share Option Unlimit', 'Unlimited View', 1, 1, 1, NULL, '2025-09-05 18:02:23', '2025-09-05 18:02:23');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `name`, `mobile_number`, `email`, `message`, `user_role`, `status`, `admin_notes`, `created_at`, `updated_at`) VALUES
(3, 'sai', '9381850200', 'asaikrishnachary@gmail.com', 'adsewgtrt trhtrhet 6try5u e56yue56 56u', 'employee', 'open', 'Admin responded to user\n', '2025-09-19 10:08:11', '2025-09-22 09:52:52'),
(8, 'saikrushna', '9381850288', 'saikrushnakadarla01@gmail.com', 'dfgdfh tyhjghj yujtykjhyg', 'employer', 'open', 'Admin responded to the user', '2025-09-20 09:43:56', '2025-09-22 09:53:20');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tips`
--

INSERT INTO `tips` (`id`, `title`, `category`, `content`, `excerpt`, `section`, `image_url`, `status`, `slug`, `meta_description`, `tags`, `created_at`, `updated_at`) VALUES
(1, '5 Tips for Better Productivity', 'Lifestyle', 'Staying productive requires focus and planning. Start by prioritizing tasks, minimizing distractions, and taking regular breaks to recharge', 'Quick tips to boost your productivity and get more done every day.', '', 'https://example.com/images/productivity-tips.jpg', 'published', 'productivity-tips-2025', 'Boost your daily productivity with these 5 simple and effective tips.', 'Productivity, Lifestyle, Work, Focus', '2025-09-19 15:26:44', '2025-09-19 15:26:44');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trainings`
--

INSERT INTO `trainings` (`id`, `training_title`, `location`, `rating`, `description`, `our_services`, `back_profile`, `profile_image`, `created_at`, `updated_at`) VALUES
(6, 'Tenderheart Home Care', 'Singapoor', 5.00, 'Let your elderly live a Happy, Healthy, and Fulfilling life at home! \r\n\r\nFounded in August 2020, Tenderheart Home Care offers caregiver courses for foreign domestic helpers currently working in Hong Kong and wish to upgrade their career path. The four months (36 hours) training course is conducted by a Senior Registered Nurse from Hong Kong. ', 'Caregiver Training', 'http://localhost:5000/uploads/trainings/training-1758526698222-998514603.png', 'http://localhost:5000/uploads/trainings/training-1758526698217-260117639.png', '2025-09-22 07:38:18', '2025-09-22 07:38:18'),
(7, 'Dee Dream Life', 'Hong Kong', 5.00, 'Dee Dream Life is a community based provider of a high quality and affordable Zumba, Yoga, Dance, Fitness and Life Coaching for both adults and children. We aim to be your one-stop-shop holistic health solution.\r\n\r\nWe believe that fitness and fun activities should be affordable and accessible to all members of our society across Hong Kong, regardless of race, gender, sexual orientation and social status.\r\n\r\nDee Dream fitness is founded by Dee Oh, a passionate and highly experienced damce, fitness, yoga, life and career coach, she’s only not teaching correct forms of classes, but also inspire people to reach their maximum life potential.', 'Collective Classes\r\n', 'http://localhost:5000/uploads/trainings/training-1758528476542-925416296.png', 'http://localhost:5000/uploads/trainings/training-1758528476522-595650571.png', '2025-09-22 08:07:56', '2025-09-22 08:07:56');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
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
  `subscription` varchar(50) DEFAULT NULL,
  `plan_name` varchar(50) DEFAULT NULL,
  `plan_days` varchar(20) DEFAULT NULL,
  `plan_startdate` timestamp NULL DEFAULT NULL,
  `plan_enddate` timestamp NULL DEFAULT NULL,
  `payment_amount` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `agency_uid`, `email`, `agency_mail`, `mobile_number`, `password`, `first_name`, `last_name`, `role`, `location`, `language_preference`, `source`, `created_at`, `is_verified`, `last_login_date`, `last_notification_sent`, `subscription_plan_id`, `subscription`, `plan_name`, `plan_days`, `plan_startdate`, `plan_enddate`, `payment_amount`, `payment_status`) VALUES
(1, NULL, 'admin@gmail.com', NULL, '9381850288', 'admin@123', 'admin', '', 'admin', NULL, NULL, 'Direct', '2025-08-12 12:44:57', 1, '2025-10-07 14:17:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, NULL, 'saikrushnakadarla01@gmail.com', NULL, '', 'sai@123', 'Saikrishna', 'krishna', 'employer', 'Hong Kong', 'English', 'Direct', '2025-08-13 07:28:39', 1, '2025-10-07 20:29:40', NULL, 2, 'cost', NULL, '15', '2025-09-22 18:30:00', '2025-10-07 18:30:00', '200', 'Paid'),
(3, NULL, 'kadarlasaikrushna99@gmail.com', NULL, NULL, 'sai@123', 'Saikrishna', 'kadarla', 'job seeker', NULL, NULL, 'Direct', '2025-08-13 10:07:29', 1, '2025-10-07 19:20:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, NULL, 'kadarlasaikrushna01@gmail.com', NULL, NULL, 'sai@123', 'sai', 'krushna', 'job seeker', NULL, NULL, 'Direct', '2025-08-23 04:08:39', 1, '2025-09-18 12:13:28', '2025-09-05 19:16:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 2, 'asaikrishnachary@gmail.com', 'saikrushnakadarla99@gmail.com', NULL, 'sai@123', 'sai', 'krishna', 'job seeker', NULL, NULL, 'agency', '2025-08-23 10:33:39', 1, '2025-09-12 14:09:46', '2025-09-19 19:16:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, NULL, 'duvvamanoj123456789@gmail.com', NULL, NULL, 'manoj@123', 'manoj', 'duvva', 'job seeker', NULL, NULL, 'Direct', '2025-09-05 18:08:20', 1, '2025-09-06 00:26:04', '2025-10-06 19:16:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, NULL, 'pavanimyana2000@gmail.com', NULL, NULL, 'pavani@123', 'pavani', 'myana', 'job seeker', NULL, NULL, 'Direct', '2025-09-06 05:18:24', 1, '2025-09-06 10:48:29', '2025-10-06 19:16:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, NULL, 'myanapavani570@gmail.com', NULL, NULL, 'ramu@123', 'ramu', 'ram', 'job seeker', NULL, NULL, 'Direct', '2025-09-12 14:06:49', 1, '2025-09-12 22:08:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, NULL, 'mogilojinaveen123@gmail.com', NULL, NULL, 'naveen123', 'naveen', 'mogiloju', 'job seeker', NULL, NULL, 'Direct', '2025-09-12 14:16:51', 1, '2025-09-12 20:09:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, NULL, 'amarendravangala@gmail.com', NULL, NULL, 'amarendra@123', 'ramu', 'kadarla', 'employer', NULL, NULL, 'Direct', '2025-10-04 11:09:33', 1, '2025-10-04 16:45:47', NULL, 2, 'cost', 'Silver', '15', '2025-10-03 18:30:00', '2025-10-18 18:30:00', '200', 'Paid');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `candidate_report`
--
ALTER TABLE `candidate_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `doctor_profile`
--
ALTER TABLE `doctor_profile`
  MODIFY `dtr_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `employer`
--
ALTER TABLE `employer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `job_position`
--
ALTER TABLE `job_position`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `job_reports`
--
ALTER TABLE `job_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_seekers`
--
ALTER TABLE `job_seekers`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `mails_table`
--
ALTER TABLE `mails_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `shortlist`
--
ALTER TABLE `shortlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tips`
--
ALTER TABLE `tips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `trainings`
--
ALTER TABLE `trainings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
