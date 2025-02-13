"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/app/components/ui/button";


export function Appbar() {
  const session = useSession();

  return (
    <div className="flex justify-between px-2 pt-4">
     <h1 className="text-3xl font-bold text-white">
          Stream
          <span className="text-purple-700">S</span>ync
        </h1>
      <div>
        {session.data?.user ? (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signOut()}
            size={"lg"}
          >
            Logout
          </Button>
        ) : (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signIn()}
          >
            Signin
          </Button>
        )}
      </div>
    </div>
  );
}
