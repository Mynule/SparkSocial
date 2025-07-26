# Spark - A Twitter(X) Clone

## Overview
Spark is a Twitter(X) clone built with Laravel and React. It provides users with a seamless microblogging experience, including features like posting tweets, following other users, liking and retweeting posts, and real-time updates.

## Tech Stack
- **Backend:** Laravel (PHP), MySQL
- **Frontend:** React, Tailwind CSS
- **Additional tools:** Docker, Docker Compose, bash

## Features
- User authentication (login/register/logout)
- Create, edit, and delete tweets
- Like and retweet posts
- Follow and unfollow users
- Real-time notifications
- User profiles with bio and tweet history
- Search for users and tweets
- Image and media uploads

## Installation

### Prerequisites
Ensure you have the following installed:
- PHP 8+
- Composer
- Node.js & npm
- MySQL
- Laravel CLI

### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/spark.git
   cd spark
   ```
2. Install dependencies:
   ```sh
   composer install
   ```
3. Set up the `.env` file:
   ```sh
   cp .env.example .env
   ```
4. Generate the application key:
   ```sh
   php artisan key:generate
   ```
5. Configure the database:
    - Open `.env`
    - Set up database credentials
   ```env
   DB_DATABASE=spark_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```
6. Run migrations:
   ```sh
   php artisan migrate --seed
   ```
7. Start the Laravel server:
   ```sh
   php artisan serve
   ```

### Frontend Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

## API Routes
The backend provides a RESTful API to interact with Spark. The API follows REST conventions and uses Laravel Sanctum for authentication.

### Example Endpoints
- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `GET /api/tweets` - Fetch all tweets
- `POST /api/tweets` - Create a new tweet
- `POST /api/tweets/{id}/like` - Like a tweet
- `POST /api/tweets/{id}/retweet` - Retweet a tweet

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository
2. Create a new branch (`feature-branch`)
3. Make your changes and commit
4. Push to your fork and create a pull request

## License
This project is open-source and available under the MIT License.

## Contact
For any issues, feel free to open an issue on GitHub or reach out to me at `shapovalovtimur16@gmail.com`.


