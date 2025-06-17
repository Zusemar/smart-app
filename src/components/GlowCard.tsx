import * as React from "react"
import clsx from "clsx"

export function GlowCard({children, className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={clsx(
        "flex items-center justify-center rounded-full w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-cyan-400 to-green-400 text-xl sm:text-2xl font-bold text-white shadow-[0_0_120px_15px_rgba(6,182,212,0.7)] border-black border-4 transition hover:scale-105 hover:shadow-2xl break-words text-center p-4",
        className
      )}
    >
      {children}
    </div>
  )
}