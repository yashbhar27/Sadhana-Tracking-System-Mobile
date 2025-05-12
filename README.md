# Sadhana Tracking System

A comprehensive web application for tracking daily devotional activities in spiritual communities.

## Features

- **User Authentication**: Secure system access with unique auth codes
- **Devotee Management**: Add, edit, and track resident and non-resident devotees
- **Activity Tracking**: Monitor daily spiritual activities including Mangla Arti, Japa, and Lectures
- **Reporting**: Generate detailed individual and overall performance reports
- **Admin Controls**: Secure administrative functions with password protection
- **Data Management**: Import/Export capabilities via CSV

## Tech Stack

- React with TypeScript
- Supabase Backend
- Tailwind CSS
- Vite Build Tool

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Environment Setup

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
