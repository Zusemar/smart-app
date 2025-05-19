// app/layout.tsx

import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Трекер тренировок',
  description: 'Фитнес-приложение в балдежном стиле'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#182642] via-[#10151a] to-[#11171e] text-zinc-100">
        {/* Светящаяся “аура” по краям */}
        <div className="fixed inset-0 pointer-events-none z-[-1]">
          <div className="absolute left-1/2 top-[-8rem] -translate-x-1/2 w-[60vw] h-[36vw] rounded-full blur-2xl bg-gradient-to-tr from-[#23a6d5] via-[#2ebfa5] to-transparent opacity-40" />
          <div className="absolute right-[-8rem] bottom-20 w-1/2 h-60 rounded-full blur-2xl bg-gradient-to-tl from-cyan-400 via-blue-700 to-transparent opacity-30" />
          <div className="absolute left-[-8rem] bottom-[-8rem] w-[30vw] h-80 rounded-full blur-2xl bg-gradient-to-tr from-emerald-500 to-transparent opacity-25" />
        </div>

        {/* Контейнер для страниц */}
        <main className="relative flex flex-col min-h-screen items-center justify-start px-4 py-10 sm:px-8">
          <div className="w-full max-w-4xl">
            {/* Тут можно вставить навбар/лого если надо */}
            <header className="mb-12 flex justify-center">
              <span className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 drop-shadow">Трекер тренировок</span>
            </header>
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}