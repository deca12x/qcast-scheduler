"use client";

import { NeynarAuthButton, useNeynarContext } from "@neynar/react";
import Image from "next/image";
import { useState, useRef } from "react";

export default function Home() {
  const { user } = useNeynarContext();
  const [isLoading, setIsLoading] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  const handleCastClick = async () => {
    if (user) {
      setIsLoading(true);

      const file = inputFile.current?.files?.[0];
      const formData = new FormData();
      formData.append("user", JSON.stringify(user));
      if (file) {
        formData.append("file", file);
      }

      try {
        const res = await fetch("/api/route", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        console.log(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("User is not authenticated");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          qcast
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <NeynarAuthButton />

        {user && (
          <>
            <div className="flex flex-col gap-4 w-96 p-4 rounded-md shadow-md">
              <div className="flex items-center gap-4">
                {user.pfp_url && (
                  <Image
                    src={user.pfp_url}
                    width={40}
                    height={40}
                    alt="User Profile Picture"
                    className="rounded-full"
                  />
                )}
                <p className="text-lg font-semibold">{user?.display_name}</p>
                <p className="text-lg font-semibold">{user?.fid}</p>
              </div>
              <input type="file" ref={inputFile} />
              <button
                onClick={handleCastClick}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? "Posting..." : "Post Cast"}
              </button>
            </div>
          </>
        )}

        <a
          href="https://github.com/deca12x/qcast-scheduler"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Github repo{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-balance text-sm opacity-50">
            q your casts
          </p>
        </a>
      </div>
    </main>
  );
}
