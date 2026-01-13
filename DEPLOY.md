# Deployment Instructions

This project uses **Supabase** for Backend-as-a-Service (Database & Auth & Storage).

## 1. Supabase Setup

1.  **Create a Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Database Schema**:
    *   Go to the **SQL Editor** in your Supabase dashboard.
    *   Copy the content of `DB_SCHEMA.sql` from this repository and run it.
    *   This will create all necessary tables (`users`, `subjects`, `resources`, etc.) and the storage bucket.
3.  **Environment Variables**:
    *   Go to **Project Settings** -> **API**.
    *   Copy the `URL` and `anon` public key.

## 2. Local Development

1.  Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
2.  **Seed Data**:
    *   Run the seed script to populate initial subjects and admin users.
    *   `node seed.js`
    *   *Note: This creates users with password "admin123".*
3.  **Run**:
    *   `npm run dev`

## 3. Vercel Deployment

1.  **Push to GitHub**:
    *   Commit your changes including `DB_SCHEMA.sql` and `seed.js`.
2.  **Import in Vercel**:
    *   Import the repository.
3.  **Environment Variables**:
    *   In the Vercel deployment settings (or Project Settings), add the following Environment Variables:
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4.  **Deploy**:
    *   Click Deploy.
5.  **Post-Deploy**:
    *   If you haven't run the seed locally against the production database, you can run it locally pointing to the prod Supabase URL in your `.env.local`, or run the SQL manually.

## 4. Updates

*   The application now stores files in Supabase Storage bucket `uploads`.
*   Authentication is handled via the `users` table manually (not Supabase Auth users) to match the legacy requirements, but uses robust bcrypt hashing.
