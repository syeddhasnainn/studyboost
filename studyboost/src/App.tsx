"use client";

import { Routes } from "react-router";

import { Route } from "react-router";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";

// import { Authenticated, Unauthenticated } from "convex/react";
// import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </>
  );
}

// function SignInForm() {
//   return (
//     <div className="flex flex-col gap-8 w-96 mx-auto">
//       <p>Log in to see the numbers</p>
//       <SignInButton mode="modal">
//         <button className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2">
//           Sign in
//         </button>
//       </SignInButton>
//       <SignUpButton mode="modal">
//         <button className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2">
//           Sign up
//         </button>
//       </SignUpButton>
//     </div>
//   );
// }
