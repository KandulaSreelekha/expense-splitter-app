# SplitMate

**SplitMate** is a modern web application for tracking shared expenses, managing groups, and settling up with friends, roommates, or colleagues. It’s designed to make splitting bills and keeping track of who owes what simple and intuitive.

---

## Features

- **User Authentication:** Secure sign-up and sign-in.
- **Dashboard:** Overview of your balances, recent expenses, and settlements.
- **Contacts:** Add and manage people you split expenses with.
- **Groups:** Create groups (e.g., roommates, trips) and add members.
- **Expenses:** Add new expenses, split them equally or by custom amounts, and assign to groups or individuals.
- **Settlements:** Settle up debts with friends or within groups.
- **Search & Add Members:** Easily search for users by email or username when creating groups or adding participants to expenses.
- **Responsive UI:** Clean, modern interface built with React, Next.js, and shadcn/ui components.

---

## Tech Stack

- **Frontend:** React, Next.js, shadcn/ui, Tailwind CSS
- **Backend:** Convex (serverless database and functions)
- **Authentication:** Clerk (or similar, depending on your setup)
- **Deployment:** Vercel

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/splitmate.git
cd splitmate
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory and add the required environment variables for your authentication provider (e.g., Clerk), Convex, etc. Example:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CONVEX_DEPLOYMENT_URL=your_convex_url
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

---

## Usage

1. **Sign Up / Sign In:** Create an account or log in.
2. **Complete Your Profile:** Add your name and email.
3. **Add Contacts:** Search for friends by email or username and add them as contacts.
4. **Create a Group:** Go to the Groups section, create a new group, and add members.
5. **Add Expenses:** In a group or with an individual, add expenses, choose how to split, and assign who paid.
6. **Settle Up:** View balances and settle debts with a single click.
7. **Dashboard:** Get an overview of your financial activity.

---

## Project Structure

```
SplitMate/
  app/                # Next.js app directory
    (auth)/           # Authentication pages
    (main)/           # Main app pages (dashboard, contacts, groups, etc.)
    components/       # Shared UI components
    convex/           # Convex backend functions and schema
    hooks/            # Custom React hooks
    lib/              # Utility libraries
    public/           # Static assets
```

---

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them.
4. Push to your fork and submit a pull request.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

- [Convex](https://convex.dev/)
- [Clerk](https://clerk.com/)
- [Vercel](https://vercel.com/)

---

**SplitMate** makes splitting expenses easy, transparent, and fair.  
If you have questions or suggestions, feel free to open an issue or contribute!
